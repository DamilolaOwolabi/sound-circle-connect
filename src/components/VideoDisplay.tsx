
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VideoDisplayProps {
  stream: MediaStream | null;
  isVideoOn: boolean;
  isScreenShare: boolean;
  isAudioOn: boolean;
  videoStyle?: React.CSSProperties;
  className?: string;
  onVideoError?: (error: Error) => void;
}

const VideoDisplay = ({ 
  stream, 
  isVideoOn, 
  isScreenShare,
  isAudioOn,
  videoStyle,
  className,
  onVideoError
}: VideoDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoStats, setVideoStats] = useState<{
    droppedFrames: number;
    fps: number;
    resolution: string;
    timestamp: number;
  }>({ droppedFrames: 0, fps: 0, resolution: '', timestamp: 0 });
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
    if (stream && videoRef.current) {
      console.log('Setting video stream:', stream.id, 'Video tracks:', stream.getVideoTracks().length);
      
      // Check if the stream has video tracks before setting srcObject
      const videoTracks = stream.getVideoTracks();
      console.log('Video track enabled:', videoTracks.length > 0 ? 
        `${videoTracks[0].enabled}, readyState: ${videoTracks[0].readyState}` : 
        'No video tracks'
      );
      
      // Only set srcObject if the stream has media tracks
      if (stream.getTracks().length > 0) {
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
      } else {
        console.log('Stream has no tracks, not setting srcObject');
        // Clear the video source if there are no tracks
        if (videoRef.current.srcObject) {
          videoRef.current.srcObject = null;
          setIsVideoPlaying(false);
        }
      }
    } else if (videoRef.current && videoRef.current.srcObject && !isVideoOn && !isScreenShare) {
      // If video is turned off, clear the video source
      console.log('Clearing video source because video is turned off');
      videoRef.current.srcObject = null;
      setIsVideoPlaying(false);
    }
  }, [stream, isVideoOn, isScreenShare, handleVideoError, adjustStreamQuality, adaptiveQuality]);

  useEffect(() => {
    // Monitor stream health at regular intervals
    const intervalId = setInterval(() => {
      if (isVideoOn && stream) {
        monitorStreamHealth();
      }
    }, 2000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [stream, isVideoOn, monitorStreamHealth]);

  useEffect(() => {
    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
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
    if (!videoElement || !stream || !isVideoOn) return;
    
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
  }, [stream, isVideoOn]);

  // Check if video is actually available (stream exists, video is on, and stream has video tracks)
  const hasVideoTracks = stream?.getVideoTracks().length > 0 && isVideoOn;

  if (!stream || (!isScreenShare && !hasVideoTracks)) {
    return (
      <div className={cn(
        "w-full h-full flex items-center justify-center bg-secondary/10",
        className
      )}>
        <p className="text-xs text-muted-foreground">Camera off</p>
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
          !hasVideoTracks ? 'hidden' : '',
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
      {!hasVideoTracks && (
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
