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