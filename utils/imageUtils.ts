
import type { ImageData } from '../types';

export const fileToBase64 = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            return reject(new Error('File is not an image.'));
        }
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // result is "data:image/jpeg;base64,...."
            // we need to split it
            const parts = result.split(';base64,');
            const mimeType = parts[0].split(':')[1];
            const data = parts[1];
            resolve({ mimeType, data });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export const imageUrlToBase64 = async (url: string): Promise<ImageData> => {
    try {
      // Using a CORS proxy for development or if direct fetching is blocked.
      // For a real-world application, you would host your own proxy.
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image. Status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL does not point to a valid image file.');
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const parts = result.split(';base64,');
          const data = parts[1];
          resolve({ mimeType: blob.type, data });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error fetching image from URL:", error);
      throw new Error("Could not load image from URL. This may be due to a network error or browser security policies (CORS).");
    }
  };
