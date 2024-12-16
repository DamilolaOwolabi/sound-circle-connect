import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Controls from '@/components/Controls';
import ParticipantsList from '@/components/ParticipantsList';
import ParticipantsGrid from '@/components/ParticipantsGrid';
import RadiusControl from '@/components/RadiusControl';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useRecording } from '@/hooks/useRecording';
import { toast } from '@/components/ui/use-toast';

const MIN_RADIUS = 30;
const MAX_RADIUS = 200;

const MOCK_PARTICIPANTS = [
  { id: '2', name: 'John Doe', isAudioOn: true, isVideoOn: false, radiusSize: 70 },
  { id: '3', name: 'Jane Smith', isAudioOn: false, isVideoOn: true, radiusSize: 30 },
  { id: '4', name: 'Alice Johnson', isAudioOn: true, isVideoOn: true, radiusSize: 60 },
];

const Meeting = () => {
  const [layout, setLayout] = useState<'grid' | 'spotlight'>('grid');
  const [radiusSize, setRadiusSize] = useState(50);
  const [background, setBackground] = useState<{ id: string; url?: string; type?: string } | null>(null);
  const location = useLocation();
  const isHost = location.state?.isHost;

  const {
    stream,
    screenStream,
    isAudioOn,
    isVideoOn,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } = useMediaStream();

  const { isRecording, toggleRecording } = useRecording(stream);

  const handleRadiusChange = (value: number[]) => {
    setRadiusSize(value[0]);
    console.log('Radius size changed to:', value[0]);
  };

  const toggleLayout = () => {
    setLayout(prev => prev === 'grid' ? 'spotlight' : 'grid');
    console.log('Layout changed to:', layout === 'grid' ? 'spotlight' : 'grid');
  };

  const handleBackgroundSelect = (newBackground: { id: string; url?: string; type?: string }) => {
    console.log('Setting new background:', newBackground);
    setBackground(newBackground);
    toast({
      title: "Background Updated",
      description: `Background has been changed to ${newBackground.id}`,
    });
  };

  console.log('Meeting role:', isHost ? 'Host' : 'Participant');
  console.log('Audio state:', isAudioOn);
  console.log('Video state:', isVideoOn);
  console.log('Current background:', background);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex gap-6">
        <ParticipantsGrid
          layout={layout}
          localUser={{
            isAudioOn,
            isVideoOn,
            radiusSize,
            stream,
            screenStream,
            background
          }}
          mockParticipants={MOCK_PARTICIPANTS}
        />
        <div className="flex flex-col gap-4">
          <ParticipantsList participants={MOCK_PARTICIPANTS} />
          <RadiusControl
            radiusSize={radiusSize}
            onRadiusChange={handleRadiusChange}
            minRadius={MIN_RADIUS}
            maxRadius={MAX_RADIUS}
          />
        </div>
      </div>
      <Controls
        isAudioOn={isAudioOn}
        isVideoOn={isVideoOn}
        isRecording={isRecording}
        isScreenSharing={isScreenSharing}
        layout={layout}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleRecording={toggleRecording}
        onToggleLayout={toggleLayout}
        onSelectBackground={handleBackgroundSelect}
        onLeave={() => console.log('Leave meeting')}
      />
    </div>
  );
};

export default Meeting;