import React from 'react';
import ParticipantTile from '@/components/ParticipantTile';
import Controls from '@/components/Controls';
import ParticipantsList from '@/components/ParticipantsList';
import { useLocation } from 'react-router-dom';

const MOCK_PARTICIPANTS = [
  { id: '1', name: 'You', isAudioOn: true, isVideoOn: true, radiusSize: 50 },
  { id: '2', name: 'John Doe', isAudioOn: true, isVideoOn: false, radiusSize: 70 },
  { id: '3', name: 'Jane Smith', isAudioOn: false, isVideoOn: true, radiusSize: 30 },
  { id: '4', name: 'Alice Johnson', isAudioOn: true, isVideoOn: true, radiusSize: 60 },
];

const Meeting = () => {
  const [isAudioOn, setIsAudioOn] = React.useState(true);
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  const location = useLocation();
  const isHost = location.state?.isHost;

  console.log('Meeting role:', isHost ? 'Host' : 'Participant');
  console.log('Audio state:', isAudioOn);
  console.log('Video state:', isVideoOn);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex gap-6">
        <div className="flex-1 relative min-h-[600px]">
          {MOCK_PARTICIPANTS.map((participant, index) => (
            <ParticipantTile
              key={participant.id}
              name={participant.name}
              isAudioOn={participant.isAudioOn}
              isVideoOn={participant.isVideoOn}
              radiusSize={participant.radiusSize}
              className="w-64"
            />
          ))}
        </div>
        <ParticipantsList participants={MOCK_PARTICIPANTS} />
      </div>
      <Controls
        isAudioOn={isAudioOn}
        isVideoOn={isVideoOn}
        onToggleAudio={() => setIsAudioOn(!isAudioOn)}
        onToggleVideo={() => setIsVideoOn(!isVideoOn)}
        onLeave={() => console.log('Leave meeting')}
      />
    </div>
  );
};

export default Meeting;