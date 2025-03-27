import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import VideoDisplay from './VideoDisplay';
import AudioStream from './AudioStream';
import { useToast } from '@/hooks/use-toast';

interface ParticipantTileProps {
  name: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
  radiusSize: number;
  className?: string;
  stream?: MediaStream | null;
  background?: { id: string; url?: string; type?: string } | null;
  isSelfView?: boolean;
}

const ParticipantTile = ({
  name,
  isAudioOn,
  isVideoOn,
  radiusSize,
  className,
  stream,
  background,
  isSelfView = false
}: ParticipantTileProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isInRange, setIsInRange] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const { toast } = useToast();

  useEffect(() => {
    if (stream) {
      console.log('ParticipantTile stream for', name, ':', stream.id, 'Video tracks:', stream.getVideoTracks().length);
    }
  }, [stream, name]);

  useEffect(() => {
    console.log('Background updated for', name, ':', background);
  }, [background, name]);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    const rect = tileRef.current?.getBoundingClientRect();
    if (rect) {
      dragStartPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDrag = (e: React.DragEvent) => {
    if (!e.clientX || !e.clientY) return;
    
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    console.log('Participant moved to:', position);
  };

  useEffect(() => {
    const checkRadiusIntersection = () => {
      const currentTile = tileRef.current;
      if (!currentTile) return;

      const otherTiles = document.querySelectorAll('.participant-tile');
      let hasIntersection = false;

      otherTiles.forEach(tile => {
        if (tile === currentTile) return;

        const rect1 = currentTile.getBoundingClientRect();
        const rect2 = tile.getBoundingClientRect();

        const center1 = {
          x: rect1.left + rect1.width / 2,
          y: rect1.top + rect1.height / 2
        };

        const center2 = {
          x: rect2.left + rect2.width / 2,
          y: rect2.top + rect2.height / 2
        };

        const distance = Math.sqrt(
          Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
        );

        if (distance < (radiusSize * 2)) {
          hasIntersection = true;
          console.log(`${name}'s radius is intersecting with another participant`);
        }
      });

      setIsInRange(hasIntersection);
    };

    // Only check radius intersection if not a self-view component
    if (!isSelfView) {
      checkRadiusIntersection();
    }
  }, [position, radiusSize, name, isSelfView]);

  // Handle video errors
  const handleVideoError = (error: Error) => {
    console.error(`Video error for ${name}:`, error);
    setHasVideoError(true);
    toast({
      variant: "destructive",
      title: `Video Error for ${name}`,
      description: error.message || "There was a problem with the video stream.",
    });
    
    // Attempt recovery after a short delay
    setTimeout(() => {
      setHasVideoError(false);
    }, 5000);
  };

  // Determine if the stream is a screen share
  const isScreenShare = stream?.getVideoTracks().some(track => 
    track.label.includes('screen') || 
    track.label.includes('window') || 
    track.label.includes('tab')
  );

  return (
    <div
      ref={tileRef}
      className={cn(
        "participant-tile relative cursor-move p-1",
        isDragging && "opacity-75",
        isSelfView && "self-view",
        className
      )}
      draggable={!isSelfView}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        position: isSelfView ? 'relative' : 'absolute',
        left: isSelfView ? 'auto' : `${position.x}px`,
        top: isSelfView ? 'auto' : `${position.y}px`,
        transform: `translate(${isDragging ? '-4px, -4px' : '0, 0'})`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        zIndex: isDragging ? 10 : 1,
      }}
    >
      <div 
        className={cn(
          "overflow-hidden bg-muted relative",
          isScreenShare ? "w-full h-full rounded-lg" : "rounded-full"
        )}
        style={{
          width: isScreenShare ? '100%' : `${radiusSize * 2}px`,
          height: isScreenShare ? '100%' : `${radiusSize * 2}px`,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {hasVideoError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
            <div className="text-destructive flex flex-col items-center gap-2">
              <AlertTriangle className="w-8 h-8" />
              <p className="text-xs font-medium">Video error</p>
            </div>
          </div>
        ) : (
          <VideoDisplay 
            stream={stream}
            isVideoOn={isVideoOn}
            isScreenShare={!!isScreenShare}
            isAudioOn={isAudioOn}
            background={background}
            onVideoError={handleVideoError}
            className="w-full h-full"
          />
        )}
        
        {(!stream || (!isVideoOn && !isScreenShare)) && !hasVideoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/10">
            <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center text-2xl font-semibold">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        <AudioStream 
          stream={stream}
          isAudioOn={isAudioOn}
          volume={isInRange ? 1 : 0}
        />

        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 rounded-full px-2 py-1">
          {isAudioOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3 text-destructive" />}
          {isVideoOn ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3 text-destructive" />}
          {isScreenShare && <Monitor className="w-3 h-3" />}
        </div>
        
        {!isScreenShare && !isSelfView && (
          <div 
            className="absolute inset-0 pointer-events-none participant-radius"
            style={{
              background: `radial-gradient(circle at center, transparent ${radiusSize * 0.5}px, ${isInRange ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'} ${radiusSize}px)`,
              transition: 'all 0.3s ease-in-out'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ParticipantTile;
