
import React from 'react';
import ParticipantTile from '../ParticipantTile';
import { Participant } from './types';
import { cn } from '@/lib/utils';

interface GridLayoutProps {
  allParticipants: Participant[];
}

const GridLayout = ({ allParticipants }: GridLayoutProps) => {
  // Determine grid columns based on participant count for responsive layout
  const getGridColumns = () => {
    const count = allParticipants.length;
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className={cn(
      "grid gap-4 w-full", 
      getGridColumns()
    )}>
      {allParticipants.map((participant) => (
        <ParticipantTile
          key={participant.id}
          name={participant.name}
          isAudioOn={participant.isAudioOn}
          isVideoOn={participant.isVideoOn}
          radiusSize={participant.radiusSize}
          stream={participant.stream}
          className="h-full w-full"
        />
      ))}
    </div>
  );
};

export default GridLayout;
