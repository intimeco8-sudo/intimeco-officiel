import { useState, useEffect } from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { getProductImage } from '../utils/productImages';
import { DEFAULT_STORE_SETTINGS, getNumberSetting } from '../hooks/useStoreSettings';
import { validatePromoCode } from '../supabase/promos';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemove,
  onCheckout,
  settings = DEFAULT_STORE_SETTINGS,
  appliedPromo = null,
  onPromoApplied,
}) {
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    setPromoCode(appliedPromo?.code || '');
    setPromoMessage(appliedPromo ? 'Code promo applique' : '');
  }, [appliedPromo]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryBaseFee = getNumberSetting(settings, 'delivery_fee', 500);
  const freeDeliveryThreshold = getNumberSetting(settings, 'free_delivery_threshold', 3000);
  const deliveryFee = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : deliveryBaseFee;
  const discount = appliedPromo?.discountAmount || 0;
  const total = subtotal + deliveryFee - discount;

  async function applyPromo() {
    const code = promoCode.trim();
    if (!code || promoLoading || appliedPromo) return;

    setPromoLoading(true);
    setPromoMessage('');

    try {
      const result = await validatePromoCode(code, subtotal);
      if (result.valid) {
        onPromoApplied?.({
          code: code.toUpperCase(),
          discountAmount: result.discountAmount,
          data: result.data,
        });
        setPromoMessage('Code promo applique');
      } else {
        onPromoApplied?.(null);
        setPromoMessage(result.message || 'Code invalide');
      }
    } catch {
      onPromoApplied?.(null);
      setPromoMessage('Erreur lors de la validation du code promo');
    } finally {
      setPromoLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#1C2340]/40 transition-sheet"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer — bottom sheet on mobile, right side on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
        className="fixed z-50 bg-white flex flex-col transition-sheet overscroll-contain
                   bottom-0 left-0 right-0 rounded-t-2xl
                   md:inset-y-0 md:right-0 md:left-auto md:rounded-none md:rounded-l-2xl"
        style={{
          transform: isOpen ? 'translateY(0) translateX(0)' : 'translateY(100%)',
          maxHeight: '92vh',
          maxWidth: '400px',
          width: '100%',
          marginLeft: 'auto',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        {/* Handle (mobile only) */}
        <div className="md:hidden pt-3 px-5 flex-none">
          <div className="mx-auto w-10 h-1 rounded-full bg-[#EBB4BB]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F9D7DA]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} color="#1C2340" strokeWidth={1.8} />
            <h2 className="font-serif text-[#1C2340]" style={{ fontSize: '20px', fontWeight: 600 }}>
              Panier
            </h2>
            {cartItems.length > 0 && (
              <span
                className="font-sans bg-[#1C2340] text-white rounded-full flex items-center justify-center"
                style={{ width: '20px', height: '20px', fontSize: '11px', fontWeight: 600 }}
              >
                {cartItems.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          <button
            id="cart-close-btn"
            onClick={onClose}
            aria-label="Fermer le panier"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#FDE8EC] transition-colors"
          >
            <X size={20} color="#1C2340" strokeWidth={1.8} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <ShoppingBag size={48} color="#EBB4BB" strokeWidth={1} />
              <p className="font-serif text-[#9CA3AF]" style={{ fontSize: '20px' }}>
                Votre panier est vide
              </p>
              <button
                onClick={onClose}
                className="font-sans text-[#1C2340] underline"
                style={{ fontSize: '14px' }}
              >
                Continuer les achats
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                className="flex gap-3 py-3 border-b border-[#F9D7DA] last:border-0"
              >
                {/* Thumbnail */}
                <img
                  src={getProductImage(item)}
                  alt={item.name}
                  className="rounded-lg object-cover flex-none"
                  style={{ width: '72px', height: '72px' }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-sans font-semibold text-[#1C2340] truncate"
                    style={{ fontSize: '14px' }}
                  >
                    {item.name}
                  </p>
                  <p className="font-sans text-[#9CA3AF] mt-0.5" style={{ fontSize: '12px' }}>
                    {[item.selectedSize, item.selectedColor].filter(Boolean).join(' — ')}
                  </p>
                  <p className="font-sans font-bold text-[#1C2340] mt-1" style={{ fontSize: '14px' }}>
                    {(item.price * item.qty).toLocaleString('fr-DZ')} DZD
                  </p>
                </div>

                {/* Qty + remove */}
                <div className="flex flex-col items-end justify-between gap-2">
                  <button
                    onClick={() => onRemove(item)}
                    aria-label={`Supprimer ${item.name}`}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#FDE8EC] transition-colors"
                  >
                    <Trash2 size={14} color="#9CA3AF" strokeWidth={1.8} />
                  </button>
                  <div className="flex items-center gap-1 rounded-full border border-[#EBB4BB] overflow-hidden">
                    <button
                      onClick={() => onUpdateQty(item, item.qty - 1)}
                      aria-label="Reduire"
                      className="flex items-center justify-center hover:bg-[#FDE8EC] transition-colors"
                      style={{ width: '30px', height: '30px' }}
                    >
                      <Minus size={12} color="#1C2340" strokeWidth={2} />
                    </button>
                    <span
                      className="font-sans font-semibold text-[#1C2340] text-center"
                      style={{ minWidth: '24px', fontSize: '13px' }}
                    >
                      {item.qty}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item, item.qty + 1)}
                      aria-label="Augmenter"
                      className="flex items-center justify-center hover:bg-[#FDE8EC] transition-colors"
                      style={{ width: '30px', height: '30px' }}
                    >
                      <Plus size={12} color="#1C2340" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="flex-none border-t border-[#F9D7DA] px-5 pt-4 pb-2 space-y-3">
            {/* Promo code */}
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoMessage('');
                }}
                placeholder="Code promo"
                aria-label="Code promo"
                className="flex-1 border border-[#EBB4BB] rounded-full px-4 font-sans text-[#1C2340] placeholder-[#9CA3AF] outline-none focus:border-[#1C2340] transition-colors"
                style={{ height: '44px', fontSize: '14px' }}
                disabled={Boolean(appliedPromo)}
              />
              <button
                id="promo-apply-btn"
                onClick={applyPromo}
                disabled={Boolean(appliedPromo) || promoLoading}
                className="rounded-full border border-[#1C2340] px-4 font-sans font-semibold text-[#1C2340] hover:bg-[#FDE8EC] transition-colors disabled:opacity-50"
                style={{ height: '44px', fontSize: '13px' }}
              >
                {appliedPromo ? 'Applique' : promoLoading ? '...' : 'Appliquer'}
              </button>
            </div>
            {promoMessage && (
              <p
                className={`font-sans ${appliedPromo ? 'text-[#10B981]' : 'text-[#E63946]'}`}
                style={{ fontSize: '12px' }}
              >
                {promoMessage}
              </p>
            )}

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between font-sans text-[#5A6080]" style={{ fontSize: '14px' }}>
                <span>Sous-total</span>
                <span>{subtotal.toLocaleString('fr-DZ')} DZD</span>
              </div>
              <div className="flex justify-between font-sans text-[#5A6080]" style={{ fontSize: '14px' }}>
                <span>Livraison</span>
                <span>{deliveryFee === 0 ? 'Gratuite' : `${deliveryFee.toLocaleString('fr-DZ')} DZD`}</span>
              </div>
              {freeDeliveryThreshold > 0 && subtotal < freeDeliveryThreshold && (
                <p className="font-sans text-[#9CA3AF]" style={{ fontSize: '12px' }}>
                  Livraison gratuite des {freeDeliveryThreshold.toLocaleString('fr-DZ')} DZD d'achat
                </p>
              )}
              {discount > 0 && (
                <div className="flex justify-between font-sans text-[#E63946]" style={{ fontSize: '14px' }}>
                  <span>Reduction ({appliedPromo?.code})</span>
                  <span>- {discount.toLocaleString('fr-DZ')} DZD</span>
                </div>
              )}
              <div className="flex justify-between font-sans font-bold text-[#1C2340] pt-1 border-t border-[#F9D7DA]" style={{ fontSize: '16px' }}>
                <span>Total</span>
                <span>{total.toLocaleString('fr-DZ')} DZD</span>
              </div>
            </div>

            <button
              id="cart-checkout-btn"
              onClick={onCheckout}
              className="w-full bg-[#1C2340] text-white font-sans font-semibold rounded-full hover:bg-[#2D375F] transition-colors duration-200"
              style={{ height: '52px', fontSize: '15px', letterSpacing: '0.04em' }}
            >
              Passer la commande
            </button>
          </div>
        )}
      </div>
    </>
  );
}
