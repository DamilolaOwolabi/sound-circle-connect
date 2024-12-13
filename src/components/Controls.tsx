import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface ControlsProps {
  isAudioOn: boolean;
  isVideoOn: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
}

const Controls = ({
  isAudioOn,
  isVideoOn,
  onToggleAudio,
  onToggleVideo,
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
        {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
      </Button>
      <Button variant="destructive" size="icon" onClick={onLeave}>
        <PhoneOff className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Controls;