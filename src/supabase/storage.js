import { supabase } from './client';

const BUCKET_NAME = 'product-images';
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function uploadProductImage(file) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        throw new Error('Format image non supporte. Utilisez JPG, PNG ou WebP.');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        throw new Error('Image trop lourde. Taille maximale: 5MB.');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || file.type.split('/')[1];
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: '3600',
            contentType: file.type,
            upsert: false,
        });

    if (error) throw error;

    const {
        data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return publicUrl;
}

export async function deleteProductImage(imageUrl) {
    const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) return;

    const filePath = decodeURIComponent(urlParts[1].split('?')[0]);

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) throw error;
}

export async function deleteProductImages(imageUrls = []) {
    const filePaths = imageUrls
        .filter((imageUrl) => typeof imageUrl === 'string' && imageUrl.includes(`${BUCKET_NAME}/`))
        .map((imageUrl) => decodeURIComponent(imageUrl.split(`${BUCKET_NAME}/`)[1].split('?')[0]))
        .filter(Boolean);

    if (filePaths.length === 0) return;

    const { error } = await supabase.storage.from(BUCKET_NAME).remove(filePaths);

    if (error) throw error;
}

export async function uploadMultipleImages(files) {
    const uploadPromises = files.map((file) => uploadProductImage(file));
    return await Promise.all(uploadPromises);
}
