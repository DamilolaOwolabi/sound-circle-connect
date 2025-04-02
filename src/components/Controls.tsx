
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  PhoneOff, 
  Monitor, 
  Grid, 
  Maximize2,
  Circle,
  Square,
  MessageCircle,
  Share,
  Settings,
  Image
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import BackgroundSelector from './BackgroundSelector';
import VideoSettings from './VideoSettings';
import ChatPanel from './ChatPanel';
import QualitySelector from './QualitySelector';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ControlsProps {
  isAudioOn: boolean;
  isVideoOn: boolean;
  isRecording: boolean;
  isScreenSharing: boolean;
  layout: 'grid' | 'spotlight';
  stream: MediaStream | null;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onToggleLayout: () => void;
  onSelectBackground: (background: { id: string; url?: string; type?: string }) => void;
  onDeviceChange: (audioDeviceId: string, videoDeviceId: string) => void;
  onQualityChange?: (quality: 'low' | 'medium' | 'high' | 'hd') => void;
  onLeave: () => void;
  onChangeMeetingBackground?: (background: { id: string; url: string }) => void;
  meetingBackgrounds?: { id: string; url: string }[];
  currentMeetingBackground?: { id: string; url: string };
}

const Controls = ({
  isAudioOn,
  isVideoOn,
  isRecording,
  isScreenSharing,
  layout,
  stream,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onToggleLayout,
  onSelectBackground,
  onDeviceChange,
  onQualityChange,
  onLeave,
  onChangeMeetingBackground,
  meetingBackgrounds = [],
  currentMeetingBackground
}: ControlsProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showQualitySettings, setShowQualitySettings] = useState(false);

  const handleVideoToggle = async () => {
    try {
      await onToggleVideo();
    } catch (error) {
      console.error('Failed to toggle video:', error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Failed to access camera. Please check your permissions and try again.",
      });
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/95 backdrop-blur-sm p-4 rounded-full shadow-lg">
        <Button
          variant={isAudioOn ? "outline" : "destructive"}
          size="icon"
          onClick={onToggleAudio}
          className="relative"
        >
          {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        
        <Button
          variant={isVideoOn ? "outline" : "destructive"}
          size="icon"
          onClick={handleVideoToggle}
          className="relative"
        >
          {isVideoOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>

        <Button
          variant={isScreenSharing ? "secondary" : "outline"}
          size="icon"
          onClick={onToggleScreenShare}
        >
          <Monitor className="w-4 h-4" />
        </Button>

        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          onClick={onToggleRecording}
        >
          {isRecording ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4 fill-current" />}
        </Button>

        <BackgroundSelector onSelectBackground={onSelectBackground} />
        
        {onChangeMeetingBackground && meetingBackgrounds.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Image className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Room Background</h3>
                <div className="grid grid-cols-2 gap-2">
                  {meetingBackgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      className={`relative rounded-md overflow-hidden h-16 border-2 ${
                        currentMeetingBackground?.id === bg.id
                          ? 'border-primary'
                          : 'border-transparent hover:border-muted'
                      }`}
                      onClick={() => {
                        onChangeMeetingBackground(bg);
                        toast({
                          title: "Room Background Updated",
                          description: `Background changed to ${bg.id}`,
                        });
                      }}
                    >
                      <img 
                        src={bg.url} 
                        alt={bg.id} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowQualitySettings(true)}
        >
          <Settings className="w-4 h-4" />
        </Button>

        <VideoSettings stream={stream} onDeviceChange={onDeviceChange} />
        
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleLayout}
        >
          {layout === 'grid' ? <Maximize2 className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageCircle className="w-4 h-4" />
        </Button>

        <Button variant="destructive" size="icon" onClick={onLeave}>
          <PhoneOff className="w-4 h-4" />
        </Button>
      </div>

      <ChatPanel 
        participants={[{ id: 'local', name: 'You' }]} 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <QualitySelector
        isOpen={showQualitySettings}
        onClose={() => setShowQualitySettings(false)}
        onQualityChange={onQualityChange}
      />
    </>
  );
};

export default Controls;
