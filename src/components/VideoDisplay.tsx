
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { processVideoFrame } from '@/utils/backgroundUtils';

interface VideoDisplayProps {
  stream: MediaStream | null;
  isVideoOn: boolean;
  isScreenShare: boolean;
  isAudioOn: boolean;
  videoStyle?: React.CSSProperties;
  className?: string;
  background?: { id: string; url?: string; type?: string } | null;
  onVideoError?: (error: Error) => void;
}

const VideoDisplay = ({ 
  stream, 
  isVideoOn, 
  isScreenShare,
  isAudioOn,
  videoStyle,
  className,
  background,
  onVideoError
}: VideoDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessingBackground, setIsProcessingBackground] = useState(false);
  const [videoStats, setVideoStats] = useState<{
    droppedFrames: number;
    fps: number;
    resolution: string;
    timestamp: number;
  }>({ droppedFrames: 0, fps: 0, resolution: '', timestamp: 0 });
  const animationFrameRef = useRef<number>();
  const statsIntervalRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const [adaptiveQuality, setAdaptiveQuality] = useState<'auto' | 'low' | 'medium' | 'high'>('auto');
  
  // Handle video errors
  const handleVideoError = useCallback((event: Event) => {
    console.error('Video error:', event);
    if (onVideoError && event instanceof ErrorEvent) {
      onVideoError(new Error(`Video playback error: ${event.message}`));
    }
  }, [onVideoError]);

  // Monitor connection and stream health
  const monitorStreamHealth = useCallback(() => {
    if (!videoRef.current || !stream) return;
    
    const now = performance.now();
    frameCountRef.current++;
    
    // Calculate FPS every second
    if (now - lastFrameTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastFrameTimeRef.current));
      const resolution = videoRef.current.videoWidth 
        ? `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`
        : '';
      
      setVideoStats(prev => ({
        ...prev,
        fps,
        resolution,
        timestamp: now
      }));
      
      // Adaptively adjust quality based on performance
      if (fps < 15 && adaptiveQuality !== 'low') {
        console.log('Low FPS detected, reducing quality');
        setAdaptiveQuality('low');
        adjustStreamQuality('low');
      } else if (fps >= 15 && fps < 24 && adaptiveQuality !== 'medium') {
        console.log('Medium performance detected, adjusting quality');
        setAdaptiveQuality('medium');
        adjustStreamQuality('medium');
      } else if (fps >= 24 && adaptiveQuality !== 'high' && adaptiveQuality !== 'auto') {
        console.log('Good performance detected, increasing quality');
        setAdaptiveQuality('auto');
        adjustStreamQuality('auto');
      }
      
      lastFrameTimeRef.current = now;
      frameCountRef.current = 0;
    }
  }, [stream, adaptiveQuality]);

  // Adjust stream quality dynamically
  const adjustStreamQuality = useCallback((quality: 'auto' | 'low' | 'medium' | 'high') => {
    if (!stream) return;
    
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) return;
    
    const videoTrack = videoTracks[0];
    
    let constraints: MediaTrackConstraints = {};
    
    switch (quality) {
      case 'low':
        constraints = {
          width: { ideal: 640 },
          height: { ideal: 360 },
          frameRate: { ideal: 15 }
        };
        break;
      case 'medium':
        constraints = {
          width: { ideal: 854 },
          height: { ideal: 480 },
          frameRate: { ideal: 24 }
        };
        break;
      case 'high':
        constraints = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        };
        break;
      case 'auto':
      default:
        // Let the browser decide optimal settings
        break;
    }
    
    try {
      videoTrack.applyConstraints(constraints)
        .catch(error => console.warn('Could not apply video constraints:', error));
    } catch (e) {
      console.warn('Error applying constraints:', e);
    }
  }, [stream]);

  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Setting video stream:', stream.id);
      videoRef.current.srcObject = stream;
      
      // Add error event listener
      videoRef.current.addEventListener('error', handleVideoError);
      
      // Only apply constraints if the video is actually on
      if (isVideoOn || isScreenShare) {
        const videoTracks = stream.getVideoTracks();
        
        if (videoTracks.length > 0) {
          try {
            // Initial quality setting
            adjustStreamQuality(adaptiveQuality);
          } catch (e) {
            console.warn('Error applying initial constraints:', e);
          }
        }
      }
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('error', handleVideoError);
      }
    };
  }, [stream, isVideoOn, isScreenShare, handleVideoError, adjustStreamQuality, adaptiveQuality]);

  useEffect(() => {
    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !isVideoOn || isScreenShare) return;

      // Monitor stream health with each frame
      monitorStreamHealth();

      const ctx = canvasRef.current.getContext('2d', { alpha: false });
      if (!ctx) return;

      // Set canvas dimensions to match video for proper resolution
      if (videoRef.current.videoWidth > 0 && canvasRef.current.width !== videoRef.current.videoWidth) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      }

      // Process frame with background if needed
      if (background) {
        try {
          const processedFrame = await processVideoFrame(videoRef.current, background);
          if (processedFrame) {
            ctx.putImageData(processedFrame, 0, 0);
          }
        } catch (error) {
          console.error('Error processing video frame:', error);
          // Fallback to direct rendering if processing fails
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      } else {
        // If no background processing needed, just draw the video frame
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    // Start processing frames if video is on and we have a stream
    if (isVideoOn && stream && !isScreenShare) {
      setIsProcessingBackground(true);
      processFrame();
    } else {
      setIsProcessingBackground(false);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stream, isVideoOn, isScreenShare, background, monitorStreamHealth]);

  // Clean up intervals and animation frames
  useEffect(() => {
    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle playback errors with automatic recovery attempts
  const handleVideoPlaybackError = useCallback(async () => {
    if (!videoRef.current || !stream) return;
    
    try {
      console.log('Attempting to recover video playback');
      await videoRef.current.play();
    } catch (error) {
      console.error('Failed to recover video playback:', error);
      if (onVideoError) {
        onVideoError(new Error('Video playback failed. Please try refreshing.'));
      }
    }
  }, [stream, onVideoError]);

  // Ensure video plays when it's ready
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const playVideo = async () => {
      try {
        if (videoElement.paused) {
          await videoElement.play();
        }
      } catch (error) {
        console.warn('Autoplay prevented:', error);
        // We'll handle this in the UI elsewhere
      }
    };
    
    const handleCanPlay = () => {
      playVideo();
    };
    
    videoElement.addEventListener('canplay', handleCanPlay);
    
    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  if (!stream) {
    return null;
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={!isAudioOn}
        className={cn(
          isProcessingBackground ? 'hidden' : '',
          isScreenShare ? "object-contain" : "object-cover",
          "w-full h-full",
          className
        )}
        style={{
          imageRendering: 'auto',
          ...videoStyle
        }}
        onError={handleVideoPlaybackError}
      />
      {isProcessingBackground && (
        <canvas
          ref={canvasRef}
          width={videoRef.current?.videoWidth || 1280}
          height={videoRef.current?.videoHeight || 720}
          className={cn(
            "w-full h-full object-cover",
            className
          )}
          style={{
            imageRendering: 'auto',
            ...videoStyle
          }}
        />
      )}
    </>
  );
};

export default VideoDisplay;
