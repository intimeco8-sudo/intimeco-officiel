import { Clock, ExternalLink, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { DEFAULT_STORE_SETTINGS, getPhoneHref } from '../hooks/useStoreSettings';

const MAPS_URL = 'https://maps.app.goo.gl/ed64wpYFhfYRzWwg6';
const MAP_COORDS = '36.5381866,3.8321025';
const EMBED_URL = `https://www.google.com/maps?q=${MAP_COORDS}&z=18&output=embed`;

function InstagramIcon({ size = 22, color = '#1C2340' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function StoreBoutique({ settings = DEFAULT_STORE_SETTINGS }) {
  const storeName = settings.store_name || DEFAULT_STORE_SETTINGS.store_name;
  const address = settings.store_address || DEFAULT_STORE_SETTINGS.store_address;
  const hours = settings.store_hours || DEFAULT_STORE_SETTINGS.store_hours;
  const phone = settings.store_phone || DEFAULT_STORE_SETTINGS.store_phone;
  const instagramUrl = settings.instagram_url || DEFAULT_STORE_SETTINGS.instagram_url;
  const instagramLabel = instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '');

  function getDirections() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.open(`geo:${MAP_COORDS}?q=${MAP_COORDS}(${encodeURIComponent(storeName)})`, '_self');
    } else {
      window.open(MAPS_URL, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <main className="boutique-contact-page">
      <section className="relative overflow-hidden px-4 py-12 md:py-16">
        <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <svg viewBox="0 0 1440 46" preserveAspectRatio="none" className="w-full" style={{ height: '46px' }}>
            <path d="M0 46 Q360 4 720 24 Q1080 44 1440 12 L1440 0 L0 0 Z" fill="#FDE8EC" />
          </svg>
        </div>

        <div className="max-w-screen-xl mx-auto pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-8 items-start">
            <div className="space-y-6" data-reveal="soft">
              <a
                href="/#catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/70 border border-[#EBB4BB] px-5 text-[#1C2340] font-sans font-semibold hover:bg-white transition-colors"
                style={{ height: '42px', fontSize: '13px' }}
              >
                <ShoppingBag size={15} strokeWidth={1.8} />
                Retour a la boutique en ligne
              </a>

              <div>
                <p
                  className="font-script text-[#EBB4BB]"
                  style={{ fontSize: '24px', letterSpacing: '0.03em' }}
                >
                  Boutique & contact
                </p>
                <h1
                  className="font-serif text-[#1C2340] leading-tight mt-2"
                  style={{ fontSize: 'clamp(36px, 6vw, 58px)', fontWeight: 600 }}
                >
                  Venez nous voir ou contactez-nous avant de commander
                </h1>
                <p
                  className="font-sans text-[#5A6080] leading-relaxed mt-4"
                  style={{ fontSize: '16px', maxWidth: '560px' }}
                >
                  Retrouvez {storeName} en boutique a {address}, ou contactez-nous directement pour une taille, une couleur, une disponibilite ou une commande.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg p-5 surface-lift hover:bg-[#FDE8EC] transition-colors"
                data-reveal="soft"
              >
                <InstagramIcon />
                <p className="font-sans font-semibold text-[#1C2340] mt-4" style={{ fontSize: '14px' }}>
                  Instagram
                </p>
                <p className="font-sans text-[#5A6080] mt-1" style={{ fontSize: '15px' }}>
                  {instagramLabel}
                </p>
              </a>

              <a
                href={getPhoneHref(phone)}
                className="bg-white rounded-lg p-5 surface-lift hover:bg-[#FDE8EC] transition-colors"
                data-reveal="soft"
              >
                <Phone size={22} color="#1C2340" strokeWidth={1.8} />
                <p className="font-sans font-semibold text-[#1C2340] mt-4" style={{ fontSize: '14px' }}>
                  Telephone
                </p>
                <p className="font-sans text-[#5A6080] mt-1" style={{ fontSize: '15px' }}>
                  {phone}
                </p>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-10">
            <div className="bg-white rounded-lg p-6 space-y-5 surface-lift" data-reveal="left">
              <div>
                <h2
                  className="font-serif text-[#1C2340]"
                  style={{ fontSize: '26px', fontWeight: 600 }}
                >
                  {storeName}
                </h2>
                <p
                  className="font-script text-[#EBB4BB] mt-0.5"
                  style={{ fontSize: '18px' }}
                >
                  Lingerie pour elle
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-none flex items-center justify-center rounded-full bg-[#FDE8EC] mt-0.5" style={{ width: '36px', height: '36px' }}>
                  <MapPin size={18} color="#1C2340" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '14px' }}>
                    Adresse
                  </p>
                  <p className="font-sans text-[#5A6080]" style={{ fontSize: '14px' }}>
                    {address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-none flex items-center justify-center rounded-full bg-[#FDE8EC] mt-0.5" style={{ width: '36px', height: '36px' }}>
                  <Clock size={18} color="#1C2340" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '14px' }}>
                    Horaires d&apos;ouverture
                  </p>
                  <p className="font-sans text-[#5A6080]" style={{ fontSize: '14px' }}>
                    {hours}
                  </p>
                </div>
              </div>

              <button
                id="store-directions-btn"
                onClick={getDirections}
                className="w-full flex items-center justify-center gap-2 border-2 border-[#1C2340] text-[#1C2340] font-sans font-semibold rounded-full hover:bg-[#FDE8EC] transition-colors duration-200"
                style={{ height: '48px', fontSize: '14px', letterSpacing: '0.04em' }}
              >
                <ExternalLink size={16} strokeWidth={1.8} />
                Obtenir l&apos;itineraire
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div
                className="rounded-lg overflow-hidden border-2 border-[#F9D7DA] surface-lift"
                data-reveal="right"
                style={{ height: 'clamp(300px, 42vw, 460px)' }}
              >
                <iframe
                  title={`Localisation ${storeName}`}
                  src={EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="store-view-map-btn"
                className="flex items-center justify-center gap-2 bg-white border border-[#EBB4BB] text-[#1C2340] font-sans font-semibold rounded-full hover:bg-[#FDE8EC] transition-colors duration-200"
                style={{ height: '44px', fontSize: '14px' }}
              >
                <MapPin size={16} strokeWidth={1.8} />
                Voir sur Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
