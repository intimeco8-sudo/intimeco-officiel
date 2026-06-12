import { useState, useEffect } from 'react';
import { fetchSettings, bulkUpdateSettings } from '../../supabase/settings';
import { DEFAULT_STORE_SETTINGS } from '../../hooks/useStoreSettings';

export default function Settings() {
    const [formData, setFormData] = useState({
        store_name: '',
        announcement_text: '',
        delivery_fee: '',
        free_delivery_threshold: '',
        promo_banner_eyebrow: '',
        promo_banner_title: '',
        promo_banner_description: '',
        promo_banner_cta: '',
        instagram_url: '',
        store_phone: '',
        store_address: '',
        store_hours: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState('success');

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await fetchSettings();
                setFormData({
                    store_name: settings.store_name || '',
                    announcement_text: settings.announcement_text || '',
                    delivery_fee: settings.delivery_fee || '',
                    free_delivery_threshold: settings.free_delivery_threshold || '',
                    promo_banner_eyebrow: settings.promo_banner_eyebrow || DEFAULT_STORE_SETTINGS.promo_banner_eyebrow,
                    promo_banner_title: settings.promo_banner_title || DEFAULT_STORE_SETTINGS.promo_banner_title,
                    promo_banner_description: settings.promo_banner_description || DEFAULT_STORE_SETTINGS.promo_banner_description,
                    promo_banner_cta: settings.promo_banner_cta || DEFAULT_STORE_SETTINGS.promo_banner_cta,
                    instagram_url: settings.instagram_url || '',
                    store_phone: settings.store_phone || '',
                    store_address: settings.store_address || '',
                    store_hours: settings.store_hours || '',
                });
            } catch (error) {
                console.error('Erreur lors du chargement des parametres:', error);
                setStatusType('error');
                setStatusMessage('Impossible de charger les parametres.');
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatusMessage('');

        try {
            await bulkUpdateSettings(formData);
            setStatusType('success');
            setStatusMessage('Parametres enregistres avec succes.');
        } catch {
            setStatusType('error');
            setStatusMessage('Erreur lors de la sauvegarde des parametres.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="font-sans text-[#9CA3AF]">Chargement...</div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="font-serif text-[#1C2340]" style={{ fontSize: '28px', fontWeight: 600 }}>
                Parametres
            </h2>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-[#F9D7DA]">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                            Nom de la boutique
                        </label>
                        <input
                            type="text"
                            value={formData.store_name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, store_name: e.target.value }))}
                            className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                            style={{ fontSize: '14px' }}
                        />
                    </div>

                    <div>
                        <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                            Texte de l'annonce
                        </label>
                        <textarea
                            value={formData.announcement_text}
                            onChange={(e) => setFormData((prev) => ({ ...prev, announcement_text: e.target.value }))}
                            rows={3}
                            className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340] resize-y"
                            style={{ fontSize: '14px' }}
                            placeholder="Livraison gratuite des 3000 DZD d'achat..."
                        />
                        <p className="font-sans text-[#9CA3AF] mt-1" style={{ fontSize: '12px' }}>
                            Le texte defile sur une seule ligne dans la boutique.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                                Frais de livraison (DZD)
                            </label>
                            <input
                                type="number"
                                value={formData.delivery_fee}
                                onChange={(e) => setFormData((prev) => ({ ...prev, delivery_fee: e.target.value }))}
                                min="0"
                                step="0.01"
                                className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                                style={{ fontSize: '14px' }}
                            />
                        </div>

                        <div>
                            <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                                Seuil livraison gratuite (DZD)
                            </label>
                            <input
                                type="number"
                                value={formData.free_delivery_threshold}
                                onChange={(e) => setFormData((prev) => ({ ...prev, free_delivery_threshold: e.target.value }))}
                                min="0"
                                step="0.01"
                                className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                                style={{ fontSize: '14px' }}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#F9D7DA] bg-[#FDE8EC] px-4 py-3">
                        <h3 className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '15px' }}>
                            Offre exclusive
                        </h3>
                        <p className="font-sans text-[#5A6080] mt-1" style={{ fontSize: '12px' }}>
                            Texte visible dans la banniere promotionnelle de la boutique.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                                Petit titre
                            </label>
                            <input
                                type="text"
                                value={formData.promo_banner_eyebrow}
                                onChange={(e) => setFormData((prev) => ({ ...prev, promo_banner_eyebrow: e.target.value }))}
                                className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                                style={{ fontSize: '14px' }}
                                placeholder="Offre exclusive"
                            />
                        </div>

                        <div>
                            <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                                Bouton
                            </label>
                            <input
                                type="text"
                                value={formData.promo_banner_cta}
                                onChange={(e) => setFormData((prev) => ({ ...prev, promo_banner_cta: e.target.value }))}
                                className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                                style={{ fontSize: '14px' }}
                                placeholder="Commander les promotions"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                            Grand titre
                        </label>
                        <input
                            type="text"
                            value={formData.promo_banner_title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, promo_banner_title: e.target.value }))}
                            className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                            style={{ fontSize: '14px' }}
                            placeholder="Jusqu'a -30% sur les ensembles"
                        />
                    </div>

                    <div>
                        <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                            Description
                        </label>
                        <textarea
                            value={formData.promo_banner_description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, promo_banner_description: e.target.value }))}
                            rows={3}
                            className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340] resize-y"
                            style={{ fontSize: '14px' }}
                            placeholder="Profitez de nos promotions exceptionnelles..."
                        />
                    </div>

                    <div>
                        <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                            Telephone de la boutique
                        </label>
                        <input
                            type="tel"
                            value={formData.store_phone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, store_phone: e.target.value }))}
                            className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                            style={{ fontSize: '14px' }}
                            placeholder="+213 XX XX XX XX"
                        />
                    </div>

                    <div>
                        <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                            Adresse de la boutique
                        </label>
                        <input
                            type="text"
                            value={formData.store_address}
                            onChange={(e) => setFormData((prev) => ({ ...prev, store_address: e.target.value }))}
                            className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                            style={{ fontSize: '14px' }}
                            placeholder="Blida, Algerie"
                        />
                    </div>

                    <div>
                        <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                            Horaires d'ouverture
                        </label>
                        <input
                            type="text"
                            value={formData.store_hours}
                            onChange={(e) => setFormData((prev) => ({ ...prev, store_hours: e.target.value }))}
                            className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                            style={{ fontSize: '14px' }}
                            placeholder="Lun–Sam : 09h00 – 19h00"
                        />
                    </div>

                    <div>
                        <label className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                            URL Instagram
                        </label>
                        <input
                            type="url"
                            value={formData.instagram_url}
                            onChange={(e) => setFormData((prev) => ({ ...prev, instagram_url: e.target.value }))}
                            className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                            style={{ fontSize: '14px' }}
                            placeholder="https://www.instagram.com/..."
                        />
                    </div>

                    {statusMessage && (
                        <p
                            className={`font-sans ${statusType === 'error' ? 'text-[#E63946]' : 'text-[#10B981]'}`}
                            style={{ fontSize: '13px' }}
                            aria-live="polite"
                        >
                            {statusMessage}
                        </p>
                    )}

                    <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-0 bg-white/95 sm:bg-transparent border-t sm:border-0 border-[#F9D7DA]">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full md:w-auto px-8 py-3 bg-[#1C2340] text-white font-sans font-semibold rounded-full hover:bg-[#2D375F] transition-colors disabled:opacity-50"
                            style={{ fontSize: '15px' }}
                        >
                            {saving ? 'Enregistrement...' : 'Enregistrer les parametres'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
