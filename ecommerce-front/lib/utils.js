import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs) {
  return twMerge(clsx(inputs))
};

export function getImageAspectRatio(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      const aspectRatio = this.naturalWidth / this.naturalHeight;
      resolve(aspectRatio);
    };
    img.onerror = function() {
      reject(new Error('Failed to load image'));
    };
    img.src = src;
  });
};