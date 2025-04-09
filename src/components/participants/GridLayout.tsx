
import React from 'react';
import ParticipantTile from '../ParticipantTile';
import { Participant } from './types';

interface GridLayoutProps {
  allParticipants: Participant[];
}

const GridLayout = ({ allParticipants }: GridLayoutProps) => {
  return (
    <>
      {allParticipants.map((participant) => (
        <ParticipantTile
          key={participant.id}
          name={participant.name}
          isAudioOn={participant.isAudioOn}
          isVideoOn={participant.isVideoOn}
          radiusSize={participant.radiusSize}
          stream={participant.stream}
          className={''}
        />
      ))}
    </>
  );
};

export default GridLayout;
