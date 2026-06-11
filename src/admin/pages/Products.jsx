import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { fetchProducts, toggleProductActive, deleteProduct, subscribeToProducts } from '../../supabase/products';
import { getProductImage } from '../../utils/productImages';
import { normalizeProductVariants } from '../../utils/productVariants';
import ProductForm from './ProductForm';
import ConfirmDialog from '../components/ConfirmDialog';

function getColorStockRows(product) {
    const variants = normalizeProductVariants(product);

    if (variants.length === 0) {
        return [];
    }

    return variants.map((variant) => {
        const stockBySize = variant.stockBySize && typeof variant.stockBySize === 'object' ? variant.stockBySize : {};
        const total = Object.values(stockBySize).reduce(
            (sum, value) => sum + (Number.parseInt(value, 10) || 0),
            0
        );
        const sizes = Object.entries(stockBySize)
            .map(([size, value]) => ({
                size,
                quantity: Number.parseInt(value, 10) || 0,
            }));

        return {
            color: variant.color,
            name: variant.colorName,
            hex: variant.colorHex,
            total,
            sizes,
        };
    });
}

function ColorStockSummary({ product, align = 'left' }) {
    const rows = getColorStockRows(product);
    const total = rows.length > 0
        ? rows.reduce((sum, row) => sum + row.total, 0)
        : Number.parseInt(product.stock, 10) || 0;

    return (
        <div className={`flex flex-col gap-1 ${align === 'center' ? 'items-center' : 'items-start'}`}>
            <span className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '13px' }}>
                Total: {total}
            </span>
            {rows.length > 0 ? (
                <div className={`flex flex-col gap-2 ${align === 'center' ? 'items-center' : 'items-start'}`}>
                    {rows.map((row) => (
                        <div
                            key={row.color}
                            className={`rounded-lg border border-[#F9D7DA] bg-white px-2.5 py-2 ${align === 'center' ? 'w-fit' : 'w-full'}`}
                        >
                            <div className="flex items-center gap-1.5 font-sans text-[#5A6080]" style={{ fontSize: '12px' }}>
                                <span
                                    className="rounded-full border"
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        background: row.hex,
                                        borderColor: row.color === 'blanc' || row.color === 'ivoire' ? '#D1D5DB' : row.hex,
                                    }}
                                />
                                <span>{row.name}</span>
                                <strong className="text-[#1C2340]">{row.total}</strong>
                            </div>
                            <div className={`mt-1 flex flex-wrap gap-1 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
                                {row.sizes.map(({ size, quantity }) => (
                                    <span
                                        key={`${row.color}-${size}`}
                                        className={`rounded-full px-1.5 py-0.5 font-sans ${quantity > 0 ? 'bg-[#FDE8EC] text-[#1C2340]' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}
                                        style={{ fontSize: '11px' }}
                                    >
                                        {size}: {quantity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="font-sans text-[#9CA3AF]" style={{ fontSize: '12px' }}>
                    Aucune couleur configuree
                </span>
            )}
        </div>
    );
}

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('tous');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const loadProducts = async () => {
        try {
            const onlyActive = activeFilter === 'actif' ? true : activeFilter === 'inactif' ? false : null;
            const data = await fetchProducts({
                category: categoryFilter || null,
                onlyActive,
                limit: 1000,
            });

            let filtered = data.products;
            if (searchQuery) {
                filtered = filtered.filter((p) =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            setProducts(filtered);
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [categoryFilter, activeFilter]);

    useEffect(() => {
        const unsubscribe = subscribeToProducts(() => {
            loadProducts();
        });

        return unsubscribe;
    }, [categoryFilter, activeFilter, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadProducts();
    };

    const handleToggleActive = async (productId, currentState) => {
        try {
            await toggleProductActive(productId, !currentState);
            setProducts((prev) =>
                prev.map((p) => (p.id === productId ? { ...p, is_active: !currentState } : p))
            );
        } catch {
            alert('Erreur lors de la mise a jour');
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await deleteProduct(deleteConfirm.id);
            setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch {
            alert('Erreur lors de la suppression');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingProduct(null);
        loadProducts();
    };

    const ProductActions = ({ product }) => (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => handleEdit(product)}
                className="p-2 rounded-full hover:bg-[#DBEAFE] transition-colors"
                aria-label="Modifier"
            >
                <Edit size={16} color="#3B82F6" strokeWidth={1.8} />
            </button>
            <button
                onClick={() => setDeleteConfirm(product)}
                className="p-2 rounded-full hover:bg-[#FEE2E2] transition-colors"
                aria-label="Supprimer"
            >
                <Trash2 size={16} color="#E63946" strokeWidth={1.8} />
            </button>
        </div>
    );

    const ProductActiveToggle = ({ product }) => (
        <button
            onClick={() => handleToggleActive(product.id, product.is_active)}
            className={`w-12 h-6 rounded-full transition-colors ${product.is_active ? 'bg-[#10B981]' : 'bg-[#9CA3AF]'
                }`}
            aria-label={product.is_active ? 'Desactiver le produit' : 'Activer le produit'}
            aria-pressed={product.is_active}
        >
            <span
                className={`block w-5 h-5 bg-white rounded-full transition-transform ${product.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-[#1C2340]" style={{ fontSize: '28px', fontWeight: 600 }}>
                    Produits
                </h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 bg-[#1C2340] text-white font-sans font-semibold rounded-full hover:bg-[#2D375F] transition-colors"
                    style={{ fontSize: '14px' }}
                >
                    <Plus size={18} strokeWidth={1.8} />
                    Ajouter un produit
                </button>
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
                                placeholder="Rechercher un produit..."
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
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="flex-1 border border-[#EBB4BB] rounded-lg px-4 py-2 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                            style={{ fontSize: '14px' }}
                        >
                            <option value="">Toutes les categories</option>
                            <option value="Soutien-gorge">Soutien-gorge</option>
                            <option value="Ensembles">Ensembles</option>
                            <option value="Culottes">Culottes</option>
                            <option value="Pyjamas">Pyjamas</option>
                            <option value="Nuisettes">Nuisettes</option>
                            <option value="Corsets">Corsets</option>
                        </select>

                        <select
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                            className="flex-1 border border-[#EBB4BB] rounded-lg px-4 py-2 font-sans text-[#1C2340] outline-none focus:border-[#1C2340]"
                            style={{ fontSize: '14px' }}
                        >
                            <option value="tous">Tous les produits</option>
                            <option value="actif">Actifs seulement</option>
                            <option value="inactif">Inactifs seulement</option>
                        </select>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#F9D7DA]">
                {loading ? (
                    <p className="font-sans text-[#9CA3AF]">Chargement...</p>
                ) : products.length === 0 ? (
                    <p className="font-sans text-[#9CA3AF]">Aucun produit trouve</p>
                ) : (
                    <>
                    <div className="md:hidden space-y-3">
                        {products.map((product) => (
                            <article key={product.id} className="border border-[#F9D7DA] rounded-xl p-3 bg-white">
                                <div className="flex gap-3">
                                    <img
                                        src={getProductImage(product)}
                                        alt={product.name}
                                        className="w-20 h-20 object-cover rounded-lg flex-none"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="font-sans font-semibold text-[#1C2340] truncate" style={{ fontSize: '15px' }}>
                                                    {product.name}
                                                </h3>
                                                <p className="font-sans text-[#5A6080]" style={{ fontSize: '13px' }}>
                                                    {product.category}
                                                </p>
                                            </div>
                                            <ProductActions product={product} />
                                        </div>
                                        <div className="flex items-center justify-between gap-3 mt-3">
                                            <div>
                                                <p className="font-sans font-semibold text-[#1C2340]" style={{ fontSize: '14px' }}>
                                                    {parseFloat(product.price).toLocaleString('fr-DZ')} DZD
                                                </p>
                                                <div className="mt-2">
                                                    <ColorStockSummary product={product} />
                                                </div>
                                            </div>
                                            <ProductActiveToggle product={product} />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#F9D7DA]">
                                    <th className="text-left font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Image
                                    </th>
                                    <th className="text-left font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Nom
                                    </th>
                                    <th className="text-left font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Categorie
                                    </th>
                                    <th className="text-right font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Prix
                                    </th>
                                    <th className="text-center font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Stock par couleur
                                    </th>
                                    <th className="text-center font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Badge
                                    </th>
                                    <th className="text-center font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Actif
                                    </th>
                                    <th className="text-center font-sans font-semibold text-[#1C2340] py-3 px-2" style={{ fontSize: '13px' }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b border-[#F9D7DA] last:border-0 hover:bg-[#FDE8EC] transition-colors">
                                        <td className="py-3 px-2">
                                            <img
                                                src={getProductImage(product)}
                                                alt={product.name}
                                                className="w-12 h-12 object-cover rounded-lg"
                                            />
                                        </td>
                                        <td className="font-sans text-[#1C2340] py-3 px-2" style={{ fontSize: '14px' }}>
                                            {product.name}
                                        </td>
                                        <td className="font-sans text-[#5A6080] py-3 px-2" style={{ fontSize: '14px' }}>
                                            {product.category}
                                        </td>
                                        <td className="font-sans font-semibold text-right text-[#1C2340] py-3 px-2" style={{ fontSize: '14px' }}>
                                            {parseFloat(product.price).toLocaleString('fr-DZ')} DZD
                                        </td>
                                        <td className="py-3 px-2">
                                            <ColorStockSummary product={product} align="center" />
                                        </td>
                                        <td className="text-center py-3 px-2">
                                            {product.badge && (
                                                <span
                                                    className="inline-block px-2 py-1 rounded-full font-sans font-semibold"
                                                    style={{
                                                        fontSize: '11px',
                                                        background: product.badge === 'promo' ? '#FEE2E2' : '#DBEAFE',
                                                        color: product.badge === 'promo' ? '#E63946' : '#3B82F6',
                                                    }}
                                                >
                                                    {product.badge === 'promo' ? 'Promo' : 'Nouveau'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-center py-3 px-2">
                                            <ProductActiveToggle product={product} />
                                        </td>
                                        <td className="text-center py-3 px-2">
                                            <ProductActions product={product} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
            </div>

            {showForm && (
                <ProductForm product={editingProduct} onClose={handleFormClose} />
            )}

            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Supprimer definitivement"
                message={`Etes-vous sur de vouloir supprimer definitivement "${deleteConfirm?.name}" ? Cette action retire le produit de la base de donnees.`}
                confirmText="Supprimer"
            />
        </div>
    );
}
