
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1920; // Increase max dimension for higher quality

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const processVideoFrame = async (
  videoElement: HTMLVideoElement,
  background: { id: string; url?: string; type?: string } | null
): Promise<ImageData | null> => {
  if (!background) return null;

  try {
    // Create canvas and draw current video frame with proper dimensions
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) return null;
    
    // Draw current video frame
    ctx.drawImage(videoElement, 0, 0);
    
    if (background.type === 'blur') {
      // Apply blur effect
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d', { alpha: false });
      
      if (!tempCtx) return null;
      
      // Draw and blur background
      tempCtx.filter = 'blur(10px)';
      tempCtx.drawImage(videoElement, 0, 0);
      
      // Get processed frame data
      return tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    } else if (background.url) {
      // Load background image
      const bgImage = new Image();
      bgImage.crossOrigin = 'anonymous';
      
      // Add dimensions and quality parameters for Unsplash images
      if (background.url.includes('unsplash.com') && !background.url.includes('&w=')) {
        const separator = background.url.includes('?') ? '&' : '?';
        bgImage.src = `${background.url}${separator}w=${MAX_IMAGE_DIMENSION}&q=90&fit=crop`;
      } else {
        bgImage.src = background.url;
      }
      
      await new Promise((resolve) => {
        bgImage.onload = resolve;
      });
      
      // Draw background image fitted to canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d', { alpha: false });
      
      if (!tempCtx) return null;
      
      // Draw background image maintaining aspect ratio
      const scale = Math.max(
        canvas.width / bgImage.width,
        canvas.height / bgImage.height
      );
      const x = (canvas.width - bgImage.width * scale) / 2;
      const y = (canvas.height - bgImage.height * scale) / 2;
      
      // Use high quality image rendering
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      
      tempCtx.drawImage(
        bgImage,
        x, y,
        bgImage.width * scale,
        bgImage.height * scale
      );
      
      // Get processed frame data
      return tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    return null;
  } catch (error) {
    console.error('Error processing video frame:', error);
    return null;
  }
};
