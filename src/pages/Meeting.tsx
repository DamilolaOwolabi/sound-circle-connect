import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Controls from '@/components/Controls';
import ParticipantsList from '@/components/ParticipantsList';
import ParticipantsGrid from '@/components/ParticipantsGrid';
import RadiusControl from '@/components/RadiusControl';
import AIFeatures from '@/components/AIFeatures';
import HostControlPanel from '@/components/meeting/HostControlPanel';
import MeetingInvite from '@/components/MeetingInvite';
import AIMeetingAssistant from '@/components/chat/AIMeetingAssistant';
import AITranscriptionPanel from '@/components/meeting/AITranscriptionPanel';
import BreakoutRooms from '@/components/meeting/BreakoutRooms';
import SelfView from '@/components/SelfView';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useRecording } from '@/hooks/useRecording';
import { toast } from '@/components/ui/use-toast';
import ResponsiveImage from '@/components/ResponsiveImage';

const MIN_RADIUS = 30;
const MAX_RADIUS = Math.min(window.innerWidth, window.innerHeight) / 2;

const MOCK_PARTICIPANTS = [
  { id: '2', name: 'John Doe', isAudioOn: true, isVideoOn: false, radiusSize: 70 },
  { id: '3', name: 'Jane Smith', isAudioOn: false, isVideoOn: true, radiusSize: 30 },
  { id: '4', name: 'Alice Johnson', isAudioOn: true, isVideoOn: true, radiusSize: 60 },
];

const BACKGROUND_OPTIONS = [
  { id: 'default', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?fit=crop&w=1920&h=1080&q=80' },
  { id: 'nature', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?fit=crop&w=1920&h=1080&q=80' },
  { id: 'workspace', url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?fit=crop&w=1920&h=1080&q=80' },
];

const Meeting = () => {
  const [layout, setLayout] = useState<'grid' | 'spotlight'>('grid');
  const [radiusSize, setRadiusSize] = useState(50);
  const [maxRadius, setMaxRadius] = useState(MAX_RADIUS);
  const [background, setBackground] = useState<{ id: string; url?: string; type?: string } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [meetingBackground, setMeetingBackground] = useState(BACKGROUND_OPTIONS[0]);
  const location = useLocation();
  const navigate = useNavigate();
  const isHost = location.state?.isHost;
  const [meetingId] = useState(() => location.state?.meetingId || crypto.randomUUID());
  const [meetingName] = useState(() => location.state?.meetingName || 'Untitled Meeting');
  const [password] = useState(() => location.state?.password || '');
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS);
  const [aiTranscript, setAiTranscript] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => {
      const newMaxRadius = Math.min(window.innerWidth, window.innerHeight) / 2;
      setMaxRadius(newMaxRadius);
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

  const handleTranscriptionUpdate = (text: string) => {
    setAiTranscript(prev => [...prev, text]);
    console.log('New transcription:', text);
  };

  const handleCreateBreakoutRoom = (roomName: string) => {
    console.log('Creating breakout room:', roomName);
  };

  const handleDeleteBreakoutRoom = (roomId: string) => {
    console.log('Deleting breakout room:', roomId);
  };

  const handleAssignParticipant = (roomId: string, participantId: string) => {
    console.log('Assigning participant to room:', { roomId, participantId });
  };

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
    const params = new URLSearchParams(location.search);
    const inviteMeetingId = params.get('id');
    const invitePassword = params.get('password');
    
    if (inviteMeetingId) {
      console.log('Joining meeting via invite link:', inviteMeetingId);
      if (password && invitePassword !== password) {
        navigate('/pre-meeting');
        toast({
          variant: "destructive",
          title: "Incorrect Password",
          description: "The password you provided is incorrect.",
        });
      }
    }
  }, [location, navigate, password]);

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

  const handleAIResponse = (response: string) => {
    setAiTranscript(prev => [...prev, response]);
    console.log('New AI response:', response);
  };

  const handleInviteParticipant = () => {
    const inviteLink = `${window.location.origin}/meeting?id=${meetingId}`;
    
    try {
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Invite Link Copied",
        description: "Share this link with participants to join the meeting.",
      });
    } catch (error) {
      console.error('Failed to copy invite link:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy invite link. Please try again.",
      });
    }
  };

  return (
    <div 
      className="min-h-screen bg-background p-6 meeting-room-container"
      style={{
        backgroundImage: `url(${meetingBackground.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="meeting-content-container">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <ResponsiveImage 
              src="/lovable-uploads/efac273c-f666-48c6-aa08-e42558a7b939.png" 
              alt="SoundRadius Logo" 
              className="h-8 w-auto"
              priority={true}
            />
            <h1 className="text-2xl font-bold text-primary">{meetingName}</h1>
          </div>
          {isHost && (
            <MeetingInvite meetingId={meetingId} isHost={isHost} />
          )}
        </div>
        
        <div className="flex gap-6">
          <div className="flex-1">
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
          </div>
          
          <div className="w-96 space-y-4">
            <ParticipantsList participants={participants} />
            <RadiusControl
              radiusSize={radiusSize}
              onRadiusChange={handleRadiusChange}
              minRadius={MIN_RADIUS}
              maxRadius={maxRadius}
            />
            <AIFeatures stream={stream} />
            <AITranscriptionPanel
              stream={stream}
              onTranscriptionUpdate={handleTranscriptionUpdate}
            />
            <AIMeetingAssistant
              transcript={aiTranscript}
              onResponse={handleAIResponse}
            />
            {isHost && (
              <>
                <HostControlPanel
                  participants={participants}
                  onMuteAll={handleMuteAll}
                  onDisableAllVideos={handleDisableAllVideos}
                  onRemoveParticipant={handleRemoveParticipant}
                  onInviteParticipant={handleInviteParticipant}
                />
                <BreakoutRooms
                  participants={participants}
                  onCreateRoom={handleCreateBreakoutRoom}
                  onDeleteRoom={handleDeleteBreakoutRoom}
                  onAssignParticipant={handleAssignParticipant}
                />
              </>
            )}
          </div>
        </div>

        <SelfView 
          stream={stream}
          isAudioOn={isAudioOn}
          isVideoOn={isVideoOn}
          background={background}
        />

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
    </div>
  );
};

export default Meeting;
