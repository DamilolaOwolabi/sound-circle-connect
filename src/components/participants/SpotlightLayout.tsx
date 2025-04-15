
import React, { useState, useEffect } from 'react';
import ParticipantTile from '../ParticipantTile';
import { ParticipantWithPosition } from './types';

interface SpotlightLayoutProps {
  participantsWithPositions: ParticipantWithPosition[];
  isAnimating: boolean;
  localUserPosition?: { x: number, y: number };
}

const SpotlightLayout = ({ participantsWithPositions, isAnimating, localUserPosition }: SpotlightLayoutProps) => {
  // Calculate viewport dimensions for position conversion
  const [viewportDimensions, setViewportDimensions] = useState({
    width: 0,
    height: 0
  });
  
  useEffect(() => {
    // Get the container dimensions for proper positioning
    const updateDimensions = () => {
      const container = document.querySelector('.spotlight-container') as HTMLElement;
      if (container) {
        setViewportDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  return (
    <div className="relative flex items-center justify-center w-full h-full spotlight-container">
      {participantsWithPositions.map((participant) => {
        // Use either the calculated position or position from props if manually positioned
        const finalPosition = participant.position || { x: 0, y: 0 };
        
        return (
          <ParticipantTile
            key={participant.id}
            name={participant.name}
            isAudioOn={participant.isAudioOn}
            isVideoOn={participant.isVideoOn}
            radiusSize={participant.radiusSize}
            stream={participant.stream}
            className="radius-mode-participant"
            initialPosition={finalPosition}
            isAnimating={isAnimating}
            isMovable={participant.id === 'local-user'} // Only local user is movable
          />
        );
      })}
    </div>
  );
};

export default SpotlightLayout;
