
const CATEGORIES = [
  {
    id: 'Soutien-gorge',
    label: 'Soutien-gorge',
    bg: 'linear-gradient(135deg, #F5C6CB 0%, #EBB4BB 100%)',
    accent: '#1C2340',
    pattern: 'M12 4a8 8 0 0 0-8 8c0 4 8 12 8 12s8-8 8-12a8 8 0 0 0-8-8z',
  },
  {
    id: 'Ensembles',
    label: 'Ensembles',
    bg: 'linear-gradient(135deg, #1C2340 0%, #2D375F 100%)',
    accent: '#F9D7DA',
    pattern: null,
  },
  {
    id: 'Culottes',
    label: 'Culottes',
    bg: 'linear-gradient(135deg, #FDE8EC 0%, #F9D7DA 100%)',
    accent: '#1C2340',
    pattern: null,
  },
  {
    id: 'Pyjamas',
    label: 'Pyjamas',
    bg: 'linear-gradient(135deg, #EBB4BB 0%, #F5C6CB 100%)',
    accent: '#1C2340',
    pattern: null,
  },
  {
    id: 'Nuisettes',
    label: 'Nuisettes',
    bg: 'linear-gradient(135deg, #2D375F 0%, #1C2340 100%)',
    accent: '#FDE8EC',
    pattern: null,
  },
  {
    id: 'Corsets',
    label: 'Corsets',
    bg: 'linear-gradient(135deg, #F9D7DA 0%, #EBB4BB 100%)',
    accent: '#1C2340',
    pattern: null,
  },
];

// Simple category illustration SVGs
function CategoryIllustration({ id, accent }) {
  const color = accent;
  const ops = { fill: 'none', stroke: color, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

  switch (id) {
    case 'Soutien-gorge':
      return (
        <svg viewBox="0 0 60 40" width="60" height="40" aria-hidden="true">
          <path d="M5 32C5 32 5 18 12 12C19 6 29 8 30 16C31 8 41 6 48 12C55 18 55 32 55 32Z" {...ops} />
          <path d="M13 12 L15 4" {...ops} />
          <path d="M47 12 L45 4" {...ops} />
        </svg>
      );
    case 'Ensembles':
      return (
        <svg viewBox="0 0 60 60" width="50" height="50" aria-hidden="true">
          <rect x="15" y="8" width="30" height="20" rx="4" {...ops} />
          <path d="M15 28 L10 55 L50 55 L45 28" {...ops} />
        </svg>
      );
    case 'Culottes':
      return (
        <svg viewBox="0 0 60 50" width="56" height="44" aria-hidden="true">
          <path d="M10 8 Q30 5 50 8 L55 42 Q40 48 30 40 Q20 48 5 42 Z" {...ops} />
        </svg>
      );
    case 'Pyjamas':
      return (
        <svg viewBox="0 0 60 70" width="48" height="56" aria-hidden="true">
          <rect x="12" y="6" width="36" height="26" rx="3" {...ops} />
          <path d="M12 32 L8 68 L26 68 L30 50 L34 68 L52 68 L48 32" {...ops} />
        </svg>
      );
    case 'Nuisettes':
      return (
        <svg viewBox="0 0 60 80" width="44" height="64" aria-hidden="true">
          <path d="M20 4 Q30 2 40 4 L50 78 L10 78 Z" {...ops} />
          <path d="M20 4 L16 1" {...ops} />
          <path d="M40 4 L44 1" {...ops} />
          <path d="M18 18 Q30 22 42 18" {...ops} />
        </svg>
      );
    case 'Corsets':
      return (
        <svg viewBox="0 0 60 70" width="48" height="56" aria-hidden="true">
          <path d="M12 8 Q30 4 48 8 L52 62 Q40 68 30 64 Q20 68 8 62 Z" {...ops} />
          <path d="M30 8 L30 62" {...ops} strokeDasharray="3 3" />
          <path d="M14 20 Q30 16 46 20" {...ops} />
          <path d="M14 34 Q30 30 46 34" {...ops} />
          <path d="M14 48 Q30 44 46 48" {...ops} />
        </svg>
      );
    default:
      return null;
  }
}

export default function CategoryTiles({ onCategorySelect, activeCategory }) {
  return (
    <section id="categories" className="py-12 px-4 max-w-screen-xl mx-auto">
      {/* Section title */}
      <div className="text-center mb-8" data-reveal="soft">
        <h2
          className="font-serif text-[#1C2340]"
          style={{ fontSize: '22px', letterSpacing: '0.08em', fontWeight: 600 }}
        >
          Nos Collections
        </h2>
        <p
          className="font-sans text-[#9CA3AF] mt-1 italic"
          style={{ fontSize: '15px' }}
        >
          Choisissez une categorie et trouvez votre piece
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
              className={`category-tile rounded-lg overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C2340] focus:ring-offset-2 stagger-${Math.min(index + 1, 5)}`}
              data-reveal="soft"
              style={{
                background: cat.bg,
                position: 'relative',
                paddingTop: '100%',
                boxShadow: isActive
                  ? '0 0 0 3px #1C2340, 0 6px 24px rgba(28,35,64,0.18)'
                  : '0 4px 16px rgba(28,35,64,0.08)',
              }}
              aria-pressed={isActive}
              aria-label={cat.label}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3"
              >
                <CategoryIllustration id={cat.id} accent={cat.accent} />
                <span
                  className="font-serif text-center leading-tight"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: cat.accent,
                    letterSpacing: '0.04em',
                  }}
                >
                  {cat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
