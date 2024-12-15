import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantTileProps {
  name: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
  radiusSize: number;
  className?: string;
  stream?: MediaStream | null;
}

const ParticipantTile = ({
  name,
  isAudioOn,
  isVideoOn,
  radiusSize,
  className,
  stream
}: ParticipantTileProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      console.log('Video stream attached for:', name);
    }
  }, [stream, name]);

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

        const isIntersecting = distance < (radiusSize * 2);
        
        if (isIntersecting) {
          currentTile.classList.add('radius-intersecting');
          tile.classList.add('radius-intersecting');
          console.log(`${name}'s radius is intersecting with another participant`);
        } else {
          currentTile.classList.remove('radius-intersecting');
          tile.classList.remove('radius-intersecting');
        }
      });
    };

    checkRadiusIntersection();
  }, [position, radiusSize, name]);

  return (
    <div
      ref={tileRef}
      className={cn(
        "participant-tile relative cursor-move",
        isDragging && "opacity-75",
        className
      )}
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(${isDragging ? '-4px, -4px' : '0, 0'})`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        zIndex: isDragging ? 10 : 1
      }}
    >
      <div className="w-24 h-24 rounded-full overflow-hidden bg-muted relative">
        {isVideoOn && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={!isAudioOn}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/10">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-lg font-semibold">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 rounded-full px-2 py-1">
          {isAudioOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3 text-destructive" />}
          {isVideoOn ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3 text-destructive" />}
        </div>
        <div 
          className="absolute inset-0 pointer-events-none participant-radius radius-indicator"
          style={{
            background: `radial-gradient(circle at center, transparent ${radiusSize}%, rgba(99, 102, 241, 0.1) ${radiusSize}%)`
          }}
        />
      </div>
    </div>
  );
};

export default ParticipantTile;