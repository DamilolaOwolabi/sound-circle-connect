
import React, { useState, useEffect } from 'react';
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
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(true);
  const [participantsWithPositions, setParticipantsWithPositions] = useState<(Participant & { position?: { x: number, y: number } })[]>([]);
  
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
    const withRandomPositions = mockParticipants.map((p) => ({
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
      const sortedPositions = mockParticipants.map((p, index) => {
        // Calculate positions in a circular pattern
        const angleStep = (2 * Math.PI) / mockParticipants.length;
        const angle = angleStep * index;
        const radius = 150; // Distance from center
        
        return {
          ...p,
          position: {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
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
  }, [layout, mockParticipants]);

  return (
    <div className={`flex-1 relative min-h-[600px] ${layout === 'grid' ? 'grid grid-cols-3 gap-4' : 'flex justify-center'} rounded-xl overflow-hidden`}>
      <ParticipantTile
        key="local-user"
        name="You"
        isAudioOn={localUser.isAudioOn}
        isVideoOn={localUser.isVideoOn}
        radiusSize={localUser.radiusSize}
        className={`${layout === 'grid' ? '' : 'w-full max-w-2xl'} ${layout === 'spotlight' && isAnimating ? 'animate-pulse-once' : ''}`}
        stream={activeStream}
        background={localUser.background}
        isSelfView={true}
      />
      
      {layout === 'grid' ? (
        // Regular grid layout
        mockParticipants.map((participant) => (
          <ParticipantTile
            key={participant.id}
            name={participant.name}
            isAudioOn={participant.isAudioOn}
            isVideoOn={participant.isVideoOn}
            radiusSize={participant.radiusSize}
            className={layout === 'grid' ? '' : 'hidden'}
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
            className={layout === 'grid' ? 'hidden' : 'radius-mode-participant'}
            initialPosition={participant.position}
            isAnimating={isAnimating}
          />
        ))
      )}
    </div>
  );
};

export default ParticipantsGrid;
