import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { fetchProducts, getInitialProducts } from '../supabase/products';

export default function NouveautesCarousel({ onAddToCart, onWishlist, wishlist, onCardClick }) {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState(() => getInitialProducts({ onlyActive: true, limit: 50 }));

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await fetchProducts({ onlyActive: true, limit: 50, fallbackOnError: true });
        setProducts(result.products);
      } catch (error) {
        console.error('Erreur chargement nouveautes:', error);
      }
    };
    loadProducts();
  }, []);

  const nouveautes = products.filter((p) => p.badge === 'new');

  function scroll(dir) {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('article')?.offsetWidth ?? 200;
    el.scrollBy({ left: dir * (cardWidth + 12), behavior: 'smooth' });
  }

  return (
    <section id="nouveautes" className="py-12 soft-band">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6" data-reveal="soft">
          <div>
            <h2
              className="font-serif text-[#1C2340]"
              style={{ fontSize: '22px', letterSpacing: '0.08em', fontWeight: 600 }}
            >
              Nouveautes
            </h2>
            <p
              className="font-sans text-[#9CA3AF] italic mt-0.5"
              style={{ fontSize: '14px' }}
            >
              Fraichement arrives dans la boutique
            </p>
          </div>

          {/* Desktop arrow buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              id="nouveautes-prev"
              aria-label="Precedent"
              onClick={() => scroll(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[#EBB4BB] bg-white hover:bg-[#F9D7DA] transition-colors duration-200"
            >
              <ChevronLeft size={18} color="#1C2340" strokeWidth={1.8} />
            </button>
            <button
              id="nouveautes-next"
              aria-label="Suivant"
              onClick={() => scroll(1)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[#EBB4BB] bg-white hover:bg-[#F9D7DA] transition-colors duration-200"
            >
              <ChevronRight size={18} color="#1C2340" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollPaddingLeft: '0px' }}
        >
          {nouveautes.map((product, index) => (
            <div
              key={product.id}
              className={`flex-none snap-start stagger-${Math.min(index + 1, 5)}`}
              data-reveal="soft"
              style={{ width: 'clamp(160px, 44vw, 220px)' }}
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
      </div>
    </section>
  );
}
