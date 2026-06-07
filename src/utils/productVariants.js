export const DEFAULT_COLOR_HEX = '#D1D5DB';

export const COLOR_PALETTE = [
  { name: 'Noir', value: 'noir', hex: '#1C1C1C' },
  { name: 'Blanc', value: 'blanc', hex: '#F8F8F8' },
  { name: 'Ivoire', value: 'ivoire', hex: '#FFF8E7' },
  { name: 'Nude', value: 'nude', hex: '#D4A99A' },
  { name: 'Beige', value: 'beige', hex: '#D8C3A5' },
  { name: 'Taupe', value: 'taupe', hex: '#8B7B72' },
  { name: 'Marron', value: 'marron', hex: '#6B3F2A' },
  { name: 'Rose', value: 'rose', hex: '#F4A7B9' },
  { name: 'Rose pale', value: 'rose-pale', hex: '#FADADD' },
  { name: 'Fuchsia', value: 'fuchsia', hex: '#D946A6' },
  { name: 'Rouge', value: 'rouge', hex: '#E63946' },
  { name: 'Bordeaux', value: 'bordeaux', hex: '#7F1D1D' },
  { name: 'Corail', value: 'corail', hex: '#FF7F6E' },
  { name: 'Orange', value: 'orange', hex: '#F97316' },
  { name: 'Jaune', value: 'jaune', hex: '#FACC15' },
  { name: 'Vert sauge', value: 'vert-sauge', hex: '#9CAF88' },
  { name: 'Vert', value: 'vert', hex: '#16A34A' },
  { name: 'Bleu ciel', value: 'bleu-ciel', hex: '#93C5FD' },
  { name: 'Bleu marine', value: 'bleu-marine', hex: '#1E3A8A' },
  { name: 'Lilas', value: 'lilas', hex: '#C0A0D0' },
  { name: 'Violet', value: 'violet', hex: '#7C3AED' },
  { name: 'Gris', value: 'gris', hex: '#9CA3AF' },
  { name: 'Argent', value: 'argent', hex: '#D1D5DB' },
  { name: 'Dore', value: 'dore', hex: '#D4AF37' },
];

const COLOR_LOOKUP = new Map(COLOR_PALETTE.map((color) => [color.value, color]));

export function getColorMeta(value) {
  return COLOR_LOOKUP.get(value) || {
    name: value,
    value,
    hex: DEFAULT_COLOR_HEX,
  };
}

export function normalizeProductVariants(product) {
  const variants = Array.isArray(product?.variant_options) ? product.variant_options : [];

  if (variants.length > 0) {
    return variants
      .filter((variant) => variant?.color)
      .map((variant) => {
        const meta = getColorMeta(variant.color);
        return {
          color: variant.color,
          colorName: variant.colorName || meta.name,
          colorHex: variant.colorHex || meta.hex,
          image: variant.image || '',
          stockBySize: variant.stockBySize && typeof variant.stockBySize === 'object'
            ? variant.stockBySize
            : {},
        };
      });
  }

  const colors = Array.isArray(product?.colors) ? product.colors : [];
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const fallbackStock = Number.parseInt(product?.stock, 10);

  return colors.map((color) => {
    const meta = getColorMeta(color);
    return {
      color,
      colorName: meta.name,
      colorHex: meta.hex,
      image: '',
      stockBySize: Object.fromEntries(sizes.map((size) => [size, Number.isFinite(fallbackStock) ? fallbackStock : 0])),
    };
  });
}

export function getProductVariantImages(product) {
  return normalizeProductVariants(product)
    .map((variant) => variant.image)
    .filter((image) => typeof image === 'string' && image.trim());
}

export function getProductColorOptions(product) {
  const variants = normalizeProductVariants(product);
  if (variants.length > 0) return variants;

  return (Array.isArray(product?.colors) ? product.colors : []).map((color) => {
    const meta = getColorMeta(color);
    return {
      color,
      colorName: meta.name,
      colorHex: meta.hex,
      image: '',
      stockBySize: {},
    };
  });
}

export function getAvailableSizesForColor(product, color) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const variant = normalizeProductVariants(product).find((item) => item.color === color);
  if (!variant) return sizes;

  return sizes.filter((size) => Number.parseInt(variant.stockBySize?.[size], 10) > 0);
}

export function getVariantStock(product, color, size) {
  const variant = normalizeProductVariants(product).find((item) => item.color === color);
  if (!variant || !size) return Number.parseInt(product?.stock, 10) || 0;

  return Number.parseInt(variant.stockBySize?.[size], 10) || 0;
}

export function getTotalVariantStock(variants = []) {
  return variants.reduce((total, variant) => {
    const stockBySize = variant?.stockBySize && typeof variant.stockBySize === 'object' ? variant.stockBySize : {};
    return total + Object.values(stockBySize).reduce((sum, value) => sum + (Number.parseInt(value, 10) || 0), 0);
  }, 0);
}
