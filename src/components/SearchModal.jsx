import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import ProductCard from './ProductCard';
import { fetchProducts, getInitialProducts } from '../supabase/products';
import { CATEGORY_GROUPS, getCategoryDisplayName, getCategoryGroupId } from '../utils/categories';

export default function SearchModal({ isOpen, onClose, onAddToCart, onWishlist, wishlist, onCardClick }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState(() => getInitialProducts({ onlyActive: true, limit: 100 }));
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const loadProducts = async () => {
        try {
          const result = await fetchProducts({ onlyActive: true, limit: 100, fallbackOnError: true });
          setProducts(result.products);
        } catch (error) {
          console.error('Erreur chargement recherche:', error);
        }
      };
      loadProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const results = query.trim().length >= 2
    ? products.filter((p) => {
      const normalizedQuery = query.toLowerCase();
      const group = CATEGORY_GROUPS.find((item) => item.id === getCategoryGroupId(p.category));
      return (
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.category.toLowerCase().includes(normalizedQuery) ||
        getCategoryDisplayName(p.category).toLowerCase().includes(normalizedQuery) ||
        group?.label.toLowerCase().includes(normalizedQuery) ||
        p.colors.some((c) => c.toLowerCase().includes(normalizedQuery))
      );
    })
    : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#1C2340]/40 transition-sheet"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Rechercher des produits"
        className="fixed top-0 left-0 right-0 z-50 bg-white transition-sheet"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
          maxHeight: '80vh',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 16px 48px rgba(28,35,64,0.2)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#F9D7DA]">
          <Search size={20} color="#9CA3AF" strokeWidth={1.8} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit, une categorie..."
            aria-label="Champ de recherche"
            className="flex-1 font-sans text-[#1C2340] placeholder-[#9CA3AF] outline-none bg-transparent"
            style={{ fontSize: '16px', height: '40px' }}
          />
          <button
            id="search-close-btn"
            onClick={onClose}
            aria-label="Fermer la recherche"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#FDE8EC] transition-colors"
          >
            <X size={20} color="#1C2340" strokeWidth={1.8} />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto overscroll-contain flex-1 px-4 py-4">
          {query.trim().length < 2 ? (
            <div className="text-center py-10">
              <p className="font-sans text-[#9CA3AF]" style={{ fontSize: '14px' }}>
                Tapez au moins 2 caracteres pour rechercher
              </p>
              {/* Quick category links */}
              <div className="flex flex-wrap gap-2 justify-center mt-5">
                {[...CATEGORY_GROUPS, ...CATEGORY_GROUPS.flatMap((group) => group.subcategories)].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setQuery(c.label)}
                    className="rounded-full border border-[#EBB4BB] font-sans text-[#1C2340] px-4 hover:bg-[#FDE8EC] transition-colors"
                    style={{ height: '34px', fontSize: '13px' }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10">
              <p className="font-serif text-[#9CA3AF]" style={{ fontSize: '18px' }}>
                Aucun resultat pour &laquo; {query} &raquo;
              </p>
            </div>
          ) : (
            <>
              <p className="font-sans text-[#9CA3AF] mb-4" style={{ fontSize: '13px' }}>
                {results.length} resultat{results.length !== 1 ? 's' : ''} pour &laquo; {query} &raquo;
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {results.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onWishlist={onWishlist}
                    isWishlisted={wishlist.includes(product.id)}
                    onCardClick={(p) => { onCardClick(p); onClose(); }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
