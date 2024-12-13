import React from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantTileProps {
  name: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
  radiusSize: number;
  className?: string;
}

const ParticipantTile = ({
  name,
  isAudioOn,
  isVideoOn,
  radiusSize,
  className
}: ParticipantTileProps) => {
  return (
    <div className={cn("relative rounded-lg overflow-hidden bg-muted", className)}>
      <div className="aspect-video bg-secondary/10 relative">
        {!isVideoOn && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex gap-2">
          {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-destructive" />}
          {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-destructive" />}
        </div>
        <div 
          className="absolute inset-0 pointer-events-none participant-radius"
          style={{
            background: `radial-gradient(circle at center, transparent ${radiusSize}%, rgba(99, 102, 241, 0.1) ${radiusSize}%)`
          }}
        />
      </div>
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
        <div className="radius-indicator w-24 h-24 rounded-full border-2 border-accent/30" />
      </div>
    </div>
  );
};

export default ParticipantTile;