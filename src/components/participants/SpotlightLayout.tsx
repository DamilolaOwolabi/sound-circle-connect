
import React, { useState, useEffect } from 'react';
import ParticipantTile from '../ParticipantTile';
import { ParticipantWithPosition, AudioConnection } from './types';

interface SpotlightLayoutProps {
  participantsWithPositions: ParticipantWithPosition[];
  isAnimating: boolean;
  localUserPosition?: { x: number, y: number };
  audioConnections?: AudioConnection[];
}

const SpotlightLayout = ({ 
  participantsWithPositions, 
  isAnimating, 
  localUserPosition,
  audioConnections = []
}: SpotlightLayoutProps) => {
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

  // Determine if a participant is connected to the local user
  const isConnectedToLocalUser = (participantId: string): boolean => {
    return audioConnections.some(
      conn => 
        (conn.sourceId === 'local-user' && conn.targetId === participantId && conn.isConnected) ||
        (conn.targetId === 'local-user' && conn.sourceId === participantId && conn.isConnected)
    );
  };
  
  return (
    <div className="relative flex items-center justify-center w-full h-full spotlight-container">
      {participantsWithPositions.map((participant) => {
        // Use either the calculated position or position from props if manually positioned
        const finalPosition = participant.position || { x: 0, y: 0 };
        const isConnected = isConnectedToLocalUser(participant.id);
        
        return (
          <ParticipantTile
            key={participant.id}
            id={participant.id}
            name={participant.name}
            isAudioOn={participant.isAudioOn}
            isVideoOn={participant.isVideoOn}
            radiusSize={participant.radiusSize}
            stream={participant.stream}
            className="radius-mode-participant"
            initialPosition={finalPosition}
            isAnimating={isAnimating}
            isMovable={participant.isMovable || false}
            isConnected={isConnected}
            speakingMode={participant.speakingMode}
          />
        );
      })}
    </div>
  );
};

export default SpotlightLayout;
