
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
      radiusSize={layout === 'spotlight' ? radiusSize * 1.2 : radiusSize} // Make it 20% larger in spotlight mode
      className={`${layout === 'grid' ? '' : 'local-user-spotlight'}`}
      stream={stream}
      background={background}
      isSelfView={true}
      isAnimating={isAnimating}
    />
  );
};

export default LocalUserTile;
