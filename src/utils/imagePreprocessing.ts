/**
 * User portrait image validation and client-side preprocessing for Mirror VTON
 */

export interface PreprocessResult {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MIN_FILE_SIZE_BYTES = 5 * 1024; // 5KB
const MIN_DIMENSION_PX = 200;
const MAX_DIMENSION_PX = 1600;

export async function preprocessUserImage(rawFile: File | Blob): Promise<PreprocessResult> {
  // 1. Basic size validation
  if (rawFile.size < MIN_FILE_SIZE_BYTES) {
    throw new Error('The selected image is too small or incomplete. Please upload a clear photo of yourself.');
  }

  if (rawFile.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image size exceeds 10MB limit. Please choose a smaller photo.');
  }

  // 2. MIME type validation (for Files with type property)
  if (rawFile.type && !ALLOWED_MIME_TYPES.includes(rawFile.type.toLowerCase())) {
    throw new Error('Unsupported image format. Please upload a JPEG, PNG, or WebP photo.');
  }

  // 3. Load image to verify corruption and extract natural dimensions
  const objectUrl = URL.createObjectURL(rawFile);

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read image file. The image may be corrupted or in an unsupported format.'));
    };
    image.src = objectUrl;
  });

  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;

  if (naturalWidth < MIN_DIMENSION_PX || naturalHeight < MIN_DIMENSION_PX) {
    URL.revokeObjectURL(objectUrl);
    throw new Error(`Photo resolution is too low (${naturalWidth}x${naturalHeight}px). Upload a clear, full-body or upper-body photo with good lighting (at least ${MIN_DIMENSION_PX}x${MIN_DIMENSION_PX}px).`);
  }

  // 4. Calculate target dimensions if larger than MAX_DIMENSION_PX
  let targetWidth = naturalWidth;
  let targetHeight = naturalHeight;

  if (naturalWidth > MAX_DIMENSION_PX || naturalHeight > MAX_DIMENSION_PX) {
    if (naturalWidth >= naturalHeight) {
      targetWidth = MAX_DIMENSION_PX;
      targetHeight = Math.round((naturalHeight * MAX_DIMENSION_PX) / naturalWidth);
    } else {
      targetHeight = MAX_DIMENSION_PX;
      targetWidth = Math.round((naturalWidth * MAX_DIMENSION_PX) / naturalHeight);
    }
  }

  // 5. Draw on Canvas to normalize format to JPEG, strip rotation glitches, and compress gently
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    // Canvas unsupported fallback: return original rawFile
    const fallbackFile = rawFile instanceof File ? rawFile : new File([rawFile], 'user-photo.jpg', { type: 'image/jpeg' });
    return {
      file: fallbackFile,
      previewUrl: objectUrl,
      width: naturalWidth,
      height: naturalHeight,
    };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Clean up initial object URL
  URL.revokeObjectURL(objectUrl);

  const processedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to process image canvas.'));
      },
      'image/jpeg',
      0.92
    );
  });

  const finalFile = new File([processedBlob], 'mirror-portrait.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });

  const previewUrl = URL.createObjectURL(finalFile);

  return {
    file: finalFile,
    previewUrl,
    width: targetWidth,
    height: targetHeight,
  };
}
