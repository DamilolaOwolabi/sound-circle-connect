
import React from 'react';
import ParticipantTile from './ParticipantTile';
import { BackgroundOption } from './BackgroundSelector';

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
    background?: BackgroundOption | null;
  };
  mockParticipants: Participant[];
}

const ParticipantsGrid = ({ layout, localUser, mockParticipants }: ParticipantsGridProps) => {
  // Determine which stream to use (screen share has priority)
  const activeStream = localUser.screenStream || localUser.stream;
  
  // Log stream info for debugging
  React.useEffect(() => {
    if (activeStream) {
      console.log('ParticipantsGrid active stream:', activeStream.id);
      console.log('Video tracks:', activeStream.getVideoTracks().map(t => ({
        enabled: t.enabled,
        readyState: t.readyState,
        label: t.label
      })));
    } else {
      console.log('ParticipantsGrid: No active stream');
    }
  }, [activeStream]);

  return (
    <div className={`flex-1 relative min-h-[600px] ${layout === 'grid' ? 'grid grid-cols-3 gap-4' : 'flex justify-center'} rounded-xl overflow-hidden`}>
      <ParticipantTile
        key="local-user"
        name="You"
        isAudioOn={localUser.isAudioOn}
        isVideoOn={localUser.isVideoOn}
        radiusSize={localUser.radiusSize}
        className={layout === 'grid' ? '' : 'w-full max-w-2xl'}
        stream={activeStream}
        background={localUser.background}
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
