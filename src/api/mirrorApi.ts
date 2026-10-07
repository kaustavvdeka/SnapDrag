import api from './client.js';

export interface TryOnRequest {
  productId: string;
  userImage: File | Blob;
}

export interface TryOnResponse {
  success: boolean;
  result: {
    imageUrl: string;
  };
  message?: string;
}

/**
 * Call Mirror AI Virtual Try-On endpoint
 * POST /api/mirror/try-on
 */
export const tryOnProduct = async ({ productId, userImage }: TryOnRequest): Promise<TryOnResponse> => {
  const formData = new FormData();
  formData.append('productId', productId);
  formData.append('userImage', userImage, 'user-photo.jpg');

  const response = await api.post('/mirror/try-on', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response as unknown as TryOnResponse;
};

export default {
  tryOnProduct,
};
