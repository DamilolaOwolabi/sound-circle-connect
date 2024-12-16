import React, { useEffect, useState } from 'react';
import ParticipantTile from '@/components/ParticipantTile';
import Controls from '@/components/Controls';
import ParticipantsList from '@/components/ParticipantsList';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Slider } from '@/components/ui/slider';
import { useRecording } from '@/hooks/useRecording';

const MOCK_PARTICIPANTS = [
  { id: '2', name: 'John Doe', isAudioOn: true, isVideoOn: false, radiusSize: 70 },
  { id: '3', name: 'Jane Smith', isAudioOn: false, isVideoOn: true, radiusSize: 30 },
  { id: '4', name: 'Alice Johnson', isAudioOn: true, isVideoOn: true, radiusSize: 60 },
];

const MIN_RADIUS = 30;
const MAX_RADIUS = 200;

const Meeting = () => {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'spotlight'>('grid');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [radiusSize, setRadiusSize] = useState(50);
  const location = useLocation();
  const isHost = location.state?.isHost;
  const { toast } = useToast();
  const { isRecording, toggleRecording } = useRecording(stream);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        
        mediaStream.getAudioTracks().forEach(track => {
          track.enabled = isAudioOn;
        });
        mediaStream.getVideoTracks().forEach(track => {
          track.enabled = isVideoOn;
        });
        
        console.log('Media stream obtained successfully');
        setStream(mediaStream);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast({
          variant: "destructive",
          title: "Media Access Error",
          description: "Unable to access camera or microphone. Please check your permissions.",
        });
      }
    };

    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped ${track.kind} track`);
        });
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isAudioOn;
        console.log(`Audio track ${track.label} enabled: ${!isAudioOn}`);
      });
      setIsAudioOn(!isAudioOn);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
        console.log(`Video track ${track.label} enabled: ${!isVideoOn}`);
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        setScreenStream(displayStream);
        setIsScreenSharing(true);
        toast({
          title: "Screen Sharing Started",
          description: "You are now sharing your screen.",
        });
      } else {
        screenStream?.getTracks().forEach(track => track.stop());
        setScreenStream(null);
        setIsScreenSharing(false);
        toast({
          title: "Screen Sharing Stopped",
          description: "You have stopped sharing your screen.",
        });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        variant: "destructive",
        title: "Screen Sharing Error",
        description: "Unable to share screen. Please check your permissions.",
      });
    }
  };

  const toggleLayout = () => {
    setLayout(prev => prev === 'grid' ? 'spotlight' : 'grid');
    console.log('Layout changed to:', layout === 'grid' ? 'spotlight' : 'grid');
  };

  const handleRadiusChange = (value: number[]) => {
    setRadiusSize(value[0]);
    console.log('Radius size changed to:', value[0]);
  };

  console.log('Meeting role:', isHost ? 'Host' : 'Participant');
  console.log('Audio state:', isAudioOn);
  console.log('Video state:', isVideoOn);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex gap-6">
        <div className={`flex-1 relative min-h-[600px] ${layout === 'grid' ? 'grid grid-cols-3 gap-4' : 'flex justify-center'}`}>
          <ParticipantTile
            key="local-user"
            name="You"
            isAudioOn={isAudioOn}
            isVideoOn={isVideoOn}
            radiusSize={radiusSize}
            className={layout === 'grid' ? '' : 'w-full max-w-2xl'}
            stream={isScreenSharing ? screenStream : stream}
          />
          {MOCK_PARTICIPANTS.map((participant) => (
            <ParticipantTile
              key={participant.id}
              name={participant.name}
              isAudioOn={participant.isAudioOn}
              isVideoOn={participant.isVideoOn}
              radiusSize={participant.radiusSize}
              className={layout === 'grid' ? '' : 'hidden'}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <ParticipantsList participants={MOCK_PARTICIPANTS} />
          <div className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-2">Proximity Range</h3>
            <Slider
              defaultValue={[radiusSize]}
              max={MAX_RADIUS}
              min={MIN_RADIUS}
              step={1}
              onValueChange={handleRadiusChange}
              className="w-48"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Range: {radiusSize}px
            </p>
          </div>
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
        onLeave={() => console.log('Leave meeting')}
      />
    </div>
  );
};

export default Meeting;
