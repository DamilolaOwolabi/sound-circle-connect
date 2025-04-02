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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
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
  
  const handleVideoError = useCallback((event: Event) => {
    console.error('Video error:', event);
    if (onVideoError && event instanceof ErrorEvent) {
      onVideoError(new Error(`Video playback error: ${event.message}`));
    }
  }, [onVideoError]);

  const monitorStreamHealth = useCallback(() => {
    if (!videoRef.current || !stream) return;
    
    const now = performance.now();
    frameCountRef.current++;
    
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
    if (!isVideoOn && animationFrameRef.current) {
      console.log('Video turned off, stopping frame processing');
      cancelAnimationFrame(animationFrameRef.current);
      setIsProcessingBackground(false);
    }
  }, [isVideoOn]);

  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Setting video stream:', stream.id, 'Video tracks:', stream.getVideoTracks().length);
      
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        console.log('Video track enabled:', videoTracks[0].enabled, 'readyState:', videoTracks[0].readyState);
      }
      
      videoRef.current.srcObject = stream;
      
      videoRef.current.addEventListener('error', handleVideoError);
      
      const handlePlaying = () => {
        console.log('Video started playing:', stream.id);
        setIsVideoPlaying(true);
      };
      
      videoRef.current.addEventListener('playing', handlePlaying);
      
      const handleTrackEnded = () => {
        console.log('Video track ended, updating UI');
        setIsVideoPlaying(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          setIsProcessingBackground(false);
        }
      };
      
      videoTracks.forEach(track => {
        track.addEventListener('ended', handleTrackEnded);
      });
      
      if (isVideoOn || isScreenShare) {
        const videoTracks = stream.getVideoTracks();
        
        if (videoTracks.length > 0) {
          try {
            adjustStreamQuality(adaptiveQuality);
          } catch (e) {
            console.warn('Error applying initial constraints:', e);
          }
        }
      }
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('error', handleVideoError);
          videoRef.current.removeEventListener('playing', handlePlaying);
        }
        videoTracks.forEach(track => {
          track.removeEventListener('ended', handleTrackEnded);
        });
      };
    }
  }, [stream, isVideoOn, isScreenShare, handleVideoError, adjustStreamQuality, adaptiveQuality]);

  useEffect(() => {
    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !isVideoOn || isScreenShare) return;

      monitorStreamHealth();

      const ctx = canvasRef.current.getContext('2d', { alpha: false });
      if (!ctx) return;

      if (videoRef.current.videoWidth > 0 && canvasRef.current.width !== videoRef.current.videoWidth) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      }

      if (background) {
        try {
          const processedFrame = await processVideoFrame(videoRef.current, background);
          if (processedFrame) {
            ctx.putImageData(processedFrame, 0, 0);
          }
        } catch (error) {
          console.error('Error processing video frame:', error);
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      } else {
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

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

  const handleVideoPlaybackError = useCallback(async () => {
    if (!videoRef.current || !stream) return;
    
    try {
      console.log('Attempting to recover video playback');
      await videoRef.current.play();
      setIsVideoPlaying(true);
    } catch (error) {
      console.error('Failed to recover video playback:', error);
      if (onVideoError) {
        onVideoError(new Error('Video playback failed. Please try refreshing.'));
      }
    }
  }, [stream, onVideoError]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !stream) return;
    
    const playVideo = async () => {
      try {
        if (videoElement.paused) {
          console.log('Attempting to play video');
          await videoElement.play();
          setIsVideoPlaying(true);
        }
      } catch (error) {
        console.warn('Autoplay prevented:', error);
      }
    };
    
    const handleCanPlay = () => {
      console.log('Video can play event triggered');
      playVideo();
    };
    
    videoElement.addEventListener('canplay', handleCanPlay);
    
    if (videoElement.readyState >= 3) {
      playVideo();
    }
    
    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
    };
  }, [stream]);

  if (!stream) {
    return (
      <div className={cn(
        "w-full h-full flex items-center justify-center bg-secondary/10",
        className
      )}>
        <p className="text-xs text-muted-foreground">No video</p>
      </div>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={!isAudioOn}
        className={cn(
          (isProcessingBackground || !isVideoOn) ? 'hidden' : '',
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
      {isProcessingBackground && isVideoOn && (
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
      {!isVideoOn && (
        <div className={cn(
          "w-full h-full flex items-center justify-center bg-muted/20",
          className
        )}>
          <p className="text-xs text-muted-foreground">Camera off</p>
        </div>
      )}
    </>
  );
};

export default VideoDisplay;
