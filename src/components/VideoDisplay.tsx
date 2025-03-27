
import React, { useEffect, useRef, useState } from 'react';
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
}

const VideoDisplay = ({ 
  stream, 
  isVideoOn, 
  isScreenShare,
  isAudioOn,
  videoStyle,
  className,
  background 
}: VideoDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessingBackground, setIsProcessingBackground] = useState(false);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Setting video stream:', stream.id);
      videoRef.current.srcObject = stream;
      
      // Only apply constraints if the video is actually on
      if (isVideoOn || isScreenShare) {
        const videoTracks = stream.getVideoTracks();
        
        if (videoTracks.length > 0) {
          // Set video constraints for higher quality
          const constraints = {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          };
          
          try {
            videoTracks[0].applyConstraints(constraints)
              .catch(error => console.warn('Could not apply video constraints:', error));
          } catch (e) {
            console.warn('Error applying constraints:', e);
          }
        }
      }
    }
  }, [stream, isVideoOn, isScreenShare]);

  useEffect(() => {
    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !isVideoOn || isScreenShare) return;

      const ctx = canvasRef.current.getContext('2d', { alpha: false });
      if (!ctx) return;

      // Set canvas dimensions to match video for proper resolution
      if (videoRef.current.videoWidth > 0 && canvasRef.current.width !== videoRef.current.videoWidth) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      }

      // Process frame with background if needed
      if (background) {
        const processedFrame = await processVideoFrame(videoRef.current, background);
        if (processedFrame) {
          ctx.putImageData(processedFrame, 0, 0);
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
  }, [stream, isVideoOn, isScreenShare, background]);

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
