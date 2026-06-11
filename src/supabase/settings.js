import { supabase } from './client';

export const SETTINGS_UPDATED_EVENT = 'intime-settings-updated';

export function notifySettingsChanged() {
    const timestamp = String(Date.now());
    try {
        window.localStorage.setItem(SETTINGS_UPDATED_EVENT, timestamp);
    } catch {
        // Local storage can be unavailable in private contexts; realtime/focus refresh still works.
    }
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT));
}

export async function fetchSettings() {
    const { data, error } = await supabase.from('settings').select('*');

    if (error) throw error;

    const settings = {};
    data?.forEach((row) => {
        settings[row.key] = row.value;
    });

    return settings;
}

export async function fetchSettingByKey(key) {
    const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

    if (error) throw error;
    return data?.value || null;
}

export async function updateSetting(key, value) {
    const { data, error } = await supabase
        .from('settings')
        .upsert({ key, value: String(value ?? ''), updated_at: new Date().toISOString() }, { onConflict: 'key' })
        .select()
        .single();

    if (error) throw error;
    notifySettingsChanged();
    return data;
}

export async function bulkUpdateSettings(settingsObj) {
    const updates = Object.entries(settingsObj).map(([key, value]) => ({
        key,
        value: String(value ?? ''),
        updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
        .from('settings')
        .upsert(updates, { onConflict: 'key' })
        .select();

    if (error) throw error;
    notifySettingsChanged();
    return data;
}

export function subscribeToSettings(callback) {
    const channel = supabase
        .channel('settings-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'settings',
            },
            (payload) => {
                callback(payload);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
