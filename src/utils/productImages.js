import { getProductVariantImages } from './productVariants';

export const PRODUCT_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23FDE8EC'/%3E%3Crect x='126' y='126' width='348' height='348' rx='36' fill='none' stroke='%23EBB4BB' stroke-width='18'/%3E%3Cpath d='M158 399h284l-79-105-62 74-45-54-98 85Z' fill='%23EBB4BB'/%3E%3Ccircle cx='398' cy='190' r='37' fill='%23F9D7DA'/%3E%3C/svg%3E";

export function getProductImages(product) {
  const variantImages = getProductVariantImages(product);
  const images = Array.isArray(product?.images)
    ? product.images.filter((image) => typeof image === 'string' && image.trim())
    : [];
  const allImages = [...variantImages, ...images].filter((image, index, list) => list.indexOf(image) === index);

  return allImages.length > 0 ? allImages : [PRODUCT_IMAGE_PLACEHOLDER];
}

export function getProductImage(product, index = 0) {
  return getProductImages(product)[index] ?? PRODUCT_IMAGE_PLACEHOLDER;
}
