import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Minus, Plus } from 'lucide-react';
import { PRODUCT_IMAGE_PLACEHOLDER } from '../utils/productImages';
import { getAvailableSizesForColor, getProductColorOptions, getProductTotalStock, getVariantStock } from '../utils/productVariants';

function DetailSection({ title, children }) {
  return (
    <section className="border-b border-[#F9D7DA] py-4">
      <h2 className="font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
        {title}
      </h2>
      <div className="font-sans text-[#5A6080] leading-relaxed" style={{ fontSize: '14px' }}>
        {children}
      </div>
    </section>
  );
}

export default function ProductDetailPage({ product, onClose, onAddToCart, onWishlist, wishlist }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [heartPulsing, setHeartPulsing] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainBtnRef = useRef(null);

  useEffect(() => {
    if (!product) return;
    const firstColor = getProductColorOptions(product)[0]?.color || null;
    setCurrentImage(0);
    setSelectedSize(null);
    setSelectedColor(firstColor);
    setQty(1);
  }, [product]);

  useEffect(() => {
    function onScroll() {
      if (!mainBtnRef.current) return;
      const rect = mainBtnRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  if (!product) return null;

  const productColors = getProductColorOptions(product);
  const selectedColorOption = productColors.find((color) => color.color === selectedColor);
  const selectedColorImages = Array.isArray(selectedColorOption?.images)
    ? selectedColorOption.images
    : (selectedColorOption?.image ? [selectedColorOption.image] : []);
  const baseImages = Array.isArray(product.images)
    ? product.images.filter((image) => typeof image === 'string' && image.trim())
    : [];
  const productImages = [
    ...selectedColorImages,
    ...baseImages,
  ].filter((image, index, list) => list.indexOf(image) === index);
  const visibleImages = productImages.length > 0 ? productImages : [PRODUCT_IMAGE_PLACEHOLDER];
  const productSizes = Array.isArray(product.sizes) ? product.sizes : [];
  const availableSizes = selectedColor ? getAvailableSizesForColor(product, selectedColor) : productSizes;
  const selectedStock = getVariantStock(product, selectedColor, selectedSize);
  const isOutOfStock = getProductTotalStock(product) <= 0;
  const canAddToCart = Boolean(selectedColor && selectedSize && selectedStock > 0 && qty <= selectedStock);

  function handleWishlist() {
    setHeartPulsing(true);
    onWishlist(product);
    setTimeout(() => setHeartPulsing(false), 400);
  }

  function handleAddToCart() {
    if (!canAddToCart) return;
    onAddToCart(product, selectedSize, selectedColor, qty);
    onClose();
  }

  function handleColorSelect(color) {
    setSelectedColor(color.color);
    setCurrentImage(0);
    setQty(1);
    if (selectedSize && !getAvailableSizesForColor(product, color.color).includes(selectedSize)) {
      setSelectedSize(null);
    }
  }

  const isProductWishlisted = wishlist?.includes(product.id);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#1C2340]/40 transition-sheet"
        style={{ backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Detail panel — full screen on mobile, right drawer on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto z-50 bg-white transition-sheet flex flex-col overflow-y-auto overscroll-contain"
        style={{ maxWidth: '480px', width: '100%', marginLeft: 'auto' }}
      >
        {/* Close */}
        <button
          id="product-detail-close"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm"
        >
          <X size={20} color="#1C2340" strokeWidth={1.8} />
        </button>

        {/* Image carousel */}
        <div className="relative bg-[#FDE8EC] flex-none" style={{ minHeight: '320px' }}>
          <img
            src={visibleImages[currentImage]}
            alt={`${product.name} — vue ${currentImage + 1}`}
            className="w-full object-cover"
            style={{ height: '340px' }}
          />

          {/* Arrow buttons */}
          {visibleImages.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImage((i) => (i === 0 ? visibleImages.length - 1 : i - 1))}
                aria-label="Image precedente"
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/80"
              >
                <ChevronLeft size={18} color="#1C2340" strokeWidth={1.8} />
              </button>
              <button
                onClick={() => setCurrentImage((i) => (i === visibleImages.length - 1 ? 0 : i + 1))}
                aria-label="Image suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/80"
              >
                <ChevronRight size={18} color="#1C2340" strokeWidth={1.8} />
              </button>
            </>
          )}

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {visibleImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                aria-label={`Image ${i + 1}`}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === currentImage ? '20px' : '7px',
                  height: '7px',
                  background: i === currentImage ? '#1C2340' : '#EBB4BB',
                }}
              />
            ))}
          </div>
        </div>

        {/* Product info */}
        <div className="flex-1 px-5 py-5 space-y-5">
          {/* Name + price */}
          <div>
            {product.badge && (
              <span
                className="inline-block font-sans font-semibold rounded-md px-2 mb-2"
                style={{
                  fontSize: '11px',
                  height: '20px',
                  lineHeight: '20px',
                  letterSpacing: '0.06em',
                  background: product.badge === 'promo' ? '#E63946' : '#1C2340',
                  color: '#fff',
                  textTransform: 'uppercase',
                }}
              >
                {product.badge === 'promo' ? 'Promo' : 'Nouveau'}
              </span>
            )}
            {isOutOfStock && (
              <span
                className="inline-block font-sans font-semibold rounded-md px-2 mb-2"
                style={{
                  fontSize: '11px',
                  height: '20px',
                  lineHeight: '20px',
                  letterSpacing: '0.06em',
                  background: '#1C2340',
                  color: '#fff',
                  textTransform: 'uppercase',
                }}
              >
                Rupture de stock
              </span>
            )}
            <h1
              className="font-serif text-[#1C2340]"
              style={{ fontSize: '26px', fontWeight: 600, lineHeight: 1.2 }}
            >
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="font-sans font-bold text-[#1C2340]" style={{ fontSize: '20px' }}>
                {product.price.toLocaleString('fr-DZ')} DZD
              </span>
              {product.originalPrice && (
                <span className="font-sans text-[#9CA3AF] line-through" style={{ fontSize: '15px' }}>
                  {product.originalPrice.toLocaleString('fr-DZ')} DZD
                </span>
              )}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
              Taille{selectedSize && <span className="font-normal text-[#9CA3AF] ml-2">{selectedSize}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {productSizes.map((s) => {
                const inStock = !selectedColor || availableSizes.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => inStock && setSelectedSize(s)}
                    aria-pressed={selectedSize === s}
                    disabled={!inStock}
                    className="rounded-full border font-sans font-medium transition-all duration-150 disabled:opacity-40"
                    style={{
                      padding: '7px 16px',
                      fontSize: '13px',
                      height: '36px',
                      background: selectedSize === s ? '#1C2340' : 'transparent',
                      color: selectedSize === s ? '#fff' : '#1C2340',
                      borderColor: selectedSize === s ? '#1C2340' : '#EBB4BB',
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div>
            <p className="font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
              Couleur{selectedColor && <span className="font-normal text-[#9CA3AF] ml-2 capitalize">{selectedColor}</span>}
            </p>
            <div className="flex gap-3">
              {productColors.map((c) => (
                <button
                  key={c.color}
                  onClick={() => handleColorSelect(c)}
                  aria-pressed={selectedColor === c.color}
                  aria-label={c.colorName}
                  title={c.colorName}
                  className="rounded-full transition-all duration-150"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: c.colorHex,
                    border: selectedColor === c.color ? '3px solid #1C2340' : '2px solid #EBB4BB',
                    outline: selectedColor === c.color ? '2px solid white' : 'none',
                    outlineOffset: '-4px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Product details */}
          <div>
            <DetailSection title="Description">
              <p>{product.description}</p>
            </DetailSection>
            <DetailSection title="Composition et entretien">
              <p>{product.details}</p>
            </DetailSection>
            <DetailSection title="Livraison et retours">
              <p>Livraison disponible partout en Algerie par paiement a la livraison. Les retours sont acceptes sous 7 jours apres reception.</p>
            </DetailSection>
          </div>

          {/* Quantity */}
          <div>
            <p className="font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
              Quantite
            </p>
            <div className="flex items-center gap-0 rounded-full border border-[#EBB4BB] overflow-hidden w-fit">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Reduire la quantite"
                className="flex items-center justify-center hover:bg-[#FDE8EC] transition-colors"
                style={{ width: '44px', height: '44px' }}
              >
                <Minus size={16} color="#1C2340" strokeWidth={1.8} />
              </button>
              <span
                className="font-sans font-semibold text-[#1C2340] text-center"
                style={{ minWidth: '36px', fontSize: '15px' }}
                aria-live="polite"
                aria-label={`Quantite : ${qty}`}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => selectedSize ? Math.min(selectedStock, q + 1) : q)}
                disabled={!selectedSize || selectedStock <= 0 || qty >= selectedStock}
                aria-label="Augmenter la quantite"
                className="flex items-center justify-center hover:bg-[#FDE8EC] transition-colors disabled:opacity-40"
                style={{ width: '44px', height: '44px' }}
              >
                <Plus size={16} color="#1C2340" strokeWidth={1.8} />
              </button>
            </div>
            {selectedSize && (
              <p className="font-sans text-[#9CA3AF] mt-2" style={{ fontSize: '12px' }}>
                Stock disponible: {selectedStock}
              </p>
            )}
          </div>

          {/* Add to cart */}
          <div ref={mainBtnRef} className="space-y-3">
            <button
              id="detail-add-to-cart"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="w-full bg-[#1C2340] text-white font-sans font-semibold rounded-full hover:bg-[#2D375F] transition-colors duration-200 disabled:opacity-50"
              style={{ height: '52px', fontSize: '15px', letterSpacing: '0.04em' }}
            >
              {canAddToCart ? 'Ajouter au panier' : isOutOfStock ? 'Rupture de stock' : 'Choisissez couleur et taille'}
            </button>
            <button
              id="detail-add-to-favorites"
              onClick={handleWishlist}
              className="w-full border-2 text-[#1C2340] font-sans font-semibold rounded-full hover:bg-[#FDE8EC] transition-colors duration-200 flex items-center justify-center gap-2"
              style={{
                height: '52px',
                fontSize: '15px',
                borderColor: '#1C2340',
                background: isProductWishlisted ? '#FDE8EC' : 'transparent',
              }}
            >
              <Heart
                size={18}
                className={heartPulsing ? 'animate-heart-pulse' : ''}
                fill={isProductWishlisted ? '#E63946' : 'none'}
                color={isProductWishlisted ? '#E63946' : '#1C2340'}
                strokeWidth={1.8}
              />
              {isProductWishlisted ? 'Dans vos favoris' : 'Ajouter aux favoris'}
            </button>
          </div>

        </div>
      </div>

      {/* Sticky bottom bar on mobile (appears after scrolling past main button) */}
      {showStickyBar && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-[#F9D7DA] px-4 py-3 flex items-center justify-between gap-3 md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
        >
          <div>
            <p className="font-sans font-bold text-[#1C2340]" style={{ fontSize: '16px' }}>
              {product.price.toLocaleString('fr-DZ')} DZD
            </p>
            {product.originalPrice && (
              <p className="font-sans text-[#9CA3AF] line-through" style={{ fontSize: '12px' }}>
                {product.originalPrice.toLocaleString('fr-DZ')} DZD
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="flex-1 max-w-[200px] bg-[#1C2340] text-white font-sans font-semibold rounded-full disabled:opacity-50"
            style={{ height: '48px', fontSize: '14px' }}
          >
            {canAddToCart ? 'Ajouter au panier' : isOutOfStock ? 'Rupture de stock' : 'Choisissez couleur et taille'}
          </button>
        </div>
      )}
    </>
  );
}
