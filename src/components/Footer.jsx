import { useState } from 'react';
import InTimeLogo from './InTimeLogo';
import { DEFAULT_STORE_SETTINGS, getWhatsappHref } from '../hooks/useStoreSettings';

function TikTokIcon({ size = 18, color = '#1C2340' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.79a4.84 4.84 0 01-1.01-.1z"/>
    </svg>
  );
}

function InstagramIcon({ size = 18, color = 'white' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 18, color = 'white' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 18, color = 'white' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5.25 18.75 6.1 15.6A7.25 7.25 0 1 1 8.45 18Z" />
      <path d="M9.1 8.65c.18-.36.36-.4.62-.4h.5c.2 0 .38.12.46.31l.65 1.52c.08.22.04.43-.12.6l-.48.5a5.92 5.92 0 0 0 2.92 2.9l.5-.47c.17-.16.39-.2.6-.11l1.53.64c.2.08.32.26.32.47v.48c0 .31-.14.58-.4.75-.35.23-.88.42-1.52.39-2.88-.12-6.58-3.82-6.7-6.69-.03-.65.16-1.17.39-1.53.08-.13.16-.22.23-.26Z" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: 'Accueil', href: '/#hero' },
  { label: 'Collections', href: '/#categories' },
  { label: 'Promotions', href: '/#catalog' },
  { label: 'Boutique & Contact', href: '/boutique-contact' },
  { label: 'Politique de retour', href: '/boutique-contact' },
  { label: 'FAQ', href: '/boutique-contact' },
];

export default function Footer({ settings = DEFAULT_STORE_SETTINGS }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const storeName = settings.store_name || DEFAULT_STORE_SETTINGS.store_name;
  const address = settings.store_address || DEFAULT_STORE_SETTINGS.store_address;
  const instagramUrl = settings.instagram_url || DEFAULT_STORE_SETTINGS.instagram_url;
  const facebookUrl = settings.facebook_url || DEFAULT_STORE_SETTINGS.facebook_url;
  const tiktokUrl = settings.tiktok_url || DEFAULT_STORE_SETTINGS.tiktok_url;
  const whatsappUrl = getWhatsappHref(settings.whatsapp_url || DEFAULT_STORE_SETTINGS.whatsapp_url, settings.store_phone || DEFAULT_STORE_SETTINGS.store_phone);

  function handleSubscribe(e) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  }

  return (
    <footer className="bg-[#11162B] text-white pt-12 pb-6 px-4">
      <div className="max-w-screen-xl mx-auto">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10" data-reveal="soft">
          {/* Column 1: Logo + description */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <InTimeLogo size={52} />
              <div>
                <p className="font-serif font-bold text-white" style={{ fontSize: '18px' }}>
                  {storeName}
                </p>
                <p className="font-script text-[#EBB4BB]" style={{ fontSize: '14px' }}>
                  Lingerie pour elle
                </p>
              </div>
            </div>
            <p
              className="font-sans text-white/60 leading-relaxed"
              style={{ fontSize: '13px', maxWidth: '240px' }}
            >
              La lingerie fine algerienne, alliant elegance et confort pour la femme moderne. Boutique a {address}, livraison nationale.
            </p>
          </div>

          {/* Column 2: Nav links */}
          <div>
            <h3
              className="font-serif text-white mb-4"
              style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '0.06em' }}
            >
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-sans text-white/60 hover:text-white transition-colors duration-200"
                    style={{ fontSize: '14px' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Newsletter + socials */}
          <div>
            <h3
              className="font-serif text-white mb-4"
              style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '0.06em' }}
            >
              Restez informee
            </h3>
            {subscribed ? (
              <p className="font-sans text-[#EBB4BB]" style={{ fontSize: '14px' }}>
                Merci pour votre inscription !
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse e-mail"
                  aria-label="Adresse e-mail pour la newsletter"
                  required
                  className="w-full border border-white/20 rounded-xl px-4 bg-white/10 text-white placeholder-white/40 outline-none focus:border-[#EBB4BB] transition-colors"
                  style={{ height: '48px', fontSize: '14px' }}
                />
                <button
                  id="footer-newsletter-btn"
                  type="submit"
                  className="w-full bg-[#F9D7DA] text-[#1C2340] font-sans font-semibold rounded-xl hover:bg-white transition-colors duration-200"
                  style={{ height: '48px', fontSize: '14px' }}
                >
                  S&apos;inscrire
                </button>
              </form>
            )}

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <InstagramIcon size={18} color="white" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <FacebookIcon size={18} color="white" />
              </a>
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <TikTokIcon size={18} color="white" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <WhatsAppIcon size={18} color="white" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-5" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Payment method badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            {['Livraison', 'BaridiMob', 'CCP'].map((method) => (
              <span
                key={method}
                className="font-sans border border-white/20 rounded-lg px-3 text-white/70"
                style={{ fontSize: '12px', height: '28px', lineHeight: '28px', whiteSpace: 'nowrap' }}
              >
                {method}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <p
            className="font-sans text-white/40 text-center md:text-right"
            style={{ fontSize: '12px' }}
          >
            &copy; {new Date().getFullYear()} {storeName}. Tous droits reserves. {address}.
          </p>
        </div>
      </div>
    </footer>
  );
}
