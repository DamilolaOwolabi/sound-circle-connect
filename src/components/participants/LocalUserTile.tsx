
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
  position?: { x: number, y: number };
  onPositionChange?: (position: { x: number, y: number }) => void;
  speakingMode?: 'private' | 'classroom' | 'muted';
}

const LocalUserTile = ({
  isAudioOn,
  isVideoOn,
  radiusSize,
  stream,
  layout,
  isAnimating,
  background,
  position,
  onPositionChange,
  speakingMode = 'private'
}: LocalUserTileProps) => {
  // For spotlight/radius mode, make the local user tile slightly larger
  const adjustedRadiusSize = layout === 'spotlight' ? radiusSize * 1.2 : radiusSize;
  
  return (
    <ParticipantTile
      key="local-user"
      id="local-user"
      name="You"
      isAudioOn={isAudioOn}
      isVideoOn={isVideoOn}
      radiusSize={adjustedRadiusSize}
      className={`${layout === 'grid' ? '' : 'local-user-spotlight'}`}
      stream={stream}
      background={background}
      isSelfView={true}
      isAnimating={isAnimating}
      initialPosition={position}
      isMovable={layout === 'spotlight'} // Only enable movement in spotlight mode
      onPositionChange={onPositionChange}
      speakingMode={speakingMode}
    />
  );
};

export default LocalUserTile;
