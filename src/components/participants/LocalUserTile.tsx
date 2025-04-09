
import React from 'react';
import ParticipantTile from '../ParticipantTile';
import { BackgroundOption } from '../BackgroundSelector';

interface LocalUserTileProps {
  isAudioOn: boolean;
  isVideoOn: boolean;
  radiusSize: number;
  stream: MediaStream | null;
  layout: 'grid' | 'spotlight';
  isAnimating: boolean;
  background?: BackgroundOption | null;
}

const LocalUserTile = ({
  isAudioOn,
  isVideoOn,
  radiusSize,
  stream,
  layout,
  isAnimating,
  background
}: LocalUserTileProps) => {
  return (
    <ParticipantTile
      key="local-user"
      name="You"
      isAudioOn={isAudioOn}
      isVideoOn={isVideoOn}
      radiusSize={radiusSize}
      className={`${layout === 'grid' ? '' : ''} ${layout === 'spotlight' && isAnimating ? 'animate-pulse-once' : ''}`}
      stream={stream}
      background={background}
      isSelfView={true}
    />
  );
};

export default LocalUserTile;
