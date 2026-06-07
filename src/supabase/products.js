import { supabase } from './client';
import { deleteProductImages } from './storage';

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

    const { data, error, count } = await query;

    if (error) throw error;

    return { products: data || [], total: count || 0 };
}

export async function fetchProductById(id) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function createProduct(product) {
    const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateProduct(id, updates) {
    const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteProduct(id) {
    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('images')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    await deleteProductImages(product?.images);

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
