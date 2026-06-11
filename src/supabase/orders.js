import { supabase } from './client';

export async function createOrder(orderData, cartItems) {
    const { data, error } = await supabase.rpc('create_checkout_order', {
        order_data: orderData,
        cart_items: cartItems,
    });

    if (error) throw error;

    return Array.isArray(data) ? data[0] : data;
}

export async function fetchOrders({
    status = null,
    wilaya = null,
    searchQuery = null,
    dateFrom = null,
    dateTo = null,
    limit = 100,
    offset = 0,
}) {
    let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (status && status !== 'tous') {
        query = query.eq('status', status);
    }

    if (wilaya) {
        query = query.eq('wilaya', wilaya);
    }

    if (searchQuery) {
        query = query.or(
            `order_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`
        );
    }

    if (dateFrom) {
        query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
        query = query.lte('created_at', dateTo);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { orders: data || [], total: count || 0 };
}

export async function fetchOrderById(id) {
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

    if (orderError) throw orderError;

    const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

    if (itemsError) throw itemsError;

    return { ...order, items: items || [] };
}

export async function updateOrderStatus(id, status) {
    const { data, error } = await supabase.rpc('update_order_status', {
        order_id: id,
        new_status: status,
    });

    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
}

export async function updateOrderNotes(id, notes) {
    const { data, error } = await supabase
        .from('orders')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function fetchTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: orders, error } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', today.toISOString());

    if (error) throw error;

    const todayCount = orders?.length || 0;
    const todayRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total), 0) || 0;
    const pendingCount = orders?.filter((o) => o.status === 'en_attente').length || 0;

    return { todayCount, todayRevenue, pendingCount };
}

