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
import { useWebRTC } from '@/hooks/useWebRTC';
import { toast } from '@/components/ui/use-toast';
import ResponsiveImage from '@/components/ResponsiveImage';
import { BackgroundOption } from '@/components/BackgroundSelector';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MIN_RADIUS = 30;
const MAX_RADIUS = Math.min(window.innerWidth, window.innerHeight) / 2;

const MOCK_PARTICIPANTS = [
  { id: '2', name: 'John Doe', isAudioOn: true, isVideoOn: false, radiusSize: 70 },
  { id: '3', name: 'Jane Smith', isAudioOn: false, isVideoOn: true, radiusSize: 30 },
  { id: '4', name: 'Alice Johnson', isAudioOn: true, isVideoOn: true, radiusSize: 60 },
];

const BACKGROUND_COLORS: BackgroundOption[] = [
  { id: 'primary-purple', type: 'color', value: '#9b87f5' },
  { id: 'secondary-purple', type: 'color', value: '#7E69AB' },
  { id: 'tertiary-purple', type: 'color', value: '#6E59A5' },
  { id: 'dark-purple', type: 'color', value: '#1A1F2C' },
  { id: 'light-purple', type: 'color', value: '#D6BCFA' },
  { id: 'dark-gray', type: 'color', value: '#2D3748' },
  { id: 'gradient-1', type: 'color', value: 'linear-gradient(135deg, #9b87f5 0%, #D6BCFA 100%)' },
  { id: 'gradient-2', type: 'color', value: 'linear-gradient(135deg, #6E59A5 0%, #9b87f5 100%)' },
];

const BACKGROUND_IMAGES: BackgroundOption[] = [
  { 
    id: 'mountains', 
    type: 'image', 
    value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=1920&h=1080&q=80' 
  },
  { 
    id: 'forest', 
    type: 'image', 
    value: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?fit=crop&w=1920&h=1080&q=80' 
  },
  { 
    id: 'abstract', 
    type: 'image', 
    value: 'https://images.unsplash.com/photo-1614850523060-8da1d56ae167?fit=crop&w=1920&h=1080&q=80' 
  },
  { 
    id: 'night-sky', 
    type: 'image', 
    value: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?fit=crop&w=1920&h=1080&q=80' 
  },
  { 
    id: 'green-mountains', 
    type: 'image', 
    value: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?fit=crop&w=1920&h=1080&q=80' 
  },
  { 
    id: 'office', 
    type: 'image', 
    value: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?fit=crop&w=1920&h=1080&q=80' 
  },
];

const ALL_BACKGROUND_OPTIONS: BackgroundOption[] = [
  ...BACKGROUND_COLORS,
  ...BACKGROUND_IMAGES
];

const Meeting = () => {
  const [layout, setLayout] = useState<'grid' | 'spotlight'>('grid');
  const [radiusSize, setRadiusSize] = useState(50);
  const [maxRadius, setMaxRadius] = useState(MAX_RADIUS);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [meetingBackground, setMeetingBackground] = useState<BackgroundOption>(BACKGROUND_COLORS[0]);
  const [isPanelsVisible, setIsPanelsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('participants');
  
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
  
  const {
    isConnected,
    isConnecting,
    remoteParticipants,
    connect: connectToMeeting,
    disconnect: disconnectFromMeeting
  } = useWebRTC({
    meetingId,
    userName: "You",
    stream
  });

  useEffect(() => {
    if (stream && !isConnected && !isConnecting) {
      connectToMeeting();
    }
  }, [stream, isConnected, isConnecting, connectToMeeting]);
  
  const remoteParticipantsData = remoteParticipants.map(p => ({
    id: p.id,
    name: p.name,
    isAudioOn: p.isAudioOn,
    isVideoOn: p.isVideoOn,
    radiusSize: p.radiusSize,
    stream: p.stream
  }));

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

  const togglePanels = () => {
    setIsPanelsVisible(prev => !prev);
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

  const getBackgroundStyle = () => {
    if (meetingBackground.type === 'color') {
      return { background: meetingBackground.value };
    } else {
      return {
        backgroundImage: `url(${meetingBackground.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
  };

  const handleChangeMeetingBackground = (background: BackgroundOption) => {
    setMeetingBackground(background);
    toast({
      title: "Background Changed",
      description: `Meeting background updated to ${background.id}`,
    });
  };
  
  const handleLeave = () => {
    disconnectFromMeeting();
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen bg-background p-6 meeting-room-container"
      style={getBackgroundStyle()}
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
            {isConnecting && <span className="text-muted-foreground animate-pulse">Connecting...</span>}
            {isConnected && <span className="text-green-500">Connected</span>}
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
                background: meetingBackground
              }}
              mockParticipants={participants}
              remoteParticipants={remoteParticipantsData}
            />
          </div>
          
          <Sheet open={isPanelsVisible} onOpenChange={setIsPanelsVisible}>
            <SheetContent className="w-[350px] sm:w-[400px] p-0" forceMount>
              <div className="h-full py-2">
                <Tabs 
                  defaultValue="participants" 
                  value={activeTab}
                  onValueChange={setActiveTab} 
                  className="h-full flex flex-col"
                >
                  <TabsList className="grid grid-cols-4 mx-4">
                    <TabsTrigger value="participants">People</TabsTrigger>
                    <TabsTrigger value="radius">Radius</TabsTrigger>
                    <TabsTrigger value="ai">AI</TabsTrigger>
                    {isHost && <TabsTrigger value="host">Host</TabsTrigger>}
                  </TabsList>
                  
                  <div className="p-4 flex-1 overflow-auto">
                    <TabsContent value="participants" className="mt-0 h-full">
                      <ParticipantsList 
                        participants={[
                          ...participants, 
                          ...remoteParticipantsData
                        ]} 
                      />
                    </TabsContent>

                    <TabsContent value="radius" className="mt-0 h-full">
                      <RadiusControl
                        radiusSize={radiusSize}
                        onRadiusChange={handleRadiusChange}
                        minRadius={MIN_RADIUS}
                        maxRadius={maxRadius}
                      />
                    </TabsContent>

                    <TabsContent value="ai" className="mt-0 h-full space-y-4">
                      <AIFeatures stream={stream} />
                      <AITranscriptionPanel
                        stream={stream}
                        onTranscriptionUpdate={handleTranscriptionUpdate}
                      />
                      <AIMeetingAssistant
                        transcript={aiTranscript}
                        onResponse={handleAIResponse}
                      />
                    </TabsContent>

                    {isHost && (
                      <TabsContent value="host" className="mt-0 h-full space-y-4">
                        <HostControlPanel
                          participants={[...participants, ...remoteParticipantsData]}
                          onMuteAll={handleMuteAll}
                          onDisableAllVideos={handleDisableAllVideos}
                          onRemoveParticipant={handleRemoveParticipant}
                          onInviteParticipant={handleInviteParticipant}
                        />
                        <BreakoutRooms
                          participants={[...participants, ...remoteParticipantsData]}
                          onCreateRoom={handleCreateBreakoutRoom}
                          onDeleteRoom={handleDeleteBreakoutRoom}
                          onAssignParticipant={handleAssignParticipant}
                        />
                      </TabsContent>
                    )}
                  </div>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <SelfView 
          stream={stream}
          isAudioOn={isAudioOn}
          isVideoOn={isVideoOn}
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
          onDeviceChange={handleDeviceChange}
          onQualityChange={handleQualityChange}
          onLeave={handleLeave}
          onChangeMeetingBackground={handleChangeMeetingBackground}
          meetingBackgrounds={ALL_BACKGROUND_OPTIONS}
          currentMeetingBackground={meetingBackground}
          onTogglePanels={togglePanels}
          isPanelsVisible={isPanelsVisible}
        />
      </div>
    </div>
  );
};

export default Meeting;
