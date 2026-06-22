import { useState, useCallback, useEffect } from 'react';
import './index.css';
import useStoreSettings from './hooks/useStoreSettings';
import useScrollReveal from './hooks/useScrollReveal';

import Navbar from './components/Navbar';
import AnnouncementStrip from './components/AnnouncementStrip';
import MobileMenu from './components/MobileMenu';
import SearchModal from './components/SearchModal';
import HeroSection from './components/HeroSection';
import CategoryTiles from './components/CategoryTiles';
import NouveautesCarousel from './components/NouveautesCarousel';
import ProductCatalog from './components/ProductCatalog';
import PromoBanner from './components/PromoBanner';
import BrandStory from './components/BrandStory';
import StoreBoutique from './components/StoreBoutique';
import Footer from './components/Footer';
import ProductDetailPage from './components/ProductDetailPage';
import CartDrawer from './components/CartDrawer';
import CheckoutPage from './components/CheckoutPageWithSupabase';
import Toast from './components/Toast';
import { getAvailableSizesForColor, getProductColorOptions, getVariantStock } from './utils/productVariants';

let toastCounter = 0;

function getPageFromHash() {
  if (window.location.pathname === '/boutique-contact'
    || ['#boutique-contact', '#boutique', '#contact'].includes(window.location.hash)) {
    return 'boutique-contact';
  }

  if (window.location.pathname === '/notre-histoire'
    || ['#notre-histoire', '#histoire'].includes(window.location.hash)) {
    return 'notre-histoire';
  }

  return 'home';
}

export default function App() {
  useScrollReveal();

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
  const [activePage, setActivePage] = useState(getPageFromHash);

  // Data state
  const storeSettings = useStoreSettings();
  const [cartItems, setCartItems] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleRouteChange() {
      setActivePage(getPageFromHash());
    }

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Toast helper
  const addToast = useCallback((message) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cart operations
  function addToCart(product, selectedSize, selectedColor, qty = 1) {
    const colorOptions = getProductColorOptions(product);
    const firstAvailableColor = colorOptions.find((option) =>
      getAvailableSizesForColor(product, option.color).length > 0
    )?.color;
    const fallbackColor = selectedColor ?? firstAvailableColor ?? colorOptions[0]?.color ?? product.colors?.[0] ?? null;
    const availableSizes = fallbackColor ? getAvailableSizesForColor(product, fallbackColor) : [];
    const fallbackSize = selectedSize ?? availableSizes[0] ?? product.sizes?.[0] ?? null;
    const availableStock = getVariantStock(product, fallbackColor, fallbackSize);

    if (!fallbackSize || availableStock <= 0 || (!selectedSize && fallbackColor && availableSizes.length === 0)) {
      addToast('Produit indisponible');
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.id === product.id && i.selectedSize === fallbackSize && i.selectedColor === fallbackColor
      );
      if (existing) {
        const nextQty = Math.min(availableStock, existing.qty + qty);
        if (nextQty === existing.qty) {
          addToast('Stock maximum atteint');
          return prev;
        }
        return prev.map((i) =>
          i.id === product.id && i.selectedSize === fallbackSize && i.selectedColor === fallbackColor
            ? { ...i, qty: nextQty }
            : i
        );
      }
      const cartQty = Math.min(availableStock, qty);
      return [
        ...prev,
        {
          ...product,
          selectedSize: fallbackSize,
          selectedColor: fallbackColor,
          qty: cartQty,
        },
      ];
    });
    setAppliedPromo(null);
    addToast('Produit ajoute au panier');
  }

  function updateQty(item, newQty) {
    if (newQty <= 0) {
      removeFromCart(item);
      return;
    }
    const availableStock = getVariantStock(item, item.selectedColor, item.selectedSize);
    const safeQty = Math.min(newQty, availableStock);
    if (safeQty <= 0) {
      removeFromCart(item);
      return;
    }
    if (safeQty < newQty) {
      addToast('Stock maximum atteint');
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor
          ? { ...i, qty: safeQty }
          : i
      )
    );
    setAppliedPromo(null);
  }

  function removeFromCart(item) {
    setCartItems((prev) =>
      prev.filter(
        (i) => !(i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor)
      )
    );
    setAppliedPromo(null);
    addToast('Article retire du panier');
  }

  // Wishlist
  function toggleWishlist(product) {
    const isIn = wishlist.includes(product.id);
    if (isIn) {
      setWishlist((prev) => prev.filter((id) => id !== product.id));
      addToast('Retire des favoris');
    } else {
      setWishlist((prev) => [...prev, product.id]);
      addToast('Ajoute aux favoris');
    }
  }

  // Category tile click → scroll to catalog and filter
  function handleCategorySelect(cat) {
    setActiveCategoryFilter(cat);
    if (cat) {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }

  // Scroll to catalog on hero CTA
  function handleShopClick() {
    if (activePage !== 'home') {
      window.location.href = '/#catalog';
      return;
    }
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Checkout
  function handleCheckout() {
    setCartOpen(false);
    setShowCheckout(true);
  }

  function handleOrderConfirm() {
    setCartItems([]);
    setAppliedPromo(null);
  }

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  if (showCheckout) {
    return (
      <>
        <CheckoutPage
          cartItems={cartItems}
          onBack={() => setShowCheckout(false)}
          onConfirm={handleOrderConfirm}
          settings={storeSettings}
          initialPromo={appliedPromo}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDE8EC] site-shell">
      {/* Navigation */}
      <Navbar
        cartCount={cartCount}
        onMenuOpen={() => setMenuOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        onSearchOpen={() => setSearchOpen(true)}
      />

      {/* Announcement strip */}
      <AnnouncementStrip text={storeSettings.announcement_text} />

      {/* Mobile menu */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} settings={storeSettings} />

      {/* Search modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAddToCart={addToCart}
        onWishlist={toggleWishlist}
        wishlist={wishlist}
        onCardClick={(p) => { setSelectedProduct(p); setSearchOpen(false); }}
      />

      {/* Cart drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        settings={storeSettings}
        appliedPromo={appliedPromo}
        onPromoApplied={setAppliedPromo}
      />

      {/* Product detail */}
      {selectedProduct && (
        <ProductDetailPage
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          onWishlist={toggleWishlist}
          isWishlisted={wishlist.includes(selectedProduct?.id)}
          wishlist={wishlist}
        />
      )}

      {activePage === 'boutique-contact' ? (
        <StoreBoutique settings={storeSettings} />
      ) : activePage === 'notre-histoire' ? (
        <BrandStory />
      ) : (
        <main>
          {/* 1. Hero */}
          <HeroSection onShopClick={handleShopClick} />

          {/* 2. Category tiles */}
          <CategoryTiles
            onCategorySelect={handleCategorySelect}
            activeCategory={activeCategoryFilter}
          />

          {/* 3. Nouveautes carousel */}
          <NouveautesCarousel
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            wishlist={wishlist}
            onCardClick={setSelectedProduct}
          />

          {/* 4. Product catalog */}
          <ProductCatalog
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            wishlist={wishlist}
            onCardClick={setSelectedProduct}
            initialCategory={activeCategoryFilter}
          />

          {/* 5. Promo banner */}
          <PromoBanner settings={storeSettings} />

        </main>
      )}

      {/* Footer */}
      <Footer settings={storeSettings} />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
