
import React from 'react';
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
        // Use the calculated position or position from props if manually positioned
        const finalPosition = participant.position || { x: 50, y: 50 };
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
            isAnimating={isAnimating} // Pass the animation state
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
