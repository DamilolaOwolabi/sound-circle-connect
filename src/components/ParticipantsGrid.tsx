
import React from 'react';
import { cn } from '@/lib/utils';
import LocalUserTile from './participants/LocalUserTile';
import GridLayout from './participants/GridLayout';
import SpotlightLayout from './participants/SpotlightLayout';
import useParticipantAnimations from './participants/useParticipantAnimations';
import { Participant } from './participants/types';
import { BackgroundOption } from './BackgroundSelector';

interface ParticipantsGridProps {
  layout: 'grid' | 'spotlight';
  localUser: {
    isAudioOn: boolean;
    isVideoOn: boolean;
    radiusSize: number;
    stream: MediaStream | null;
    screenStream: MediaStream | null;
    background?: BackgroundOption | null;
    position?: { x: number, y: number };
  };
  mockParticipants: Participant[];
  remoteParticipants?: Participant[];
  onLocalUserPositionChange?: (position: { x: number, y: number }) => void;
}

const ParticipantsGrid = ({ 
  layout, 
  localUser, 
  mockParticipants, 
  remoteParticipants = [],
  onLocalUserPositionChange
}: ParticipantsGridProps) => {
  // Determine which stream to use (screen share has priority)
  const activeStream = localUser.screenStream || localUser.stream;
  
  // Combine mock and remote participants for display
  const allParticipants = [...mockParticipants, ...remoteParticipants];
  
  // Animation states from custom hook
  const { isAnimating, participantsWithPositions } = useParticipantAnimations({
    layout,
    allParticipants,
    localUserRadiusSize: localUser.radiusSize,
    localUserPosition: localUser.position
  });
  
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
    <div className={cn(
      "flex-1 relative min-h-[600px]",
      layout === 'grid' ? 'grid grid-cols-3 gap-4' : 'flex justify-center',
      "rounded-xl overflow-hidden"
    )}>
      <LocalUserTile
        isAudioOn={localUser.isAudioOn}
        isVideoOn={localUser.isVideoOn}
        radiusSize={localUser.radiusSize}
        stream={activeStream}
        layout={layout}
        isAnimating={isAnimating}
        background={localUser.background}
        position={localUser.position}
        onPositionChange={onLocalUserPositionChange}
      />
      
      {layout === 'grid' ? (
        <GridLayout allParticipants={allParticipants} />
      ) : (
        <SpotlightLayout 
          participantsWithPositions={participantsWithPositions} 
          isAnimating={isAnimating}
          localUserPosition={localUser.position}
        />
      )}
    </div>
  );
};

export default ParticipantsGrid;
