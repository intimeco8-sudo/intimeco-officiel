import { supabase } from './client';

export async function validatePromoCode(code, orderTotal) {
    const normalizedCode = code.trim().toUpperCase();
    const numericOrderTotal = Number.parseFloat(orderTotal);

    if (!normalizedCode || !Number.isFinite(numericOrderTotal) || numericOrderTotal < 0) {
        return { valid: false, message: 'Code invalide' };
    }

    const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', normalizedCode)
        .eq('is_active', true)
        .maybeSingle();

    if (error || !data) {
        return { valid: false, message: 'Code invalide' };
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false, message: 'Code expire' };
    }

    if (data.max_uses && data.used_count >= data.max_uses) {
        return { valid: false, message: 'Code epuise' };
    }

    const minOrder = Number.parseFloat(data.min_order) || 0;
    if (numericOrderTotal < minOrder) {
        return {
            valid: false,
            message: `Commande minimum : ${minOrder.toLocaleString('fr-DZ')} DZD`,
        };
    }

    let discountAmount = 0;
    const discountValue = Number.parseFloat(data.discount_value) || 0;
    if (data.discount_type === 'percent') {
        discountAmount = Math.round((numericOrderTotal * discountValue) / 100);
    } else if (data.discount_type === 'fixed') {
        discountAmount = discountValue;
    }

    discountAmount = Math.min(discountAmount, numericOrderTotal);

    return { valid: true, data, discountAmount };
}

export async function fetchPromoCodes() {
    const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createPromoCode(promo) {
    const discountValue = Number.parseFloat(promo.discountValue);
    const minOrder = promo.minOrder === '' ? 0 : Number.parseFloat(promo.minOrder);
    const maxUses = promo.maxUses === '' ? null : Number.parseInt(promo.maxUses, 10);

    if (!promo.code?.trim()) {
        throw new Error('Le code promo est obligatoire');
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
        throw new Error('La valeur de reduction doit etre superieure a 0');
    }

    if (!Number.isFinite(minOrder) || minOrder < 0) {
        throw new Error('La commande minimum doit etre valide');
    }

    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
        throw new Error('Le nombre maximum d utilisations doit etre valide');
    }

    const { data, error } = await supabase
        .from('promo_codes')
        .insert([
            {
                code: promo.code.trim().toUpperCase(),
                discount_type: promo.discountType,
                discount_value: discountValue,
                min_order: minOrder,
                max_uses: maxUses,
                expires_at: promo.expiresAt || null,
                is_active: promo.isActive !== false,
            },
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updatePromoCode(id, updates) {
    const { data, error } = await supabase
        .from('promo_codes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deletePromoCode(id) {
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);

    if (error) throw error;
}

export async function togglePromoCodeActive(id, isActive) {
    const { data, error } = await supabase
        .from('promo_codes')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}
