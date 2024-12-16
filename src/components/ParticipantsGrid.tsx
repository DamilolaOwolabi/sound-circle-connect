import React from 'react';
import ParticipantTile from './ParticipantTile';

interface Participant {
  id: string;
  name: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
  radiusSize: number;
}

interface ParticipantsGridProps {
  layout: 'grid' | 'spotlight';
  localUser: {
    isAudioOn: boolean;
    isVideoOn: boolean;
    radiusSize: number;
    stream: MediaStream | null;
    screenStream: MediaStream | null;
    background?: { id: string; url?: string; type?: string } | null;  // Updated type definition
  };
  mockParticipants: Participant[];
}

const ParticipantsGrid = ({ layout, localUser, mockParticipants }: ParticipantsGridProps) => {
  return (
    <div className={`flex-1 relative min-h-[600px] ${layout === 'grid' ? 'grid grid-cols-3 gap-4' : 'flex justify-center'}`}>
      <ParticipantTile
        key="local-user"
        name="You"
        isAudioOn={localUser.isAudioOn}
        isVideoOn={localUser.isVideoOn}
        radiusSize={localUser.radiusSize}
        className={layout === 'grid' ? '' : 'w-full max-w-2xl'}
        stream={localUser.screenStream || localUser.stream}
        background={localUser.background}  // Pass background to ParticipantTile
      />
      {mockParticipants.map((participant) => (
        <ParticipantTile
          key={participant.id}
          name={participant.name}
          isAudioOn={participant.isAudioOn}
          isVideoOn={participant.isVideoOn}
          radiusSize={participant.radiusSize}
          className={layout === 'grid' ? '' : 'hidden'}
        />
      ))}
    </div>
  );
};

export default ParticipantsGrid;