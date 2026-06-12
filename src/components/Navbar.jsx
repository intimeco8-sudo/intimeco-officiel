import { Menu, Search, ShoppingBag } from 'lucide-react';

const DESKTOP_LINKS = [
  { label: 'Accueil', href: '/#hero' },
  { label: 'Collections', href: '/#categories' },
  { label: 'Nouveautes', href: '/#nouveautes' },
  { label: 'Promotions', href: '/#catalog' },
  { label: 'Notre histoire', href: '/notre-histoire' },
  { label: 'Boutique & Contact', href: '/boutique-contact' },
];

export default function Navbar({ cartCount, onMenuOpen, onCartOpen, onSearchOpen }) {
  return (
    <header
      className="sticky top-0 z-50 bg-white/92 border-b border-[#F9D7DA] nav-glass"
      style={{ height: '64px' }}
    >
      <div
        className="max-w-screen-xl mx-auto h-full px-4 flex items-center justify-between gap-4"
        style={{ height: '64px' }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-none lg:flex-1">
          <button
            id="nav-menu-btn"
            aria-label="Ouvrir le menu"
            onClick={onMenuOpen}
            className="flex lg:hidden items-center justify-center w-11 h-11 rounded-full hover:bg-[#FDE8EC] transition-colors duration-200"
          >
            <Menu size={22} color="#1C2340" strokeWidth={1.8} />
          </button>

          <a
            href="/#hero"
            className="flex items-center select-none min-w-0"
            aria-label="Intime & Co - Accueil"
          >
            <span
              className="font-serif font-bold text-[#1C2340] tracking-wide truncate"
              style={{ fontSize: '22px', letterSpacing: '0.04em' }}
            >
              Intime &amp; Co
            </span>
          </a>
        </div>

        <nav
          className="hidden lg:flex flex-none items-center justify-center gap-5 xl:gap-8"
          aria-label="Navigation principale"
        >
          {DESKTOP_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-sans text-[#1C2340] hover:text-[#E8A5AE] transition-colors duration-200 text-[14px] tracking-wide whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1 flex-none lg:flex-1">
          <button
            id="nav-search-btn"
            aria-label="Rechercher"
            onClick={onSearchOpen}
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-[#FDE8EC] transition-colors duration-200"
          >
            <Search size={20} color="#1C2340" strokeWidth={1.8} />
          </button>

          <button
            id="nav-cart-btn"
            aria-label={`Panier - ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
            onClick={onCartOpen}
            className="relative flex items-center justify-center w-11 h-11 rounded-full hover:bg-[#FDE8EC] transition-colors duration-200"
          >
            <ShoppingBag size={20} color="#1C2340" strokeWidth={1.8} />
            {cartCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 flex items-center justify-center bg-[#1C2340] text-white rounded-full font-sans font-semibold leading-none"
                style={{ width: '17px', height: '17px', fontSize: '10px' }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
