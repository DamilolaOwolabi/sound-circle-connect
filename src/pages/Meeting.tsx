import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Controls from '@/components/Controls';
import ParticipantsList from '@/components/ParticipantsList';
import ParticipantsGrid from '@/components/ParticipantsGrid';
import RadiusControl from '@/components/RadiusControl';
import AIFeatures from '@/components/AIFeatures';
import HostControls from '@/components/HostControls';
import MeetingInvite from '@/components/MeetingInvite';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useRecording } from '@/hooks/useRecording';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';

// Constants
const MIN_RADIUS = 30;
const MAX_RADIUS = Math.min(window.innerWidth, window.innerHeight) / 2;

const MOCK_PARTICIPANTS = [
  { id: '2', name: 'John Doe', isAudioOn: true, isVideoOn: false, radiusSize: 70 },
  { id: '3', name: 'Jane Smith', isAudioOn: false, isVideoOn: true, radiusSize: 30 },
  { id: '4', name: 'Alice Johnson', isAudioOn: true, isVideoOn: true, radiusSize: 60 },
];

const Meeting = () => {
  const [layout, setLayout] = useState<'grid' | 'spotlight'>('grid');
  const [radiusSize, setRadiusSize] = useState(50);
  const [maxRadius, setMaxRadius] = useState(MAX_RADIUS);
  const [background, setBackground] = useState<{ id: string; url?: string; type?: string } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHost = location.state?.isHost;
  const [meetingId] = useState(() => location.state?.meetingId || crypto.randomUUID());
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS);

  useEffect(() => {
    const handleResize = () => {
      const newMaxRadius = Math.min(window.innerWidth, window.innerHeight) / 2;
      setMaxRadius(newMaxRadius);
      // Adjust current radius if it exceeds new max
      if (radiusSize > newMaxRadius) {
        setRadiusSize(newMaxRadius);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [radiusSize]);

  const {
    stream,
    screenStream,
    isAudioOn,
    isVideoOn,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    handleDeviceChange,
    handleQualityChange,
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

  const handleShareInvite = async () => {
    const inviteLink = `${window.location.origin}/meeting?id=${meetingId}`;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Invite Link Copied!",
        description: "The meeting invite link has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy invite link:', err);
      toast({
        variant: "destructive",
        title: "Failed to Copy",
        description: "Could not copy the invite link. Please try again.",
      });
    }
  };

  useEffect(() => {
    // Handle joining via invite link
    const params = new URLSearchParams(location.search);
    const inviteMeetingId = params.get('id');
    
    if (inviteMeetingId) {
      console.log('Joining meeting via invite link:', inviteMeetingId);
      // You can add additional logic here for joining via invite
    }
  }, [location]);

  const handleMuteAll = () => {
    setParticipants(prev => 
      prev.map(p => ({ ...p, isAudioOn: false }))
    );
    console.log('All participants muted');
    toast({
      title: "All Participants Muted",
      description: "All participants have been muted by the host.",
    });
  };

  const handleDisableAllVideos = () => {
    setParticipants(prev => 
      prev.map(p => ({ ...p, isVideoOn: false }))
    );
    console.log('All participant videos disabled');
    toast({
      title: "All Videos Disabled",
      description: "All participant videos have been disabled by the host.",
    });
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(prev => 
      prev.filter(p => p.id !== id)
    );
    console.log('Participant removed:', id);
    toast({
      title: "Participant Removed",
      description: "The participant has been removed from the meeting.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/efac273c-f666-48c6-aa08-e42558a7b939.png" 
            alt="SoundRadius Logo" 
            className="h-8 w-auto"
          />
          <h1 className="text-2xl font-bold text-primary">Meeting Room</h1>
        </div>
        {isHost && (
          <MeetingInvite meetingId={meetingId} isHost={isHost} />
        )}
      </div>
      
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
          mockParticipants={participants}
        />
        <div className="flex flex-col gap-4">
          <ParticipantsList participants={participants} />
          <RadiusControl
            radiusSize={radiusSize}
            onRadiusChange={handleRadiusChange}
            minRadius={MIN_RADIUS}
            maxRadius={maxRadius}
          />
          <AIFeatures stream={stream} />
          {isHost && (
            <HostControls
              participants={participants}
              onMuteAll={handleMuteAll}
              onDisableAllVideos={handleDisableAllVideos}
              onRemoveParticipant={handleRemoveParticipant}
            />
          )}
        </div>
      </div>
      <Controls
        isAudioOn={isAudioOn}
        isVideoOn={isVideoOn}
        isRecording={isRecording}
        isScreenSharing={isScreenSharing}
        layout={layout}
        stream={stream}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleRecording={toggleRecording}
        onToggleLayout={toggleLayout}
        onSelectBackground={handleBackgroundSelect}
        onDeviceChange={handleDeviceChange}
        onQualityChange={handleQualityChange}
        onLeave={() => navigate('/')}
      />
    </div>
  );
};

export default Meeting;