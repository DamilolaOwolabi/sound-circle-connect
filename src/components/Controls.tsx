import React from 'react';
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
  Square 
} from 'lucide-react';

interface ControlsProps {
  isAudioOn: boolean;
  isVideoOn: boolean;
  isRecording: boolean;
  isScreenSharing: boolean;
  layout: 'grid' | 'spotlight';
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onToggleLayout: () => void;
  onLeave: () => void;
}

const Controls = ({
  isAudioOn,
  isVideoOn,
  isRecording,
  isScreenSharing,
  layout,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onToggleLayout,
  onLeave
}: ControlsProps) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/95 backdrop-blur-sm p-4 rounded-full shadow-lg">
      <Button
        variant={isAudioOn ? "outline" : "destructive"}
        size="icon"
        onClick={onToggleAudio}
      >
        {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </Button>
      <Button
        variant={isVideoOn ? "outline" : "destructive"}
        size="icon"
        onClick={onToggleVideo}
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
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleLayout}
      >
        {layout === 'grid' ? <Maximize2 className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
      </Button>
      <Button variant="destructive" size="icon" onClick={onLeave}>
        <PhoneOff className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Controls;