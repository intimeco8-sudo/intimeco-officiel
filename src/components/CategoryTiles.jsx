
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORY_GROUPS, getMainCategoryFilterId } from '../utils/categories';

const CATEGORIES = [
  {
    id: getMainCategoryFilterId('sous-vetements'),
    groupId: 'sous-vetements',
    label: 'Sous vetements',
    kicker: 'Essentiels intimes',
    bg: 'linear-gradient(135deg, #F5C6CB 0%, #FFF7F8 100%)',
    accent: '#1C2340',
  },
  {
    id: getMainCategoryFilterId('tenues-de-nuit'),
    groupId: 'tenues-de-nuit',
    label: 'Tenues de nuit',
    kicker: 'Douceur du soir',
    bg: 'linear-gradient(135deg, #1C2340 0%, #5A6080 100%)',
    accent: '#F9D7DA',
  },
  {
    id: getMainCategoryFilterId('others'),
    groupId: 'others',
    label: 'Others',
    kicker: 'Pieces speciales',
    bg: 'linear-gradient(135deg, #FFF7F8 0%, #EBB4BB 100%)',
    accent: '#1C2340',
  },
].map((category) => ({
  ...category,
  subcategories: CATEGORY_GROUPS.find((group) => group.id === category.groupId)?.subcategories || [],
}));

export default function CategoryTiles({ onCategorySelect, activeCategory }) {
  const trackRef = useRef(null);

  const scrollCarousel = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const cardWidth = track.querySelector('.collection-card')?.getBoundingClientRect().width || 280;
    track.scrollBy({ left: direction * (cardWidth + 14), behavior: 'smooth' });
  };

  return (
    <section id="categories" className="collection-section py-14 px-4 max-w-screen-xl mx-auto">
      <div className="collection-heading mb-7" data-reveal="soft">
        <div>
          <h2
            className="font-serif text-[#1C2340]"
            style={{ fontSize: '26px', fontWeight: 600 }}
          >
            Nos Collections
          </h2>
          <p
            className="font-sans text-[#5A6080] mt-1"
            style={{ fontSize: '14px' }}
          >
            Choisissez une categorie et trouvez votre piece
          </p>
        </div>
        <div className="collection-controls" aria-label="Navigation collections">
          <button type="button" onClick={() => scrollCarousel(-1)} aria-label="Collection precedente">
            <ChevronLeft size={18} strokeWidth={1.8} />
          </button>
          <button type="button" onClick={() => scrollCarousel(1)} aria-label="Collection suivante">
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="collection-carousel scrollbar-hide" aria-label="Collections">
        {CATEGORIES.map((cat, index) => {
          const isActive = activeCategory === cat.id;
          return (
            <div
              key={cat.id}
              id={`cat-tile-${cat.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              role="button"
              tabIndex={0}
              onClick={() => onCategorySelect(isActive ? null : cat.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCategorySelect(isActive ? null : cat.id); } }}
              className={`category-tile collection-card rounded-lg overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C2340] focus:ring-offset-2 stagger-${Math.min(index + 1, 5)}`}
              data-reveal="soft"
              style={{
                background: cat.bg,
                boxShadow: isActive
                  ? '0 0 0 3px #1C2340, 0 6px 24px rgba(28,35,64,0.18)'
                  : '0 4px 16px rgba(28,35,64,0.08)',
              }}
              aria-pressed={isActive}
              aria-label={cat.label}
            >
              <div className="collection-card__shine" aria-hidden="true" />
              <div className="collection-card__content">
                <div>
                  <span
                    className="font-sans uppercase"
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: cat.accent,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {cat.kicker}
                  </span>
                  <h3
                    className="font-serif leading-tight mt-1"
                    style={{
                      fontSize: '22px',
                      fontWeight: 600,
                      color: cat.accent,
                    }}
                  >
                    {cat.label}
                  </h3>
                  <p
                    className="font-sans mt-2"
                    style={{
                      fontSize: '12px',
                      color: cat.accent,
                      opacity: 0.78,
                    }}
                  >
                    {cat.subcategories.map((subcategory) => subcategory.label).join(' / ')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
