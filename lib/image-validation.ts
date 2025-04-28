export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export interface ImageValidationError {
  message: string;
  code: 'SIZE_ERROR' | 'TYPE_ERROR';
}

export function validateImage(file: File): ImageValidationError | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      message: `Invalid file type. Allowed types are: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      code: 'TYPE_ERROR',
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      message: `File size too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      code: 'SIZE_ERROR',
    };
  }

  return null;
}
