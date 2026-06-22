import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from './ProductCard';
import { fetchProducts, getInitialProducts } from '../supabase/products';
import {
  ALL_CATEGORY_FILTER,
  MAIN_CATEGORY_FILTERS,
  getCategoryDisplayName,
  getCategoryGroupByFilterId,
  matchesCategoryFilter,
} from '../utils/categories';
import { COLOR_PALETTE, getProductColorOptions } from '../utils/productVariants';

const MAIN_CATEGORIES = [ALL_CATEGORY_FILTER, ...MAIN_CATEGORY_FILTERS];
const SORT_OPTIONS = [
  { label: 'Nouveautes', value: 'new' },
  { label: 'Prix croissant', value: 'price-asc' },
  { label: 'Prix decroissant', value: 'price-desc' },
  { label: 'Promotions', value: 'promo' },
];

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '85B', '90C', '95D'];

function FilterBottomSheet({ isOpen, onClose, filters, setFilters, maxPrice, colorOptions }) {
  const [local, setLocal] = useState({ ...filters });

  useEffect(() => {
    if (isOpen) setLocal({ ...filters });
  }, [filters, isOpen]);

  function apply() {
    setFilters(local);
    onClose();
  }

  function reset() {
    const clean = { priceMax: null, sizes: [], colors: [] };
    setLocal(clean);
    setFilters(clean);
  }

  function toggleArr(key, val) {
    setLocal((prev) => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? prev[key].filter((v) => v !== val)
        : [...prev[key], val],
    }));
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[#1C2340]/30 transition-sheet"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtres avances"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl transition-sheet overscroll-contain"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(105%)',
          maxHeight: '85vh',
          overflow: 'auto',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        {/* Handle + header */}
        <div className="sticky top-0 bg-white pt-4 px-5 pb-3 z-10">
          <div className="mx-auto w-10 h-1 rounded-full bg-[#EBB4BB] mb-4" />
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-[#1C2340]" style={{ fontSize: '20px', fontWeight: 600 }}>
              Filtres
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={reset}
                className="font-sans text-[#9CA3AF] underline"
                style={{ fontSize: '14px' }}
              >
                Reinitialiser
              </button>
              <button onClick={onClose} aria-label="Fermer" className="p-1">
                <X size={20} color="#1C2340" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-6 space-y-7">
          {/* Price range */}
          <div>
            <p className="font-sans font-semibold text-[#1C2340] mb-3" style={{ fontSize: '15px' }}>
              Prix maximum
            </p>
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={100}
              value={local.priceMax ?? maxPrice}
              onChange={(e) => setLocal((p) => ({ ...p, priceMax: Number(e.target.value) }))}
              className="w-full"
              aria-label={`Prix maximum : ${(local.priceMax ?? maxPrice).toLocaleString('fr-DZ')} DZD`}
            />
            <div className="flex justify-between mt-1">
              <span className="font-sans text-[#9CA3AF]" style={{ fontSize: '13px' }}>0 DZD</span>
              <span className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '13px' }}>
                {(local.priceMax ?? maxPrice).toLocaleString('fr-DZ')} DZD
              </span>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="font-sans font-semibold text-[#1C2340] mb-3" style={{ fontSize: '15px' }}>
              Taille
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((s) => {
                const active = local.sizes.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleArr('sizes', s)}
                    aria-pressed={active}
                    className="rounded-full border font-sans font-medium transition-all duration-150"
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      background: active ? '#1C2340' : 'transparent',
                      color: active ? '#fff' : '#1C2340',
                      borderColor: active ? '#1C2340' : '#EBB4BB',
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div>
            <p className="font-sans font-semibold text-[#1C2340] mb-3" style={{ fontSize: '15px' }}>
              Couleur
            </p>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => {
                const active = local.colors.includes(color.value);
                const needsDarkBorder = ['#FFFFFF', '#FFF', '#F8F8F8', '#FFF8E7'].includes(color.hex.toUpperCase());
                return (
                  <button
                    key={color.value}
                    onClick={() => toggleArr('colors', color.value)}
                    aria-pressed={active}
                    aria-label={color.name}
                    title={color.name}
                    className="rounded-full transition-all duration-150"
                    style={{
                      width: '32px',
                      height: '32px',
                      background: color.hex,
                      border: active
                        ? '3px solid #1C2340'
                        : `2px solid ${needsDarkBorder ? '#D1D5DB' : '#EBB4BB'}`,
                      outline: active ? '2px solid white' : 'none',
                      outlineOffset: '-4px',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Apply button */}
        <div className="sticky bottom-0 bg-white border-t border-[#FDE8EC] px-5 py-4">
          <button
            id="filter-apply-btn"
            onClick={apply}
            className="w-full bg-[#1C2340] text-white font-sans font-semibold rounded-full hover:bg-[#2D375F] transition-colors duration-200"
            style={{ height: '52px', fontSize: '15px', letterSpacing: '0.04em' }}
          >
            Appliquer les filtres
          </button>
        </div>
      </div>
    </>
  );
}

export default function ProductCatalog({
  onAddToCart,
  onWishlist,
  wishlist,
  onCardClick,
  initialCategory,
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory || ALL_CATEGORY_FILTER.id);
  const [activeSort, setActiveSort] = useState('new');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [advFilters, setAdvFilters] = useState({ priceMax: null, sizes: [], colors: [] });
  const [products, setProducts] = useState(() => getInitialProducts({ onlyActive: true, limit: 1000 }));

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await fetchProducts({ onlyActive: true, limit: 1000, fallbackOnError: true });
        setProducts(result.products);
      } catch (error) {
        console.error('Erreur chargement produits:', error);
      }
    };
    loadProducts();
  }, []);

  // Sync external category changes
  useEffect(() => {
    setActiveCategory(initialCategory || ALL_CATEGORY_FILTER.id);
  }, [initialCategory]);

  const filtered = useMemo(() => {
    let list = [...products];

    // Category
    if (activeCategory !== ALL_CATEGORY_FILTER.id) {
      list = list.filter((p) => matchesCategoryFilter(p.category, activeCategory));
    }

    // Advanced filters
    if (advFilters.priceMax !== null && advFilters.priceMax !== undefined) {
      list = list.filter((p) => p.price <= advFilters.priceMax);
    }
    if (advFilters.sizes.length > 0) {
      list = list.filter((p) => advFilters.sizes.some((s) => p.sizes.includes(s)));
    }
    if (advFilters.colors.length > 0) {
      list = list.filter((p) => {
        const productColors = getProductColorOptions(p).map((color) => color.color);
        return advFilters.colors.some((c) => productColors.includes(c));
      });
    }

    // Sort
    switch (activeSort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'promo': list.sort((a, b) => (b.badge === 'promo' ? 1 : 0) - (a.badge === 'promo' ? 1 : 0)); break;
      case 'new': list.sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0)); break;
      default: break;
    }

    return list;
  }, [products, activeCategory, activeSort, advFilters]);

  const colorOptions = useMemo(() => {
    const options = new Map(COLOR_PALETTE.map((color) => [color.value, color]));

    products.forEach((product) => {
      getProductColorOptions(product).forEach((color) => {
        if (!color.color || options.has(color.color)) return;
        options.set(color.color, {
          value: color.color,
          name: color.colorName || color.color,
          hex: color.colorHex,
        });
      });
    });

    return Array.from(options.values());
  }, [products]);

  const maxCatalogPrice = Math.max(10000, ...products.map((p) => Number(p.price) || 0));
  const hasActiveFilters = advFilters.sizes.length > 0 || advFilters.colors.length > 0 || advFilters.priceMax !== null;
  const activeGroup = getCategoryGroupByFilterId(activeCategory);
  const visibleSubcategories = activeGroup?.subcategories || [];

  return (
    <section id="catalog" className="py-12 max-w-screen-xl mx-auto px-4">
      {/* Title */}
      <div className="text-center mb-6" data-reveal="soft">
        <h2
          className="font-serif text-[#1C2340]"
          style={{ fontSize: '22px', letterSpacing: '0.08em', fontWeight: 600 }}
        >
          Acheter Nos Pieces
        </h2>
        <p
          className="font-sans text-[#9CA3AF] mt-1 italic"
          style={{ fontSize: '15px' }}
        >
          Filtrez, choisissez votre taille et ajoutez au panier
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1" data-reveal="soft">
        {/* Filtres button */}
        <button
          id="open-filters-btn"
          onClick={() => setFilterSheetOpen(true)}
          className="flex-none flex items-center gap-1.5 rounded-full border font-sans font-semibold transition-all duration-150 md:hidden"
          style={{
            padding: '8px 14px',
            fontSize: '13px',
            background: hasActiveFilters ? '#1C2340' : 'white',
            color: hasActiveFilters ? 'white' : '#1C2340',
            borderColor: hasActiveFilters ? '#1C2340' : '#EBB4BB',
            height: '38px',
          }}
          aria-label={`Filtres${hasActiveFilters ? ' (actifs)' : ''}`}
        >
          <SlidersHorizontal size={14} strokeWidth={1.8} />
          Filtres
        </button>

        {/* Category chips */}
        <div className="flex items-center gap-2 flex-none">
          {MAIN_CATEGORIES.map((cat) => {
            const selectedGroup = getCategoryGroupByFilterId(activeCategory);
            const active = activeCategory === cat.id || (!!cat.groupId && selectedGroup?.id === cat.groupId);
            return (
              <button
                key={cat.id}
                id={`filter-cat-${cat.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setActiveCategory(cat.id)}
                className="flex-none rounded-full border font-sans font-medium transition-all duration-150"
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  height: '38px',
                  background: active ? '#1C2340' : 'white',
                  color: active ? '#fff' : '#1C2340',
                  borderColor: active ? '#1C2340' : '#EBB4BB',
                  whiteSpace: 'nowrap',
                }}
                aria-pressed={active}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Sort chips */}
        <div className="flex items-center gap-2 flex-none ml-2 pl-2 border-l border-[#EBB4BB]">
          {SORT_OPTIONS.map((opt) => {
            const active = activeSort === opt.value;
            return (
              <button
                key={opt.value}
                id={`sort-${opt.value}`}
                onClick={() => setActiveSort(opt.value)}
                className="flex-none rounded-full border font-sans font-medium transition-all duration-150"
                style={{
                  padding: '8px 14px',
                  fontSize: '13px',
                  height: '38px',
                  background: active ? '#F9D7DA' : 'transparent',
                  color: '#1C2340',
                  borderColor: active ? '#EBB4BB' : '#EBB4BB',
                  whiteSpace: 'nowrap',
                }}
                aria-pressed={active}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {visibleSubcategories.length > 1 && (
        <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1" data-reveal="soft">
          {visibleSubcategories.map((subcategory) => {
            const active = activeCategory === subcategory.id;
            return (
              <button
                key={subcategory.id}
                id={`filter-subcat-${subcategory.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setActiveCategory(subcategory.id)}
                className="flex-none rounded-full border font-sans font-medium transition-all duration-150"
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  height: '34px',
                  background: active ? '#B56A78' : '#FFF7F8',
                  color: active ? '#FFFFFF' : '#8F4A58',
                  borderColor: active ? '#B56A78' : '#F5C6CB',
                  whiteSpace: 'nowrap',
                  boxShadow: active ? '0 4px 12px rgba(181,106,120,0.22)' : 'none',
                }}
                aria-pressed={active}
              >
                {getCategoryDisplayName(subcategory.id)}
              </button>
            );
          })}
        </div>
      )}

      {/* Count */}
      <p className="font-sans text-[#9CA3AF] mb-4" style={{ fontSize: '13px' }}>
        {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif text-[#9CA3AF]" style={{ fontSize: '20px' }}>
            Aucun produit ne correspond aux filtres
          </p>
          <button
            onClick={() => { setActiveCategory(ALL_CATEGORY_FILTER.id); setAdvFilters({ priceMax: null, sizes: [], colors: [] }); }}
            className="mt-4 font-sans text-[#1C2340] underline"
            style={{ fontSize: '14px' }}
          >
            Reinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((product) => (
            <div
              key={product.id}
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onWishlist={onWishlist}
                isWishlisted={wishlist.includes(product.id)}
                onCardClick={onCardClick}
              />
            </div>
          ))}
        </div>
      )}

      {/* Filter bottom sheet */}
      <FilterBottomSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={advFilters}
        setFilters={setAdvFilters}
        maxPrice={maxCatalogPrice}
        colorOptions={colorOptions}
      />
    </section>
  );
}
