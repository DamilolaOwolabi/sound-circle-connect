
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { BackgroundOption } from './BackgroundSelector';

interface ParticipantTileProps {
  id?: string;
  name: string;
  isAudioOn: boolean;
  isVideoOn?: boolean;
  radiusSize: number;
  stream?: MediaStream | null;
  className?: string;
  background?: BackgroundOption | null;
  isSelfView?: boolean;
  initialPosition?: { x: number, y: number };
  isAnimating?: boolean;
  isMovable?: boolean;
  onPositionChange?: (position: { x: number, y: number }) => void;
}

const ParticipantTile = ({
  id = crypto.randomUUID(),
  name,
  isAudioOn,
  isVideoOn = false,
  radiusSize,
  stream,
  className,
  background,
  isSelfView = false,
  initialPosition,
  isAnimating = false,
  isMovable = false,
  onPositionChange
}: ParticipantTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 50, y: 50 });
  const tileRef = useRef<HTMLDivElement>(null);

  // Connect stream to video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      
      // Attempt to play the video
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (err) {
          console.error('Error playing video:', err);
        }
      };
      
      playVideo();
    }
  }, [stream]);

  useEffect(() => {
    if (initialPosition && (initialPosition.x !== position.x || initialPosition.y !== position.y)) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMovable) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!tileRef.current || !isDragging) return;
      
      const container = tileRef.current.parentElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      
      // Calculate position as percentage of container
      const newX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const newY = ((e.clientY - containerRect.top) / containerRect.height) * 100;
      
      // Keep within bounds
      const boundedX = Math.max(0, Math.min(100, newX));
      const boundedY = Math.max(0, Math.min(100, newY));
      
      setPosition({ x: boundedX, y: boundedY });
      
      if (onPositionChange) {
        onPositionChange({ x: boundedX, y: boundedY });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMovable) return;
    
    setIsDragging(true);
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!tileRef.current || !isDragging) return;
      
      const touch = e.touches[0];
      const container = tileRef.current.parentElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      
      // Calculate position as percentage of container
      const newX = ((touch.clientX - containerRect.left) / containerRect.width) * 100;
      const newY = ((touch.clientY - containerRect.top) / containerRect.height) * 100;
      
      // Keep within bounds
      const boundedX = Math.max(0, Math.min(100, newX));
      const boundedY = Math.max(0, Math.min(100, newY));
      
      setPosition({ x: boundedX, y: boundedY });
      
      if (onPositionChange) {
        onPositionChange({ x: boundedX, y: boundedY });
      }
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const getBackgroundStyle = () => {
    if (!background) return {};
    
    if (background.type === 'color') {
      return { background: background.value };
    } else {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
  };

  // Fix: Create a properly typed style object for the tile
  const tileStyle: React.CSSProperties = initialPosition ? {
    position: 'absolute',
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: 'translate(-50%, -50%)',
    transition: isDragging ? 'none' : isAnimating ? 'left 0.8s ease-out, top 0.8s ease-out' : 'left 0.3s ease, top 0.3s ease',
    width: `${radiusSize * 2}px`,
    height: `${radiusSize * 2}px`,
    minWidth: '120px',
    minHeight: '120px',
    maxWidth: '400px',
    maxHeight: '400px',
    ...getBackgroundStyle()
  } : {
    width: `${radiusSize * 2}px`,
    height: `${radiusSize * 2}px`,
    minWidth: '120px',
    minHeight: '120px',
    maxWidth: '400px',
    maxHeight: '400px',
    ...getBackgroundStyle()
  };

  return (
    <div
      ref={tileRef}
      className={cn(
        "relative rounded-lg overflow-hidden shadow-lg border border-border",
        isMovable ? "cursor-move" : "",
        className
      )}
      style={tileStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {isVideoOn && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isSelfView}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 flex justify-between items-center">
        <span className="text-sm font-medium truncate">{name}</span>
        <div className="flex gap-1">
          {isAudioOn ? (
            <Mic className="w-4 h-4 text-green-400" />
          ) : (
            <MicOff className="w-4 h-4 text-red-400" />
          )}
          {isVideoOn ? (
            <Video className="w-4 h-4 text-green-400" />
          ) : (
            <VideoOff className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>
      
      {isSelfView && (
        <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-1.5 py-0.5 rounded">
          You
        </div>
      )}
      
      {isMovable && (
        <div className="absolute top-2 right-2 bg-primary/80 rounded-full p-1 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5 9 2 12 5 15"></polyline>
            <polyline points="9 5 12 2 15 5"></polyline>
            <polyline points="15 19 12 22 9 19"></polyline>
            <polyline points="19 9 22 12 19 15"></polyline>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="12" y1="2" x2="12" y2="22"></line>
          </svg>
        </div>
      )}
    </div>
  );
};

export default ParticipantTile;
