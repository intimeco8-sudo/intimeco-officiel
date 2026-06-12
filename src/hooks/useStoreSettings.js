import { useEffect, useState } from 'react';
import { SETTINGS_UPDATED_EVENT, fetchSettings, subscribeToSettings } from '../supabase/settings';

export const DEFAULT_STORE_SETTINGS = {
    store_name: 'Intime & Co',
    announcement_text: "Livraison gratuite des 3000 DZD d'achat",
    delivery_fee: '500',
    free_delivery_threshold: '3000',
    promo_banner_eyebrow: 'Offre exclusive',
    promo_banner_title: "Jusqu'a -30% sur les ensembles",
    promo_banner_description: "Profitez de nos promotions exceptionnelles sur une selection de nos plus belles pieces. Livraison gratuite des 3 000 DZD d'achat.",
    promo_banner_cta: 'Commander les promotions',
    instagram_url: 'https://www.instagram.com/inti.me15',
    store_phone: '+213 555 00 00 00',
    store_address: 'Draa El Mizan, Tizi Ouzou, Algerie',
    store_hours: 'Lun-Sam : 09h00 - 19h00',
};

export function getNumberSetting(settings, key, fallback) {
    const value = Number.parseFloat(settings?.[key]);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function getPhoneHref(phone) {
    const cleaned = String(phone || '').replace(/[^\d+]/g, '');
    return cleaned ? `tel:${cleaned}` : '#contact';
}

export default function useStoreSettings() {
    const [settings, setSettings] = useState(DEFAULT_STORE_SETTINGS);

    useEffect(() => {
        let mounted = true;

        const loadSettings = async () => {
            try {
                const data = await fetchSettings();
                if (mounted) {
                    setSettings((prev) => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Erreur lors du chargement des parametres:', error);
            }
        };

        loadSettings();

        const handleSettingsRefresh = () => {
            loadSettings();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadSettings();
            }
        };

        const handleStorage = (event) => {
            if (event.key === SETTINGS_UPDATED_EVENT) {
                loadSettings();
            }
        };

        const unsubscribe = subscribeToSettings((payload) => {
            const next = payload?.new;
            if (next?.key) {
                setSettings((prev) => ({ ...prev, [next.key]: next.value ?? '' }));
            }
        });

        window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsRefresh);
        window.addEventListener('storage', handleStorage);
        window.addEventListener('focus', handleSettingsRefresh);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            mounted = false;
            window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsRefresh);
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('focus', handleSettingsRefresh);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            unsubscribe();
        };
    }, []);

    return settings;
}
