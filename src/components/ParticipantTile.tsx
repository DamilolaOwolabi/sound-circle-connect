
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from 'lucide-react';
import { BackgroundOption } from './BackgroundSelector';
import { Avatar, AvatarFallback } from './ui/avatar';

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
  isConnected?: boolean;
  speakingMode?: 'private' | 'classroom' | 'muted';
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
  isConnected = false,
  speakingMode = 'private',
  onPositionChange
}: ParticipantTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition || { x: 50, y: 50 });
  const tileRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);

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

  // Update position when initialPosition changes
  useEffect(() => {
    if (initialPosition && (initialPosition.x !== position.x || initialPosition.y !== position.y)) {
      setPosition(initialPosition);
    }
  }, [initialPosition, position.x, position.y]);

  // Handle animation state
  useEffect(() => {
    if (isAnimating && !isSelfView && !hasAnimated) {
      // Mark that this participant has been animated
      setHasAnimated(true);
    }
  }, [isAnimating, isSelfView, hasAnimated]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMovable || !tileRef.current) return;
    
    e.preventDefault();
    
    const tileRect = tileRef.current.getBoundingClientRect();
    
    // Calculate offset from the center of the tile
    dragOffset.current = {
      x: e.clientX - (tileRect.left + tileRect.width / 2),
      y: e.clientY - (tileRect.top + tileRect.height / 2)
    };
    
    setIsDragging(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!tileRef.current || !isDragging) return;
      
      const container = tileRef.current.parentElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      
      // Calculate position as percentage of container, accounting for the drag offset
      const newX = ((e.clientX - dragOffset.current.x - containerRect.left) / containerRect.width) * 100;
      const newY = ((e.clientY - dragOffset.current.y - containerRect.top) / containerRect.height) * 100;
      
      // Keep within bounds (0-100%)
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
    if (!isMovable || !tileRef.current) return;
    
    // Prevent default to avoid scrolling while dragging
    e.preventDefault();
    
    const touch = e.touches[0];
    const tileRect = tileRef.current.getBoundingClientRect();
    
    // Calculate offset from the center of the tile
    dragOffset.current = {
      x: touch.clientX - (tileRect.left + tileRect.width / 2),
      y: touch.clientY - (tileRect.top + tileRect.height / 2)
    };
    
    setIsDragging(true);
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!tileRef.current || !isDragging) return;
      
      const touch = e.touches[0];
      const container = tileRef.current.parentElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      
      // Calculate position as percentage of container, accounting for the drag offset
      const newX = ((touch.clientX - dragOffset.current.x - containerRect.left) / containerRect.width) * 100;
      const newY = ((touch.clientY - dragOffset.current.y - containerRect.top) / containerRect.height) * 100;
      
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
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
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

  // Get initials for avatar fallback
  const getInitials = () => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get modes indication color
  const getModeColor = () => {
    switch (speakingMode) {
      case 'private':
        return 'rgba(78, 115, 223, 0.2)';
      case 'classroom':
        return 'rgba(28, 200, 138, 0.2)';
      case 'muted':
        return 'rgba(231, 74, 59, 0.2)';
      default:
        return 'rgba(78, 115, 223, 0.2)';
    }
  };

  // Get modes border color
  const getModeBorderColor = () => {
    switch (speakingMode) {
      case 'private':
        return '#4e73df';
      case 'classroom':
        return '#1cc88a';
      case 'muted':
        return '#e74a3b';
      default:
        return '#4e73df';
    }
  };

  // Get speaking mode icon
  const getModeIcon = () => {
    switch (speakingMode) {
      case 'private':
        return <Mic className="w-4 h-4" />;
      case 'classroom':
        return <Volume2 className="w-4 h-4" />;
      case 'muted':
        return <VolumeX className="w-4 h-4" />;
    }
  };

  const tileStyle: React.CSSProperties = {
    ...(initialPosition ? {
      position: 'absolute',
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: 'translate(-50%, -50%)',
      transition: isDragging 
        ? 'none' 
        : isAnimating 
          ? 'left 2s cubic-bezier(0.34, 1.56, 0.64, 1), top 2s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s ease-out, opacity 0.5s ease-out' 
          : 'none',
    } : {}),
    width: `${radiusSize * 2}px`,
    height: `${radiusSize * 2}px`,
    minWidth: '60px',
    minHeight: '60px',
    maxWidth: '300px',
    maxHeight: '300px',
    borderRadius: '50%', 
    aspectRatio: '1/1',
    boxShadow: isMovable && isDragging 
      ? '0 0 15px rgba(78, 115, 223, 0.8)' 
      : isConnected 
        ? '0 0 15px rgba(28, 200, 138, 0.6)' 
        : '0 4px 8px rgba(0, 0, 0, 0.1)',
    background: getModeColor(),
    border: `2px ${isSelfView ? 'solid' : 'dashed'} ${getModeBorderColor()}`,
    ...getBackgroundStyle()
  };

  // Add entrance animation styles when isAnimating is true
  const animationStyles: React.CSSProperties = isAnimating && !isSelfView ? {
    opacity: hasAnimated ? 1 : 0,
    transform: hasAnimated 
      ? 'translate(-50%, -50%) scale(1)' 
      : 'translate(-50%, -50%) scale(0.5)',
  } : {};

  return (
    <div
      ref={tileRef}
      className={cn(
        "relative overflow-hidden",
        isMovable ? "cursor-move" : "",
        isDragging ? "z-10" : "",
        isSelfView && isAnimating ? "animate-pulse" : "",
        className
      )}
      style={{...tileStyle, ...animationStyles}}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      aria-label={`${isMovable ? 'Movable ' : ''}participant ${name}`}
      role={isMovable ? "button" : undefined}
      tabIndex={isMovable ? 0 : undefined}
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
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#4e73df] to-[#1cc88a] flex items-center justify-center text-white text-2xl font-semibold">
            {getInitials()}
          </div>
        </div>
      )}
      
      {/* Status bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white px-2 py-1 flex justify-between items-center">
        <span className="text-sm font-medium truncate">{name}</span>
        <div className="flex gap-1">
          {/* Audio status icon */}
          <div className="relative">
            {isAudioOn ? (
              <Mic className="w-4 h-4 text-green-400" />
            ) : (
              <MicOff className="w-4 h-4 text-red-400" />
            )}
          </div>
          
          {/* Video status icon */}
          <div className="relative">
            {isVideoOn ? (
              <Video className="w-4 h-4 text-green-400" />
            ) : (
              <VideoOff className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
      </div>
      
      {/* Self view indicator */}
      {isSelfView && (
        <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-1.5 py-0.5 rounded">
          You
        </div>
      )}
      
      {/* Speaking mode indicator */}
      {isSelfView && speakingMode && (
        <div className="absolute top-2 right-2 bg-primary/80 text-white rounded-full p-1">
          {getModeIcon()}
        </div>
      )}
      
      {/* Connection status indicator */}
      {isConnected && !isSelfView && (
        <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-1.5 py-0.5 rounded">
          Connected
        </div>
      )}
      
      {/* Ripple effect when animation starts */}
      {isSelfView && isAnimating && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 rounded-full animate-ping bg-primary/20"></div>
          <div className="absolute inset-0 rounded-full animate-ping bg-primary/10 animation-delay-200"></div>
        </div>
      )}
    </div>
  );
};

export default ParticipantTile;
