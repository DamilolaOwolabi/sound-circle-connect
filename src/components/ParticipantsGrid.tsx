
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import LocalUserTile from './participants/LocalUserTile';
import GridLayout from './participants/GridLayout';
import SpotlightLayout from './participants/SpotlightLayout';
import useParticipantAnimations from './participants/useParticipantAnimations';
import { Participant, ParticipantWithPosition } from './participants/types';
import { BackgroundOption } from './BackgroundSelector';
import { useRadiusAudio } from '@/hooks/useRadiusAudio';
import SpeakingModeSelector from './participants/SpeakingModeSelector';

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
    speakingMode?: 'private' | 'classroom' | 'muted';
  };
  mockParticipants: Participant[];
  remoteParticipants?: Participant[];
  onLocalUserPositionChange?: (position: { x: number, y: number }) => void;
  onSpeakingModeChange?: (mode: 'private' | 'classroom' | 'muted') => void;
}

const ParticipantsGrid = ({ 
  layout, 
  localUser, 
  mockParticipants, 
  remoteParticipants = [],
  onLocalUserPositionChange,
  onSpeakingModeChange
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

  // Local user with position
  const localUserWithPosition: ParticipantWithPosition = {
    id: 'local-user',
    name: 'You',
    isAudioOn: localUser.isAudioOn,
    isVideoOn: localUser.isVideoOn,
    radiusSize: localUser.radiusSize,
    stream: activeStream,
    position: localUser.position,
    speakingMode: localUser.speakingMode || 'private'
  };
  
  // Audio connections based on radius overlap
  const { audioConnections, isUserConnectedTo } = useRadiusAudio({
    localUser: localUserWithPosition,
    participants: participantsWithPositions
  });
  
  // Handle tap on the meeting space
  const handleMeetingSpaceTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (layout !== 'spotlight' || !onLocalUserPositionChange) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const newX = ((e.clientX - rect.left) / rect.width) * 100;
    const newY = ((e.clientY - rect.top) / rect.height) * 100;
    
    onLocalUserPositionChange({ x: newX, y: newY });
  };
  
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
    <div className="flex flex-col flex-1 min-h-[600px]">
      {layout === 'spotlight' && (
        <div className="mb-4 flex justify-end">
          <SpeakingModeSelector 
            currentMode={localUser.speakingMode || 'private'} 
            onChange={(mode) => onSpeakingModeChange?.(mode)}
          />
        </div>
      )}
      
      <div 
        className={cn(
          "flex-1 relative min-h-[600px]",
          layout === 'grid' ? 'grid grid-cols-3 gap-4' : 'flex justify-center',
          "rounded-xl overflow-hidden"
        )}
        onClick={handleMeetingSpaceTap}
      >
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
          speakingMode={localUser.speakingMode || 'private'}
        />
        
        {layout === 'grid' ? (
          <GridLayout allParticipants={allParticipants} />
        ) : (
          <SpotlightLayout 
            participantsWithPositions={participantsWithPositions} 
            isAnimating={isAnimating}
            localUserPosition={localUser.position}
            audioConnections={audioConnections}
          />
        )}
      </div>
    </div>
  );
};

export default ParticipantsGrid;
