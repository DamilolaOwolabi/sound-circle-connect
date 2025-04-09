
import React from 'react';
import ParticipantTile from '../ParticipantTile';
import { ParticipantWithPosition } from './types';

interface SpotlightLayoutProps {
  participantsWithPositions: ParticipantWithPosition[];
  isAnimating: boolean;
}

const SpotlightLayout = ({ participantsWithPositions, isAnimating }: SpotlightLayoutProps) => {
  return (
    <>
      {participantsWithPositions.map((participant) => (
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
      ))}
    </>
  );
};

export default SpotlightLayout;
