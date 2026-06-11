import BotanicalSVG from './BotanicalSVG';

export default function PromoBanner() {
  return (
    <section
      className="relative overflow-hidden py-12 px-6"
      style={{ background: 'linear-gradient(135deg, #11162B 0%, #1C2340 55%, #2D375F 100%)' }}
    >
      {/* Botanical decorations */}
      <div className="absolute top-0 left-0 pointer-events-none opacity-20" aria-hidden="true">
        <BotanicalSVG className="w-32 h-44 rotate-90" color="#F9D7DA" opacity={1} />
      </div>
      <div className="absolute bottom-0 right-0 pointer-events-none opacity-20 scale-x-[-1] rotate-180" aria-hidden="true">
        <BotanicalSVG className="w-32 h-44" color="#F9D7DA" opacity={1} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-screen-md mx-auto text-center" data-reveal="soft">
        <p
          className="font-script text-[#F9D7DA] mb-3"
          style={{ fontSize: '20px', letterSpacing: '0.04em' }}
        >
          Offre exclusive
        </p>
        <h2
          className="font-serif text-white leading-tight"
          style={{ fontSize: '32px', fontWeight: 600 }}
        >
          Jusqu&apos;a <span style={{ color: '#F9D7DA' }}>-30%</span> sur les ensembles
        </h2>
        <p
          className="font-sans text-white/70 mt-3 leading-relaxed"
          style={{ fontSize: '15px' }}
        >
          Profitez de nos promotions exceptionnelles sur une selection de nos plus belles pieces.
          Livraison gratuite des 3 000 DZD d&apos;achat.
        </p>
        <a
          href="#catalog"
          id="promo-banner-cta"
          className="inline-flex items-center justify-center mt-6 bg-[#F9D7DA] text-[#1C2340] font-sans font-semibold rounded-full hover:bg-white transition-colors duration-200"
          style={{ height: '52px', padding: '0 36px', fontSize: '15px', letterSpacing: '0.04em' }}
        >
          Commander les promotions
        </a>
      </div>
    </section>
  );
}
