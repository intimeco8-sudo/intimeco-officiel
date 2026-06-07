import { useState } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { createOrder } from '../supabase/orders';
import { validatePromoCode } from '../supabase/promos';
import { getProductImage } from '../utils/productImages';
import { DEFAULT_STORE_SETTINGS, getNumberSetting } from '../hooks/useStoreSettings';

const WILAYAS = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Bejaia', 'Biskra', 'Bechar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tebessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Setif', 'Saida', 'Skikda', 'Sidi Bel Abbes', 'Annaba', 'Guelma',
    'Constantine', 'Medea', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arreridj', 'Boumerdes', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Ain Defla', 'Naama', 'Ain Temouchent',
    'Ghardaia', 'Relizane',
];

const PAYMENT_METHODS = [
    {
        id: 'livraison',
        label: 'Paiement a la livraison',
        description: 'Payez en cash a la reception de votre commande',
    },
    {
        id: 'baridimob',
        label: 'BaridiMob',
        description: 'Paiement via application BaridiMob Algerie Poste',
    },
    {
        id: 'ccp',
        label: 'CCP',
        description: 'Virement CCP Algerie Poste',
    },
];

function InputField({ label, id, type = 'text', placeholder, value, onChange, required, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '14px' }}>
                {label}{required && <span className="text-[#E63946] ml-0.5">*</span>}
            </label>
            {children || (
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="border border-[#EBB4BB] rounded-xl px-4 font-sans text-[#1C2340] placeholder-[#9CA3AF] outline-none focus:border-[#1C2340] transition-colors"
                    style={{ height: '52px', fontSize: '15px' }}
                />
            )}
        </div>
    );
}

export default function CheckoutPage({ cartItems, onBack, onConfirm, settings = DEFAULT_STORE_SETTINGS, initialPromo = null }) {
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        wilaya: '',
        commune: '',
        payment: 'livraison',
        promoCode: initialPromo?.code || '',
    });

    const [promoValidation, setPromoValidation] = useState(
        initialPromo
            ? { valid: true, discountAmount: initialPromo.discountAmount, data: initialPromo.data }
            : null
    );
    const [promoApplied, setPromoApplied] = useState(Boolean(initialPromo));
    const [orderNumber, setOrderNumber] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    const deliveryBaseFee = getNumberSetting(settings, 'delivery_fee', 500);
    const freeDeliveryThreshold = getNumberSetting(settings, 'free_delivery_threshold', 3000);
    const deliveryFee = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : deliveryBaseFee;
    const discount = promoApplied && promoValidation?.valid ? promoValidation.discountAmount : 0;
    const total = subtotal + deliveryFee - discount;

    const handlePromoApply = async () => {
        if (!form.promoCode.trim()) return;

        try {
            const result = await validatePromoCode(form.promoCode.trim(), subtotal);
            setPromoValidation(result);
            if (result.valid) {
                setPromoApplied(true);
            } else {
                alert(result.message);
            }
        } catch {
            alert('Erreur lors de la validation du code promo');
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        try {
            const orderData = {
                customerName: form.fullName,
                customerPhone: form.phone,
                address: form.address,
                wilaya: form.wilaya,
                commune: form.commune,
                paymentMethod: form.payment,
                promoCode: promoApplied ? form.promoCode.trim().toUpperCase() : null,
                discountAmount: discount,
                subtotal: subtotal + deliveryFee,
                total,
            };

            const order = await createOrder(orderData, cartItems);
            setOrderNumber(order.order_number);
            setOrderPlaced(true);
            onConfirm?.();
        } catch (error) {
            console.error('Erreur lors de la creation de la commande:', error);
            alert('Erreur lors de la creation de la commande. Veuillez reessayer.');
        } finally {
            setSubmitting(false);
        }
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-[#FDE8EC] flex flex-col items-center justify-center px-6 text-center">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-lg">
                    <div className="w-16 h-16 rounded-full bg-[#F9D7DA] flex items-center justify-center mx-auto mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1C2340" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h2 className="font-serif text-[#1C2340]" style={{ fontSize: '24px', fontWeight: 600 }}>
                        Commande confirmee
                    </h2>
                    <p className="font-sans text-[#5A6080] mt-3 leading-relaxed" style={{ fontSize: '14px' }}>
                        Votre commande <strong>{orderNumber}</strong> a ete confirmee. Vous serez contacte sous peu pour la livraison.
                    </p>
                    <button
                        onClick={onBack}
                        className="mt-6 w-full bg-[#1C2340] text-white font-sans font-semibold rounded-full hover:bg-[#2D375F] transition-colors"
                        style={{ height: '52px', fontSize: '15px' }}
                    >
                        Retour a l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDE8EC] overflow-y-auto">
            <div className="max-w-screen-xl mx-auto px-4 py-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 mb-6 font-sans text-[#1C2340] hover:text-[#E8A5AE] transition-colors"
                    style={{ fontSize: '15px' }}
                >
                    <ChevronLeft size={20} strokeWidth={1.8} />
                    Retour
                </button>

                <h1 className="font-serif text-[#1C2340] mb-8" style={{ fontSize: '32px', fontWeight: 600 }}>
                    Finaliser la commande
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F9D7DA]">
                                <h2 className="font-serif text-[#1C2340] mb-4" style={{ fontSize: '20px', fontWeight: 600 }}>
                                    Informations de livraison
                                </h2>
                                <div className="space-y-4">
                                    <InputField
                                        label="Nom complet"
                                        id="fullName"
                                        placeholder="Votre nom complet"
                                        value={form.fullName}
                                        onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                                        required
                                    />

                                    <InputField
                                        label="Numero de telephone"
                                        id="phone"
                                        type="tel"
                                        placeholder="0XXX XX XX XX"
                                        value={form.phone}
                                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                        required
                                    />

                                    <InputField
                                        label="Adresse complete"
                                        id="address"
                                        placeholder="Rue, numero, batiment..."
                                        value={form.address}
                                        onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                                        required
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Wilaya" id="wilaya" required>
                                            <div className="relative">
                                                <select
                                                    id="wilaya"
                                                    value={form.wilaya}
                                                    onChange={(e) => setForm((p) => ({ ...p, wilaya: e.target.value }))}
                                                    required
                                                    className="w-full border border-[#EBB4BB] rounded-xl px-4 pr-10 font-sans text-[#1C2340] outline-none focus:border-[#1C2340] transition-colors appearance-none"
                                                    style={{ height: '52px', fontSize: '15px' }}
                                                >
                                                    <option value="">Selectionner une wilaya</option>
                                                    {WILAYAS.map((w) => (
                                                        <option key={w} value={w}>
                                                            {w}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
                                                    size={18}
                                                    color="#1C2340"
                                                    strokeWidth={1.8}
                                                />
                                            </div>
                                        </InputField>

                                        <InputField
                                            label="Commune"
                                            id="commune"
                                            placeholder="Nom de la commune"
                                            value={form.commune}
                                            onChange={(e) => setForm((p) => ({ ...p, commune: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F9D7DA]">
                                <h2 className="font-serif text-[#1C2340] mb-4" style={{ fontSize: '20px', fontWeight: 600 }}>
                                    Mode de paiement
                                </h2>
                                <div className="space-y-3">
                                    {PAYMENT_METHODS.map((method) => {
                                        const isSelected = form.payment === method.id;
                                        return (
                                            <label
                                                key={method.id}
                                                className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all"
                                                style={{
                                                    borderColor: isSelected ? '#1C2340' : '#EBB4BB',
                                                    background: isSelected ? '#FDE8EC' : 'transparent',
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value={method.id}
                                                    checked={isSelected}
                                                    onChange={(e) => setForm((p) => ({ ...p, payment: e.target.value }))}
                                                    className="mt-0.5"
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '15px' }}>
                                                        {method.label}
                                                    </p>
                                                    <p className="font-sans text-[#9CA3AF] mt-1" style={{ fontSize: '13px' }}>
                                                        {method.description}
                                                    </p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#1C2340] text-white font-sans font-semibold rounded-full hover:bg-[#2D375F] transition-colors disabled:opacity-50"
                                style={{ height: '56px', fontSize: '16px', letterSpacing: '0.04em' }}
                            >
                                {submitting ? 'Envoi en cours...' : 'Confirmer la commande'}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F9D7DA] sticky top-6">
                            <button
                                onClick={() => setSummaryOpen(!summaryOpen)}
                                className="flex items-center justify-between w-full mb-4 lg:pointer-events-none"
                            >
                                <h2 className="font-serif text-[#1C2340]" style={{ fontSize: '20px', fontWeight: 600 }}>
                                    Recapitulatif
                                </h2>
                                <ChevronDown
                                    size={20}
                                    color="#1C2340"
                                    strokeWidth={1.8}
                                    className={`lg:hidden transition-transform ${summaryOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            <div className={`space-y-4 ${summaryOpen ? 'block' : 'hidden lg:block'}`}>
                                <div className="space-y-3 max-h-64 overflow-y-auto border-b border-[#F9D7DA] pb-4">
                                    {cartItems.map((item) => (
                                        <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3">
                                            <img
                                                src={getProductImage(item)}
                                                alt={item.name}
                                                className="w-16 h-16 rounded-lg object-cover flex-none"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-sans text-[#1C2340] truncate" style={{ fontSize: '14px' }}>
                                                    {item.name}
                                                </p>
                                                <p className="font-sans text-[#9CA3AF]" style={{ fontSize: '12px' }}>
                                                    {item.selectedSize} — {item.selectedColor}
                                                </p>
                                                <p className="font-sans text-[#5A6080]" style={{ fontSize: '13px' }}>
                                                    {item.qty} × {item.price.toLocaleString('fr-DZ')} DZD
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={form.promoCode}
                                        onChange={(e) => setForm((p) => ({ ...p, promoCode: e.target.value.toUpperCase() }))}
                                        placeholder="Code promo"
                                        disabled={promoApplied}
                                        className="flex-1 border border-[#EBB4BB] rounded-lg px-3 py-2 font-sans text-[#1C2340] outline-none focus:border-[#1C2340] disabled:bg-[#F9D7DA]"
                                        style={{ fontSize: '13px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePromoApply}
                                        disabled={promoApplied}
                                        className="px-4 py-2 border border-[#1C2340] text-[#1C2340] font-sans font-semibold rounded-lg hover:bg-[#FDE8EC] transition-colors disabled:opacity-50"
                                        style={{ fontSize: '13px' }}
                                    >
                                        {promoApplied ? 'Applique' : 'Appliquer'}
                                    </button>
                                </div>

                                <div className="space-y-2 pt-2">
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
                                    {promoApplied && discount > 0 && (
                                        <div className="flex justify-between font-sans text-[#E63946]" style={{ fontSize: '14px' }}>
                                            <span>Reduction ({form.promoCode})</span>
                                            <span>-{discount.toLocaleString('fr-DZ')} DZD</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-sans font-bold text-[#1C2340] border-t border-[#F9D7DA] pt-2" style={{ fontSize: '18px' }}>
                                        <span>Total</span>
                                        <span>{total.toLocaleString('fr-DZ')} DZD</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
