
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

const ResponsiveImage = ({
  src,
  alt,
  className,
  sizes = '100vw',
  priority = false,
  width,
  height
}: ResponsiveImageProps) => {
  // Extract the base URL without extension to create srcset with different resolutions
  const isExternalUrl = src.startsWith('http');
  
  // For local images
  let srcSet = '';
  if (!isExternalUrl && src.includes('/lovable-uploads/')) {
    // We'll continue using the original image as we can't generate different sizes for user uploads
    srcSet = `${src}`;
  } else if (isExternalUrl) {
    // For Unsplash images, we can use their API to get different sizes
    // Example: https://images.unsplash.com/photo-xxx?w=500&q=80 2x
    if (src.includes('unsplash.com')) {
      srcSet = `
        ${src}&w=640&q=80 640w,
        ${src}&w=1080&q=80 1080w,
        ${src}&w=1920&q=80 1920w,
        ${src}&w=2560&q=80 2560w
      `;
    }
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('object-contain', className)}
      sizes={sizes}
      srcSet={srcSet || undefined}
      loading={priority ? 'eager' : 'lazy'}
      width={width}
      height={height}
    />
  );
};

export default ResponsiveImage;
