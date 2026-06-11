import { useState, useEffect } from 'react';
import { Search, Eye, Printer } from 'lucide-react';
import { fetchOrders, fetchOrderById, updateOrderStatus, updateOrderNotes } from '../../supabase/orders';
import OrderStatusBadge from '../components/OrderStatusBadge';

const WILAYAS = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Bejaia', 'Biskra', 'Bechar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tebessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Setif', 'Saida', 'Skikda', 'Sidi Bel Abbes', 'Annaba', 'Guelma',
    'Constantine', 'Medea', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arreridj', 'Boumerdes', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Ain Defla', 'Naama', 'Ain Temouchent',
    'Ghardaia', 'Relizane',
];

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatDzd(value) {
    return `${Number.parseFloat(value || 0).toLocaleString('fr-DZ')} DZD`;
}

function OrderDetailModal({ order, onClose, onStatusChange, onNotesChange }) {
    const [status, setStatus] = useState(order.status);
    const [notes, setNotes] = useState(order.notes || '');

    const handleStatusChange = async (newStatus) => {
        try {
            await updateOrderStatus(order.id, newStatus);
            setStatus(newStatus);
            onStatusChange(order.id, newStatus);
        } catch {
            alert('Erreur lors de la mise a jour du statut');
        }
    };

    const handleNotesSave = async () => {
        try {
            await updateOrderNotes(order.id, notes);
            onNotesChange(order.id, notes);
            alert('Notes enregistrees');
        } catch {
            alert('Erreur lors de la sauvegarde des notes');
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('La fenetre d impression a ete bloquee par le navigateur');
            return;
        }
        const logoUrl = `${window.location.origin}/intime-logo.jpg`;
        const orderDate = new Date(order.created_at).toLocaleDateString('fr-FR');
        const orderDateTime = new Date(order.created_at).toLocaleString('fr-FR');
        const rowsHtml = order.items.map((item) => `
                <tr>
                  <td>
                    <strong>${escapeHtml(item.product_name)}</strong>
                    <span>${escapeHtml([item.size, item.color].filter(Boolean).join(' / ') || 'Article')}</span>
                  </td>
                  <td>${escapeHtml(item.size || '-')}</td>
                  <td>${escapeHtml(item.color || '-')}</td>
                  <td class="qty">${escapeHtml(item.quantity)}</td>
                  <td class="money">${formatDzd(item.product_price)}</td>
                  <td class="money strong">${formatDzd(item.subtotal)}</td>
                </tr>
              `).join('');

        printWindow.document.write(`
      <html>
        <head>
          <title>Bon de livraison - ${order.order_number}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #FDE8EC;
              color: #1C2340;
              font-family: "Jost", "Segoe UI", Arial, sans-serif;
              font-size: 13px;
              line-height: 1.45;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 18mm;
              background: #FFFDFD;
            }
            .frame {
              border: 1px solid #F4CBD1;
              border-radius: 18px;
              overflow: hidden;
              background: #fff;
            }
            .header {
              display: grid;
              grid-template-columns: 92px 1fr auto;
              gap: 18px;
              align-items: center;
              padding: 22px 24px;
              background: linear-gradient(135deg, #FDE8EC 0%, #F9D7DA 100%);
              border-bottom: 1px solid #EBB4BB;
            }
            .logo {
              width: 82px;
              height: 82px;
              border-radius: 50%;
              object-fit: cover;
              border: 3px solid rgba(255,255,255,0.88);
              box-shadow: 0 10px 26px rgba(28,35,64,0.12);
            }
            .brand {
              margin: 0;
              font-family: Georgia, "Times New Roman", serif;
              font-size: 30px;
              letter-spacing: 0.08em;
              font-weight: 600;
            }
            .subtitle {
              margin: 5px 0 0;
              color: #5A6080;
              font-style: italic;
            }
            .meta-card {
              min-width: 190px;
              padding: 12px 14px;
              border: 1px solid rgba(235,180,187,0.75);
              border-radius: 12px;
              background: rgba(255,255,255,0.72);
            }
            .meta-card p { margin: 0; }
            .meta-card strong {
              display: block;
              margin-top: 3px;
              font-size: 15px;
            }
            .content { padding: 24px; }
            .section-title {
              margin: 0 0 12px;
              color: #1C2340;
              font-family: Georgia, "Times New Roman", serif;
              font-size: 18px;
              font-weight: 600;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
              margin-bottom: 22px;
            }
            .info-box {
              min-height: 128px;
              padding: 15px 16px;
              border: 1px solid #F4CBD1;
              border-radius: 14px;
              background: #FFF7F8;
            }
            .info-box p { margin: 5px 0; color: #5A6080; }
            .info-box strong { color: #1C2340; }
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              overflow: hidden;
              border: 1px solid #F4CBD1;
              border-radius: 14px;
            }
            th {
              padding: 10px 11px;
              background: #1C2340;
              color: white;
              text-align: left;
              font-size: 11px;
              letter-spacing: 0.04em;
              text-transform: uppercase;
            }
            td {
              padding: 11px;
              border-bottom: 1px solid #F9D7DA;
              color: #5A6080;
              vertical-align: top;
            }
            tbody tr:last-child td { border-bottom: 0; }
            td strong {
              display: block;
              color: #1C2340;
              font-size: 13px;
            }
            td span {
              display: block;
              margin-top: 2px;
              color: #9CA3AF;
              font-size: 11px;
            }
            .qty { text-align: center; color: #1C2340; font-weight: 700; }
            .money { text-align: right; white-space: nowrap; }
            .strong { color: #1C2340; font-weight: 700; }
            .summary {
              display: grid;
              grid-template-columns: 1fr 260px;
              gap: 18px;
              margin-top: 22px;
              align-items: start;
            }
            .note {
              padding: 14px 16px;
              border-left: 4px solid #EBB4BB;
              background: #FFF7F8;
              color: #5A6080;
              border-radius: 10px;
            }
            .totals {
              padding: 14px 16px;
              border: 1px solid #F4CBD1;
              border-radius: 14px;
              background: #FFF7F8;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              margin: 7px 0;
              color: #5A6080;
            }
            .total-row.discount { color: #E63946; }
            .total-row.final {
              margin-top: 11px;
              padding-top: 11px;
              border-top: 1px solid #EBB4BB;
              color: #1C2340;
              font-size: 18px;
              font-weight: 800;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              padding: 16px 24px 20px;
              border-top: 1px solid #F4CBD1;
              color: #9CA3AF;
              font-size: 11px;
            }
            @page { size: A4; margin: 0; }
            @media print {
              body { background: white; }
              .page { width: auto; min-height: auto; padding: 12mm; }
              .frame, .info-box, table, .totals { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <main class="page">
            <section class="frame">
              <header class="header">
                <img class="logo" src="${logoUrl}" alt="Intime & Co" />
                <div>
                  <h1 class="brand">INTIME & CO</h1>
                  <p class="subtitle">Bon de livraison</p>
                </div>
                <div class="meta-card">
                  <p>Commande</p>
                  <strong>${escapeHtml(order.order_number)}</strong>
                  <p style="margin-top:8px;">Date: ${escapeHtml(orderDate)}</p>
                </div>
              </header>

              <div class="content">
                <div class="grid">
                  <section class="info-box">
                    <h2 class="section-title">Client</h2>
                    <p><strong>Nom:</strong> ${escapeHtml(order.customer_name)}</p>
                    <p><strong>Telephone:</strong> ${escapeHtml(order.customer_phone)}</p>
                  </section>
                  <section class="info-box">
                    <h2 class="section-title">Livraison</h2>
                    <p><strong>Adresse:</strong> ${escapeHtml(order.address)}</p>
                    <p><strong>Commune:</strong> ${escapeHtml(order.commune)}</p>
                    <p><strong>Wilaya:</strong> ${escapeHtml(order.wilaya)}</p>
                  </section>
                </div>

                <h2 class="section-title">Articles commandes</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Taille</th>
                      <th>Couleur</th>
                      <th>Qte</th>
                      <th>Prix</th>
                      <th>Sous-total</th>
                    </tr>
                  </thead>
                  <tbody>${rowsHtml}</tbody>
                </table>

                <section class="summary">
                  <div class="note">
                    <strong>Mode de paiement:</strong> ${escapeHtml(order.payment_method)}<br />
                    Merci de verifier les articles et les informations client avant expedition.
                  </div>
                  <div class="totals">
                    <div class="total-row">
                      <span>Sous-total</span>
                      <strong>${formatDzd(order.subtotal)}</strong>
                    </div>
                    ${order.discount_amount > 0 ? `
                    <div class="total-row discount">
                      <span>Reduction${order.promo_code ? ` (${escapeHtml(order.promo_code)})` : ''}</span>
                      <strong>-${formatDzd(order.discount_amount)}</strong>
                    </div>` : ''}
                    <div class="total-row final">
                      <span>Total</span>
                      <strong>${formatDzd(order.total)}</strong>
                    </div>
                  </div>
                </section>
              </div>

              <footer class="footer">
                <span>Intime & Co</span>
                <span>Commande creee le ${escapeHtml(orderDateTime)}</span>
              </footer>
            </section>
          </main>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    return (
        <>
            <div className="fixed inset-0 z-50 bg-[#1C2340]/40" onClick={onClose} style={{ backdropFilter: 'blur(2px)' }} />
            <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
                <div className="bg-white sm:rounded-2xl p-4 sm:p-6 w-full max-w-3xl shadow-xl sm:my-8 min-h-screen sm:min-h-0">
                    <div className="sticky top-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-0 bg-white/95 sm:bg-white z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 border-b sm:border-0 border-[#F9D7DA]">
                        <h3 className="font-serif text-[#1C2340]" style={{ fontSize: '24px', fontWeight: 600 }}>
                            Commande {order.order_number}
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2 rounded-full border border-[#EBB4BB] font-sans text-[#1C2340] hover:bg-[#FDE8EC] transition-colors"
                                style={{ fontSize: '14px' }}
                            >
                                <Printer size={16} strokeWidth={1.8} />
                                Imprimer
                            </button>
                            <button onClick={onClose} className="font-sans text-[#1C2340] underline" style={{ fontSize: '14px' }}>
                                Fermer
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-sans font-semibold text-[#1C2340] mb-3" style={{ fontSize: '16px' }}>
                                Statut de la commande
                            </h4>
                            <select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full border border-[#EBB4BB] rounded-lg px-4 py-2 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                                style={{ fontSize: '14px' }}
                            >
                                <option value="en_attente">En attente</option>
                                <option value="confirme">Confirme</option>
                                <option value="en_preparation">En preparation</option>
                                <option value="expedie">Expedie</option>
                                <option value="livre">Livre</option>
                                <option value="annule">Annule</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#FDE8EC] rounded-lg p-4">
                                <h4 className="font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                                    Informations client
                                </h4>
                                <div className="space-y-1 font-sans text-[#5A6080]" style={{ fontSize: '13px' }}>
                                    <p><strong>Nom:</strong> {order.customer_name}</p>
                                    <p><strong>Telephone:</strong> {order.customer_phone}</p>
                                </div>
                            </div>

                            <div className="bg-[#FDE8EC] rounded-lg p-4">
                                <h4 className="font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                                    Livraison
                                </h4>
                                <div className="space-y-1 font-sans text-[#5A6080]" style={{ fontSize: '13px' }}>
                                    <p><strong>Adresse:</strong> {order.address}</p>
                                    <p><strong>Commune:</strong> {order.commune}</p>
                                    <p><strong>Wilaya:</strong> {order.wilaya}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-sans font-semibold text-[#1C2340] mb-3" style={{ fontSize: '16px' }}>
                                Articles commandes
                            </h4>
                            <div className="border border-[#F9D7DA] rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-[#FDE8EC]">
                                        <tr>
                                            <th className="text-left font-sans font-semibold text-[#1C2340] py-2 px-3" style={{ fontSize: '13px' }}>
                                                Produit
                                            </th>
                                            <th className="text-left font-sans font-semibold text-[#1C2340] py-2 px-3" style={{ fontSize: '13px' }}>
                                                Taille
                                            </th>
                                            <th className="text-left font-sans font-semibold text-[#1C2340] py-2 px-3" style={{ fontSize: '13px' }}>
                                                Couleur
                                            </th>
                                            <th className="text-left font-sans font-semibold text-[#1C2340] py-2 px-3" style={{ fontSize: '13px' }}>
                                                Qte
                                            </th>
                                            <th className="text-right font-sans font-semibold text-[#1C2340] py-2 px-3" style={{ fontSize: '13px' }}>
                                                Prix
                                            </th>
                                            <th className="text-right font-sans font-semibold text-[#1C2340] py-2 px-3" style={{ fontSize: '13px' }}>
                                                Sous-total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item) => (
                                            <tr key={item.id} className="border-t border-[#F9D7DA]">
                                                <td className="font-sans text-[#1C2340] py-2 px-3" style={{ fontSize: '14px' }}>
                                                    {item.product_name}
                                                </td>
                                                <td className="font-sans text-[#5A6080] py-2 px-3" style={{ fontSize: '14px' }}>
                                                    {item.size || '-'}
                                                </td>
                                                <td className="font-sans text-[#5A6080] py-2 px-3" style={{ fontSize: '14px' }}>
                                                    {item.color || '-'}
                                                </td>
                                                <td className="font-sans text-[#5A6080] py-2 px-3" style={{ fontSize: '14px' }}>
                                                    {item.quantity}
                                                </td>
                                                <td className="font-sans text-right text-[#5A6080] py-2 px-3" style={{ fontSize: '14px' }}>
                                                    {parseFloat(item.product_price).toLocaleString('fr-DZ')} DZD
                                                </td>
                                                <td className="font-sans font-semibold text-right text-[#1C2340] py-2 px-3" style={{ fontSize: '14px' }}>
                                                    {parseFloat(item.subtotal).toLocaleString('fr-DZ')} DZD
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-[#FDE8EC] rounded-lg p-4 space-y-2">
                            <div className="flex justify-between font-sans text-[#5A6080]" style={{ fontSize: '14px' }}>
                                <span>Sous-total</span>
                                <span>{parseFloat(order.subtotal).toLocaleString('fr-DZ')} DZD</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between font-sans text-[#E63946]" style={{ fontSize: '14px' }}>
                                    <span>Reduction ({order.promo_code})</span>
                                    <span>-{parseFloat(order.discount_amount).toLocaleString('fr-DZ')} DZD</span>
                                </div>
                            )}
                            <div className="flex justify-between font-sans font-bold text-[#1C2340] border-t border-[#EBB4BB] pt-2" style={{ fontSize: '18px' }}>
                                <span>Total</span>
                                <span>{parseFloat(order.total).toLocaleString('fr-DZ')} DZD</span>
                            </div>
                            <p className="font-sans text-[#5A6080]" style={{ fontSize: '13px' }}>
                                <strong>Paiement:</strong> {order.payment_method}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                                Notes internes
                            </h4>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340] resize-none"
                                style={{ fontSize: '14px' }}
                                placeholder="Notes pour usage interne..."
                            />
                            <button
                                onClick={handleNotesSave}
                                className="mt-2 px-4 py-2 bg-[#1C2340] text-white font-sans font-semibold rounded-full hover:bg-[#2D375F] transition-colors"
                                style={{ fontSize: '13px' }}
                            >
                                Enregistrer les notes
                            </button>
                        </div>

                        <p className="font-sans text-[#9CA3AF] text-center" style={{ fontSize: '12px' }}>
                            Commande creee le {new Date(order.created_at).toLocaleString('fr-FR')}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('tous');
    const [wilayaFilter, setWilayaFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const loadOrders = async () => {
        try {
            const data = await fetchOrders({
                status: statusFilter,
                wilaya: wilayaFilter || null,
                searchQuery: searchQuery || null,
            });
            setOrders(data.orders);
        } catch (error) {
            console.error('Erreur lors du chargement des commandes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [statusFilter, wilayaFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadOrders();
    };

    const handleViewOrder = async (orderId) => {
        try {
            const order = await fetchOrderById(orderId);
            setSelectedOrder(order);
        } catch {
            alert('Erreur lors du chargement de la commande');
        }
    };

    const handleStatusChange = (orderId, newStatus) => {
        setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder?.id === orderId) {
            setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
    };

    const handleNotesChange = (orderId, newNotes) => {
        if (selectedOrder?.id === orderId) {
            setSelectedOrder((prev) => ({ ...prev, notes: newNotes }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-[#1C2340]" style={{ fontSize: '28px', fontWeight: 600 }}>
                    Commandes
                </h2>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#F9D7DA]">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                                size={18}
                                color="#9CA3AF"
                                strokeWidth={1.8}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher par numero, nom ou telephone..."
                                className="w-full border border-[#EBB4BB] rounded-full pl-10 pr-4 py-2 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                                style={{ fontSize: '14px' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 sm:py-2 bg-[#1C2340] text-white font-sans font-semibold rounded-full hover:bg-[#2D375F] transition-colors"
                            style={{ fontSize: '14px' }}
                        >
                            Rechercher
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 border border-[#EBB4BB] rounded-lg px-4 py-2 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                            style={{ fontSize: '14px' }}
                        >
                            <option value="tous">Tous les statuts</option>
                            <option value="en_attente">En attente</option>
                            <option value="confirme">Confirme</option>
                            <option value="en_preparation">En preparation</option>
                            <option value="expedie">Expedie</option>
                            <option value="livre">Livre</option>
                            <option value="annule">Annule</option>
                        </select>

                        <select
                            value={wilayaFilter}
                            onChange={(e) => setWilayaFilter(e.target.value)}
                            className="flex-1 border border-[#EBB4BB] rounded-lg px-4 py-2 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                            style={{ fontSize: '14px' }}
                        >
                            <option value="">Toutes les wilayas</option>
                            {WILAYAS.map((w) => (
                                <option key={w} value={w}>
                                    {w}
                                </option>
                            ))}
                        </select>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#F9D7DA]">
                {loading ? (
                    <p className="font-sans text-[#9CA3AF]">Chargement...</p>
                ) : orders.length === 0 ? (
                    <p className="font-sans text-[#9CA3AF]">Aucune commande trouvee</p>
                ) : (
                    <>
                    <div className="md:hidden space-y-3">
                        {orders.map((order) => (
                            <article key={order.id} className="border border-[#F9D7DA] rounded-xl p-4 bg-white">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '15px' }}>
                                            {order.order_number}
                                        </p>
                                        <p className="font-sans text-[#5A6080] truncate" style={{ fontSize: '13px' }}>
                                            {order.customer_name} - {order.customer_phone}
                                        </p>
                                    </div>
                                    <OrderStatusBadge status={order.status} />
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div>
                                        <p className="font-sans text-[#9CA3AF]" style={{ fontSize: '12px' }}>Total</p>
                                        <p className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '14px' }}>
                                            {parseFloat(order.total).toLocaleString('fr-DZ')} DZD
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-sans text-[#9CA3AF]" style={{ fontSize: '12px' }}>Wilaya</p>
                                        <p className="font-sans text-[#5A6080]" style={{ fontSize: '14px' }}>{order.wilaya}</p>
                                    </div>
                                    <div>
                                        <p className="font-sans text-[#9CA3AF]" style={{ fontSize: '12px' }}>Paiement</p>
                                        <p className="font-sans text-[#5A6080]" style={{ fontSize: '14px' }}>{order.payment_method}</p>
                                    </div>
                                    <div>
                                        <p className="font-sans text-[#9CA3AF]" style={{ fontSize: '12px' }}>Date</p>
                                        <p className="font-sans text-[#5A6080]" style={{ fontSize: '14px' }}>
                                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleViewOrder(order.id)}
                                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-[#EBB4BB] font-sans text-[#1C2340] hover:bg-[#FDE8EC] transition-colors"
                                    style={{ fontSize: '14px' }}
                                >
                                    <Eye className="flex-none" size={16} strokeWidth={1.8} aria-hidden="true" />
                                    Voir la commande
                                </button>
                            </article>
                        ))}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#F9D7DA]">
                                    <th className="text-left font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Numero
                                    </th>
                                    <th className="text-left font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Client
                                    </th>
                                    <th className="text-left font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Telephone
                                    </th>
                                    <th className="text-left font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Wilaya
                                    </th>
                                    <th className="text-right font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Total
                                    </th>
                                    <th className="text-left font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Paiement
                                    </th>
                                    <th className="text-left font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Statut
                                    </th>
                                    <th className="text-left font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Date
                                    </th>
                                    <th className="text-center font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b border-[#F9D7DA] last:border-0 hover:bg-[#FDE8EC] transition-colors">
                                        <td className="font-sans text-[#1C2340] py-3 px-2" style={{ fontSize: '14px' }}>
                                            {order.order_number}
                                        </td>
                                        <td className="font-sans text-[#1C2340] py-3 px-2" style={{ fontSize: '14px' }}>
                                            {order.customer_name}
                                        </td>
                                        <td className="font-sans text-[#5A6080] py-3 px-2" style={{ fontSize: '14px' }}>
                                            {order.customer_phone}
                                        </td>
                                        <td className="font-sans text-[#5A6080] py-3 px-2" style={{ fontSize: '14px' }}>
                                            {order.wilaya}
                                        </td>
                                        <td className="font-sans font-semibold text-right text-[#1C2340] py-3 px-2" style={{ fontSize: '14px' }}>
                                            {parseFloat(order.total).toLocaleString('fr-DZ')} DZD
                                        </td>
                                        <td className="font-sans text-[#5A6080] py-3 px-2" style={{ fontSize: '13px' }}>
                                            {order.payment_method}
                                        </td>
                                        <td className="py-3 px-2">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className="font-sans text-[#5A6080] py-3 px-2" style={{ fontSize: '14px' }}>
                                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="text-center py-3 px-2">
                                            <button
                                                onClick={() => handleViewOrder(order.id)}
                                                className="inline-flex min-w-[78px] h-8 items-center justify-center gap-1.5 px-3 rounded-full border border-[#EBB4BB] font-sans text-[#1C2340] hover:bg-[#FDE8EC] transition-colors"
                                                style={{ fontSize: '13px' }}
                                            >
                                                <Eye className="flex-none" size={14} strokeWidth={1.8} aria-hidden="true" />
                                                Voir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={handleStatusChange}
                    onNotesChange={handleNotesChange}
                />
            )}
        </div>
    );
}
