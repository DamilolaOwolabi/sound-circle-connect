
import React from 'react';
import ParticipantTile from '../ParticipantTile';
import { ParticipantWithPosition } from './types';

interface SpotlightLayoutProps {
  participantsWithPositions: ParticipantWithPosition[];
  isAnimating: boolean;
}

const SpotlightLayout = ({ participantsWithPositions, isAnimating }: SpotlightLayoutProps) => {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {participantsWithPositions.map((participant) => (
        <ParticipantTile
          key={participant.id}
          name={participant.name}
          isAudioOn={participant.isAudioOn}
          isVideoOn={participant.isVideoOn}
          radiusSize={participant.radiusSize}
          stream={participant.stream}
          className="radius-mode-participant"
          initialPosition={participant.position}
          isAnimating={isAnimating}
        />
      ))}
    </div>
  );
};

export default SpotlightLayout;
