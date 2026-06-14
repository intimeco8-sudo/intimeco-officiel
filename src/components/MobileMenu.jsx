import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import BotanicalSVG from './BotanicalSVG';
import { DEFAULT_STORE_SETTINGS, getWhatsappHref } from '../hooks/useStoreSettings';

const NAV_LINKS = [
  { label: 'Accueil', href: '/#hero' },
  { label: 'Collections', href: '/#categories' },
  { label: 'Nouveautes', href: '/#nouveautes' },
  { label: 'Promotions', href: '/#catalog' },
  { label: 'Notre histoire', href: '/notre-histoire' },
  { label: 'Boutique & Contact', href: '/boutique-contact' },
];

// TikTok icon as inline SVG (not available in lucide-react)
function TikTokIcon({ size = 20, color = '#1C2340' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.79a4.84 4.84 0 01-1.01-.1z"/>
    </svg>
  );
}

function InstagramIcon({ size = 20, color = '#1C2340' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 20, color = '#1C2340' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 20, color = '#1C2340' }) {
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

export default function MobileMenu({ isOpen, onClose, onLinkClick, settings = DEFAULT_STORE_SETTINGS }) {
  const firstLinkRef = useRef(null);
  const instagramUrl = settings.instagram_url || DEFAULT_STORE_SETTINGS.instagram_url;
  const facebookUrl = settings.facebook_url || DEFAULT_STORE_SETTINGS.facebook_url;
  const tiktokUrl = settings.tiktok_url || DEFAULT_STORE_SETTINGS.tiktok_url;
  const whatsappUrl = getWhatsappHref(settings.whatsapp_url || DEFAULT_STORE_SETTINGS.whatsapp_url, settings.store_phone || DEFAULT_STORE_SETTINGS.store_phone);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      firstLinkRef.current?.focus();
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#1C2340]/40 transition-sheet"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white transition-sheet flex flex-col overflow-hidden"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: '6px 0 40px rgba(28,35,64,0.18)',
        }}
      >
        {/* Botanical decoration top-right of drawer */}
        <div className="absolute top-0 right-0 pointer-events-none" aria-hidden="true">
          <BotanicalSVG
            className="w-28 h-36 rotate-180 scale-x-[-1]"
            opacity={0.4}
            color="#F5C6CB"
          />
        </div>

        {/* Close button */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span
            className="font-serif font-semibold text-[#1C2340]"
            style={{ fontSize: '18px' }}
          >
            Intime &amp; Co
          </span>
          <button
            id="mobile-menu-close"
            aria-label="Fermer le menu"
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-[#FDE8EC] transition-colors duration-200"
          >
            <X size={22} color="#1C2340" strokeWidth={1.8} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-[#F9D7DA]" />

        {/* Nav links */}
        <nav className="flex-1 flex flex-col justify-center px-6 py-8 gap-1">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              ref={i === 0 ? firstLinkRef : undefined}
              href={link.href}
              onClick={() => { onLinkClick?.(); onClose(); }}
              className="font-serif text-[#1C2340] hover:text-[#E8A5AE] transition-colors duration-200 py-3 border-b border-[#FDE8EC] last:border-0"
              style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '0.01em' }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Bottom: Social icons */}
        <div className="px-6 pb-8">
          <div className="h-px bg-[#F9D7DA] mb-6" />
          <div className="flex items-center gap-5">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FDE8EC] hover:bg-[#F5C6CB] transition-colors duration-200"
            >
              <InstagramIcon size={20} color="#1C2340" />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FDE8EC] hover:bg-[#F5C6CB] transition-colors duration-200"
            >
              <FacebookIcon size={20} color="#1C2340" />
            </a>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FDE8EC] hover:bg-[#F5C6CB] transition-colors duration-200"
            >
              <TikTokIcon size={20} color="#1C2340" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FDE8EC] hover:bg-[#F5C6CB] transition-colors duration-200"
            >
              <WhatsAppIcon size={20} color="#1C2340" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
