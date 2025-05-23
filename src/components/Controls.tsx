
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
  Settings,
  PanelRight
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import VideoSettings from './VideoSettings';
import ChatPanel from './ChatPanel';
import QualitySelector from './QualitySelector';
import BackgroundSelector, { BackgroundOption } from './BackgroundSelector';

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
  onDeviceChange: (audioDeviceId: string, videoDeviceId: string) => void;
  onQualityChange?: (quality: 'low' | 'medium' | 'high' | 'hd') => void;
  onLeave: () => void;
  onChangeMeetingBackground?: (background: BackgroundOption) => void;
  meetingBackgrounds?: BackgroundOption[];
  currentMeetingBackground?: BackgroundOption;
  onTogglePanels: () => void;
  isPanelsVisible: boolean;
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
  onDeviceChange,
  onQualityChange,
  onLeave,
  onChangeMeetingBackground,
  meetingBackgrounds = [],
  currentMeetingBackground,
  onTogglePanels,
  isPanelsVisible
}: ControlsProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showQualitySettings, setShowQualitySettings] = useState(false);
  const [isTogglingVideo, setIsTogglingVideo] = useState(false);

  const handleVideoToggle = async () => {
    try {
      setIsTogglingVideo(true);
      await onToggleVideo();
    } catch (error) {
      console.error('Failed to toggle video:', error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Failed to access camera. Please check your permissions and try again.",
      });
    } finally {
      setIsTogglingVideo(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#9b87f5]/90 backdrop-blur-sm p-4 rounded-full shadow-lg border border-[#a394f8]/50">
        <Button
          variant={isAudioOn ? "outline" : "destructive"}
          size="icon"
          onClick={onToggleAudio}
          className="relative bg-white/20 hover:bg-white/30 text-white border-[#d6bcfa]/30"
        >
          {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        
        <Button
          variant={isVideoOn ? "outline" : "destructive"}
          size="icon"
          onClick={handleVideoToggle}
          disabled={isTogglingVideo}
          className="relative bg-white/20 hover:bg-white/30 text-white border-[#d6bcfa]/30"
        >
          {isTogglingVideo ? (
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
          ) : (
            isVideoOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant={isScreenSharing ? "secondary" : "outline"}
          size="icon"
          onClick={onToggleScreenShare}
          className={isScreenSharing ? "bg-white/40 text-[#472cb1] border-[#d6bcfa]" : "bg-white/20 hover:bg-white/30 text-white border-[#d6bcfa]/30"}
        >
          <Monitor className="w-4 h-4" />
        </Button>

        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          onClick={onToggleRecording}
          className={isRecording ? "" : "bg-white/20 hover:bg-white/30 text-white border-[#d6bcfa]/30"}
        >
          {isRecording ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4 fill-current" />}
        </Button>
        
        {onChangeMeetingBackground && meetingBackgrounds.length > 0 && currentMeetingBackground && (
          <BackgroundSelector 
            currentBackground={currentMeetingBackground}
            backgrounds={meetingBackgrounds}
            onBackgroundChange={onChangeMeetingBackground}
          />
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowQualitySettings(true)}
          className="bg-white/20 hover:bg-white/30 text-white border-[#d6bcfa]/30"
        >
          <Settings className="w-4 h-4" />
        </Button>

        <VideoSettings 
          stream={stream} 
          onDeviceChange={onDeviceChange}
          className="bg-white/20 hover:bg-white/30 text-white border-[#d6bcfa]/30" 
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleLayout}
          className="bg-white/20 hover:bg-white/30 text-white border-[#d6bcfa]/30"
        >
          {layout === 'grid' ? <Maximize2 className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsChatOpen(true)}
          className="bg-white/20 hover:bg-white/30 text-white border-[#d6bcfa]/30"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>

        <Button
          variant={isPanelsVisible ? "secondary" : "outline"}
          size="icon"
          onClick={onTogglePanels}
          className={isPanelsVisible 
            ? "bg-white/40 text-[#472cb1] border-[#d6bcfa]" 
            : "bg-white/20 hover:bg-white/30 text-white border-[#d6bcfa]/30"
          }
          title={isPanelsVisible ? "Hide side panels" : "Show side panels"}
        >
          <PanelRight className="w-4 h-4" />
        </Button>

        <Button 
          variant="destructive" 
          size="icon" 
          onClick={onLeave}
          className="bg-destructive hover:bg-destructive/90"
        >
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
