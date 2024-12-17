import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VideoDisplayProps {
  stream: MediaStream | null;
  isVideoOn: boolean;
  isScreenShare: boolean;
  isAudioOn: boolean;
  videoStyle?: React.CSSProperties;
  className?: string;
}

const VideoDisplay = ({ 
  stream, 
  isVideoOn, 
  isScreenShare,
  isAudioOn,
  videoStyle,
  className 
}: VideoDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      console.log('Setting video stream:', stream.id);
      
      // Ensure video tracks are properly enabled/disabled
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach(track => {
          track.enabled = isVideoOn;
          console.log(`Video track ${track.label} enabled:`, isVideoOn);
        });
      }
    }
  }, [stream, isVideoOn]);

  if (!stream || (!isVideoOn && !isScreenShare)) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={!isAudioOn}
      className={cn(
        "w-full h-full",
        isScreenShare ? "object-contain" : "object-cover",
        className
      )}
      style={videoStyle}
    />
  );
};

export default VideoDisplay;