import React, { useState, useEffect } from 'react';
import ParticipantTile from './ParticipantTile';
import { BackgroundOption } from './BackgroundSelector';

interface Participant {
  id: string;
  name: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
  radiusSize: number;
  stream?: MediaStream | null;
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
  remoteParticipants?: Participant[];
}

const ParticipantsGrid = ({ layout, localUser, mockParticipants, remoteParticipants = [] }: ParticipantsGridProps) => {
  // Determine which stream to use (screen share has priority)
  const activeStream = localUser.screenStream || localUser.stream;
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(true);
  const [participantsWithPositions, setParticipantsWithPositions] = useState<(Participant & { position?: { x: number, y: number } })[]>([]);
  
  // Combine mock and remote participants for display
  const allParticipants = [...mockParticipants, ...remoteParticipants];
  
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

  // Entry animation effect
  useEffect(() => {
    // Skip animation in grid layout
    if (layout === 'grid') {
      setIsAnimating(false);
      return;
    }
    
    // Add random positions for initial shuffle
    const withRandomPositions = allParticipants.map((p) => ({
      ...p,
      position: {
        x: Math.random() * 200 - 100, // Random position between -100 and 100
        y: Math.random() * 200 - 100
      }
    }));
    
    setParticipantsWithPositions(withRandomPositions);
    
    // First phase: Shuffle animation
    const shuffleTimeout = setTimeout(() => {
      // Second phase: Sort into positions around the host
      const sortedPositions = allParticipants.map((p, index) => {
        // Calculate positions in a circular pattern
        const angleStep = (2 * Math.PI) / allParticipants.length;
        const angle = angleStep * index;
        
        // Calculate radius based on user's radius size to maintain proper spacing
        // Ensure participants are at least half the user's radius diameter away plus their own radius
        const minDistance = localUser.radiusSize * 1.5 + p.radiusSize;
        
        return {
          ...p,
          position: {
            x: Math.cos(angle) * minDistance,
            y: Math.sin(angle) * minDistance
          }
        };
      });
      
      setParticipantsWithPositions(sortedPositions);
      
      // End animation after sorting completes
      setTimeout(() => setIsAnimating(false), 1000);
    }, 1500);
    
    return () => {
      clearTimeout(shuffleTimeout);
    };
  }, [layout, allParticipants, localUser.radiusSize]);

  return (
    <div className={`flex-1 relative min-h-[600px] ${layout === 'grid' ? 'grid grid-cols-3 gap-4' : 'flex justify-center'} rounded-xl overflow-hidden`}>
      <ParticipantTile
        key="local-user"
        name="You"
        isAudioOn={localUser.isAudioOn}
        isVideoOn={localUser.isVideoOn}
        radiusSize={localUser.radiusSize}
        className={`${layout === 'grid' ? '' : ''} ${layout === 'spotlight' && isAnimating ? 'animate-pulse-once' : ''}`}
        stream={activeStream}
        background={localUser.background}
        isSelfView={true}
      />
      
      {layout === 'grid' ? (
        // Regular grid layout
        allParticipants.map((participant) => (
          <ParticipantTile
            key={participant.id}
            name={participant.name}
            isAudioOn={participant.isAudioOn}
            isVideoOn={participant.isVideoOn}
            radiusSize={participant.radiusSize}
            stream={participant.stream}
            className={''}
          />
        ))
      ) : (
        // Radius mode with animations
        participantsWithPositions.map((participant) => (
          <ParticipantTile
            key={participant.id}
            name={participant.name}
            isAudioOn={participant.isAudioOn}
            isVideoOn={participant.isVideoOn}
            radiusSize={participant.radiusSize}
            stream={participant.stream}
            className={'radius-mode-participant'}
            initialPosition={participant.position}
            isAnimating={isAnimating}
          />
        ))
      )}
    </div>
  );
};

export default ParticipantsGrid;
