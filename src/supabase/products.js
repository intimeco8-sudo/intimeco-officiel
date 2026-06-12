import { supabase } from './client';
import { deleteProductImages } from './storage';
import { getProductVariantImages } from '../utils/productVariants';
import fallbackProducts from '../data/products.json';

const PRODUCT_CACHE_KEY = 'intime-products-cache-v1';
const DEFAULT_PRODUCTS_TIMEOUT_MS = 7000;

function normalizeProduct(product) {
    if (!product) return product;

    const price = Number.parseFloat(product.price);
    const originalPrice = product.original_price === null || product.original_price === undefined
        ? null
        : Number.parseFloat(product.original_price);

    return {
        ...product,
        price: Number.isFinite(price) ? price : 0,
        originalPrice: Number.isFinite(originalPrice) ? originalPrice : null,
        stock: Number.isFinite(Number.parseInt(product.stock, 10)) ? Number.parseInt(product.stock, 10) : 99,
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        colors: Array.isArray(product.colors) ? product.colors : [],
        images: Array.isArray(product.images) ? product.images : [],
    };
}

function getBrowserStorage() {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
        return null;
    }
}

function getCachedProducts() {
    const storage = getBrowserStorage();
    if (!storage) return [];

    try {
        const cached = JSON.parse(storage.getItem(PRODUCT_CACHE_KEY) || '[]');
        return Array.isArray(cached) ? cached.map(normalizeProduct) : [];
    } catch {
        return [];
    }
}

function cacheProducts(products) {
    const storage = getBrowserStorage();
    if (!storage || !Array.isArray(products) || products.length === 0) return;

    try {
        storage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(products));
    } catch {
        // Cache is only a speed boost; ignore quota/private-mode failures.
    }
}

function applyLocalFilters(products, options = {}) {
    const {
        category = null,
        minPrice = 0,
        maxPrice = 999999,
        sizes = [],
        colors = [],
        sortBy = 'created_at',
        ascending = false,
        offset = 0,
        limit = 12,
        onlyActive = true,
    } = options;
    let list = products.map(normalizeProduct);

    if (onlyActive !== null && onlyActive !== undefined) {
        list = list.filter((product) => product.is_active !== false);
    }

    if (category && category !== 'Tout') {
        list = list.filter((product) => product.category === category);
    }

    list = list.filter((product) => product.price >= minPrice && product.price <= maxPrice);

    if (sizes.length > 0) {
        list = list.filter((product) => sizes.some((size) => product.sizes.includes(size)));
    }

    if (colors.length > 0) {
        list = list.filter((product) => colors.some((color) => product.colors.includes(color)));
    }

    list.sort((a, b) => {
        const left = a?.[sortBy];
        const right = b?.[sortBy];

        if (left === right) return 0;
        if (left === undefined || left === null) return ascending ? 1 : -1;
        if (right === undefined || right === null) return ascending ? -1 : 1;

        return (left > right ? 1 : -1) * (ascending ? 1 : -1);
    });

    return {
        products: list.slice(offset, offset + limit),
        total: list.length,
    };
}

function withTimeout(promise, timeoutMs) {
    if (!timeoutMs) return promise;

    return Promise.race([
        promise,
        new Promise((_, reject) => {
            window.setTimeout(() => reject(new Error('Chargement des produits trop long')), timeoutMs);
        }),
    ]);
}

export function getInitialProducts(options = {}) {
    const cached = getCachedProducts();
    if (cached.length > 0) {
        return applyLocalFilters(cached, options).products;
    }

    return applyLocalFilters(fallbackProducts, options).products;
}

export function subscribeToProducts(callback) {
    const channel = supabase
        .channel('products-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'products',
            },
            (payload) => {
                callback(payload);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

export async function fetchProducts({
    category = null,
    minPrice = 0,
    maxPrice = 999999,
    sizes = [],
    colors = [],
    sortBy = 'created_at',
    ascending = false,
    offset = 0,
    limit = 12,
    onlyActive = true,
    timeoutMs = DEFAULT_PRODUCTS_TIMEOUT_MS,
    fallbackOnError = false,
}) {
    let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

    if (onlyActive !== null && onlyActive !== undefined) {
        query = query.eq('is_active', onlyActive);
    }

    if (category && category !== 'Tout') {
        query = query.eq('category', category);
    }

    query = query.gte('price', minPrice).lte('price', maxPrice);

    if (sizes.length > 0) {
        query = query.overlaps('sizes', sizes);
    }

    if (colors.length > 0) {
        query = query.overlaps('colors', colors);
    }

    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    try {
        const { data, error, count } = await withTimeout(query, timeoutMs);

        if (error) throw error;

        const products = (data || []).map(normalizeProduct);
        cacheProducts(products);

        return { products, total: count || 0 };
    } catch (error) {
        if (!fallbackOnError) throw error;

        const cached = getCachedProducts();
        const source = cached.length > 0 ? cached : fallbackProducts;

        return applyLocalFilters(source, {
            category,
            minPrice,
            maxPrice,
            sizes,
            colors,
            sortBy,
            ascending,
            offset,
            limit,
            onlyActive,
        });
    }
}

export async function fetchProductById(id) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return normalizeProduct(data);
}

export async function createProduct(product) {
    const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

    if (error) throw error;
    return normalizeProduct(data);
}

export async function updateProduct(id, updates) {
    const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return normalizeProduct(data);
}

export async function deleteProduct(id) {
    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('images, variant_options')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    await deleteProductImages([...(product?.images || []), ...getProductVariantImages(product)]);

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function toggleProductActive(id, isActive) {
    const { data, error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateProductStock(id, quantity) {
    const { data, error } = await supabase
        .from('products')
        .update({ stock: quantity })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function decrementProductStock(productId, quantity) {
    const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

    if (product) {
        const newStock = Math.max(0, product.stock - quantity);
        await updateProductStock(productId, newStock);
    }
}
