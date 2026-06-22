import { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { getProductImage } from '../utils/productImages';
import { getProductColorOptions, getProductTotalStock } from '../utils/productVariants';

function BadgeChip({ badge }) {
  if (!badge) return null;
  const isPromo = badge === 'promo';
  return (
    <span
      className="absolute top-2 left-2 z-10 font-sans font-semibold rounded-md px-2"
      style={{
        fontSize: '11px',
        height: '20px',
        lineHeight: '20px',
        letterSpacing: '0.06em',
        background: isPromo ? '#E63946' : '#1C2340',
        color: '#fff',
        textTransform: 'uppercase',
      }}
    >
      {isPromo ? 'Promo' : 'Nouveau'}
    </span>
  );
}

export default function ProductCard({ product, onAddToCart, onWishlist, isWishlisted, onCardClick }) {
  const [heartPulsing, setHeartPulsing] = useState(false);
  const productImage = getProductImage(product);
  const colors = getProductColorOptions(product);
  const isOutOfStock = getProductTotalStock(product) <= 0;

  function handleWishlist(e) {
    e.stopPropagation();
    setHeartPulsing(true);
    onWishlist(product);
    setTimeout(() => setHeartPulsing(false), 400);
  }

  function handleAddToCart(e) {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product);
  }

  return (
    <article
      className="product-card bg-white rounded-lg overflow-hidden cursor-pointer select-none flex flex-col h-full"
      style={{
        boxShadow: '0 8px 28px rgba(249,215,218,0.55)',
        borderRadius: '8px',
      }}
      onClick={() => onCardClick(product)}
      role="button"
      tabIndex={0}
      aria-label={`Voir ${product.name}`}
      onKeyDown={(e) => { if (e.key === 'Enter') onCardClick(product); }}
    >
      {/* Image area */}
      <div className="relative" style={{ paddingTop: '100%' }}>
        <img
          src={productImage}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ borderRadius: '8px 8px 0 0' }}
        />

        {/* Badge */}
        <BadgeChip badge={product.badge} />

        {isOutOfStock && (
          <span
            className="absolute bottom-2 left-2 z-10 font-sans font-semibold rounded-md px-2"
            style={{
              fontSize: '11px',
              height: '22px',
              lineHeight: '22px',
              letterSpacing: '0.06em',
              background: '#1C2340',
              color: '#fff',
              textTransform: 'uppercase',
            }}
          >
            Rupture de stock
          </span>
        )}

        {/* Wishlist button */}
        <button
          id={`wishlist-${product.id}`}
          aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={isWishlisted}
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm"
          style={{ width: '36px', height: '36px' }}
        >
          <Heart
            size={18}
            className={heartPulsing ? 'animate-heart-pulse' : ''}
            fill={isWishlisted ? '#E63946' : 'none'}
            color={isWishlisted ? '#E63946' : '#1C2340'}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        {/* Color swatches */}
        <div className="flex items-center gap-1">
          {colors.map((c) => (
            <span
              key={c.color}
              className="rounded-full border border-[#F9D7DA]"
              style={{
                width: '10px',
                height: '10px',
                background: c.colorHex,
                display: 'inline-block',
              }}
              title={c.colorName}
            />
          ))}
        </div>

        {/* Name */}
        <p
          className="font-sans text-[#1C2340] truncate"
          style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.3 }}
        >
          {product.name}
        </p>

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex flex-col">
            <span
              className="font-sans font-bold text-[#1C2340]"
              style={{ fontSize: '14px' }}
            >
              {product.price.toLocaleString('fr-DZ')} DZD
            </span>
            {product.originalPrice && (
              <span
                className="font-sans text-[#9CA3AF] line-through"
                style={{ fontSize: '12px' }}
              >
                {product.originalPrice.toLocaleString('fr-DZ')} DZD
              </span>
            )}
          </div>

          {/* Quick add button */}
          <button
            id={`quick-add-${product.id}`}
            aria-label={isOutOfStock ? `${product.name} en rupture de stock` : `Ajouter au panier — ${product.name}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex items-center justify-center rounded-full bg-[#1C2340] hover:bg-[#2D375F] active:scale-90 transition-all duration-200 disabled:cursor-not-allowed disabled:bg-[#9CA3AF] disabled:opacity-70"
            style={{ width: '34px', height: '34px', flexShrink: 0 }}
          >
            <ShoppingBag size={15} color="white" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </article>
  );
}
