import { ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import InTimeLogo from './InTimeLogo';
import BotanicalSVG from './BotanicalSVG';

const SELLING_POINTS = [
  { label: 'Livraison nationale', Icon: Truck },
  { label: 'Paiement securise', Icon: ShieldCheck },
  { label: 'Commande rapide', Icon: ShoppingBag },
];

export default function HeroSection({ onShopClick }) {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center grain-overlay overflow-hidden"
      style={{
        minHeight: '100svh',
        background: 'radial-gradient(ellipse 64% 54% at 50% 36%, rgba(255,255,255,0.78) 0%, rgba(253,232,236,0.92) 35%, rgba(249,215,218,0.96) 68%, #F5C6CB 100%)',
      }}
    >
      {/* Botanical branches - corners */}
      <div className="absolute bottom-0 left-0 pointer-events-none hero-botanical" aria-hidden="true">
        <BotanicalSVG
          className="w-36 h-48 md:w-48 md:h-64"
          opacity={0.55}
          color="#EBB4BB"
        />
      </div>
      <div className="absolute bottom-0 right-0 pointer-events-none scale-x-[-1] hero-botanical" aria-hidden="true">
        <BotanicalSVG
          className="w-36 h-48 md:w-48 md:h-64"
          opacity={0.55}
          color="#EBB4BB"
        />
      </div>
      <div className="absolute top-4 right-4 pointer-events-none rotate-180" aria-hidden="true">
        <BotanicalSVG
          className="w-24 h-32 opacity-30"
          opacity={0.4}
          color="#EBB4BB"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 max-w-lg mx-auto">
        {/* Logo */}
        <div className="animate-fade-up animation-delay-200">
          <InTimeLogo size={160} className="hero-logo drop-shadow-lg" />
        </div>

        {/* Tagline */}
        <p
          className="font-script text-[#1C2340] mt-5 animate-fade-up animation-delay-400"
          style={{ fontSize: '28px', letterSpacing: '0.02em' }}
          aria-label="Lingerie pour elle"
        >
          Lingerie pour elle
        </p>

        {/* Sub-tagline */}
        <p
          className="font-sans text-[#5A6080] mt-3 animate-fade-up animation-delay-400 leading-relaxed"
          style={{ fontSize: '15px', maxWidth: '330px' }}
        >
          Des pieces elegantes, confortables et pretes a commander. Choisissez vos favoris, ajoutez au panier et recevez partout en Algerie.
        </p>

        {/* CTA */}
        <div className="mt-7 w-full animate-fade-up animation-delay-600">
          <button
            id="hero-cta-btn"
            onClick={onShopClick}
            className="w-full md:w-auto md:px-14 bg-[#1C2340] text-white font-sans font-semibold tracking-wide rounded-full hover:bg-[#2D375F] active:scale-95 transition-all duration-200"
            style={{
              height: '52px',
              fontSize: '15px',
              letterSpacing: '0.06em',
              minWidth: '260px',
            }}
          >
            Acheter la collection
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 w-full max-w-md animate-fade-up animation-delay-600">
          {SELLING_POINTS.map(({ label, Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-1 rounded-lg bg-white/58 border border-white/70 px-2 py-3"
            >
              <Icon size={17} color="#1C2340" strokeWidth={1.8} aria-hidden="true" />
              <span
                className="font-sans text-[#1C2340] leading-tight"
                style={{ fontSize: '11px' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          className="mt-8 animate-fade-up animation-delay-600 flex flex-col items-center gap-2 opacity-50"
          aria-hidden="true"
        >
          <div
            className="w-px bg-[#1C2340] rounded-full"
            style={{
              height: '32px',
              animation: 'fade-up 2s ease-in-out infinite alternate',
            }}
          />
        </div>
      </div>
    </section>
  );
}
