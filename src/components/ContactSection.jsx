import { MapPin, MessageCircle, Phone, X } from 'lucide-react';
import { DEFAULT_STORE_SETTINGS, getPhoneHref, getWhatsappHref } from '../hooks/useStoreSettings';

function InstagramIcon({ size = 20, color = '#1C2340' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const MAPS_URL = 'https://maps.app.goo.gl/ed64wpYFhfYRzWwg6';

export default function ContactSection({ settings = DEFAULT_STORE_SETTINGS }) {
  const instagramUrl = settings.instagram_url || DEFAULT_STORE_SETTINGS.instagram_url;
  const phone = settings.store_phone || DEFAULT_STORE_SETTINGS.store_phone;
  const whatsappUrl = getWhatsappHref(settings.whatsapp_url || DEFAULT_STORE_SETTINGS.whatsapp_url, phone);
  const address = settings.store_address || DEFAULT_STORE_SETTINGS.store_address;
  const instagramLabel = instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '');

  return (
    <section id="contact" className="contact-overlay px-4" aria-label="Contact">
      <a className="contact-overlay__backdrop" href="#catalog" aria-label="Fermer le contact" />

      <div className="contact-overlay__panel bg-white" data-reveal="soft">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h2
              className="font-serif text-[#1C2340]"
              style={{ fontSize: '24px', letterSpacing: '0.08em', fontWeight: 600 }}
            >
              Contactez-nous
            </h2>
            <p
              className="font-sans text-[#9CA3AF] italic mt-1"
              style={{ fontSize: '15px' }}
            >
              Une question avant de commander ?
            </p>
          </div>

          <a
            href="#catalog"
            aria-label="Fermer le contact"
            className="flex-none flex items-center justify-center w-11 h-11 rounded-full bg-[#FDE8EC] hover:bg-[#F9D7DA] transition-colors duration-200"
          >
            <X size={20} color="#1C2340" strokeWidth={1.8} />
          </a>
        </div>

        <div className="space-y-4">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="contact-instagram"
            className="flex items-center gap-4 p-5 rounded-lg bg-[#FDE8EC] hover:bg-[#F9D7DA] transition-colors duration-200 group surface-lift"
          >
            <div
              className="flex-none flex items-center justify-center rounded-full bg-white"
              style={{ width: '48px', height: '48px' }}
            >
              <InstagramIcon size={22} color="#1C2340" />
            </div>
            <div>
              <p className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '14px' }}>
                Instagram
              </p>
              <p className="font-sans text-[#5A6080]" style={{ fontSize: '15px' }}>
                {instagramLabel}
              </p>
            </div>
          </a>

          <a
            href={getPhoneHref(phone)}
            id="contact-phone"
            className="flex items-center gap-4 p-5 rounded-lg bg-[#FDE8EC] hover:bg-[#F9D7DA] transition-colors duration-200 group surface-lift"
          >
            <div
              className="flex-none flex items-center justify-center rounded-full bg-white"
              style={{ width: '48px', height: '48px' }}
            >
              <Phone size={22} color="#1C2340" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '14px' }}>
                Telephone
              </p>
              <p className="font-sans text-[#5A6080]" style={{ fontSize: '15px' }}>
                {phone}
              </p>
            </div>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="contact-whatsapp"
            className="flex items-center gap-4 p-5 rounded-lg bg-[#FDE8EC] hover:bg-[#F9D7DA] transition-colors duration-200 group surface-lift"
          >
            <div
              className="flex-none flex items-center justify-center rounded-full bg-white"
              style={{ width: '48px', height: '48px' }}
            >
              <MessageCircle size={22} color="#1C2340" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '14px' }}>
                WhatsApp
              </p>
              <p className="font-sans text-[#5A6080]" style={{ fontSize: '15px' }}>
                Message direct
              </p>
            </div>
          </a>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="contact-location"
            className="flex items-center gap-4 p-5 rounded-lg bg-[#FDE8EC] hover:bg-[#F9D7DA] transition-colors duration-200 group surface-lift"
          >
            <div
              className="flex-none flex items-center justify-center rounded-full bg-white"
              style={{ width: '48px', height: '48px' }}
            >
              <MapPin size={22} color="#1C2340" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '14px' }}>
                Boutique
              </p>
              <p className="font-sans text-[#5A6080]" style={{ fontSize: '15px' }}>
                {address}
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
