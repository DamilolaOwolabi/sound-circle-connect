
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoDisplay from './VideoDisplay';
import { cn } from '@/lib/utils';

interface SelfViewProps {
  stream: MediaStream | null;
  isAudioOn: boolean;
  isVideoOn: boolean;
}

const SelfView = ({ stream, isAudioOn, isVideoOn }: SelfViewProps) => {
  const [visible, setVisible] = useState(true);
  const [initiallyRendered, setInitiallyRendered] = useState(false);

  useEffect(() => {
    // Mark as rendered after first mount
    setInitiallyRendered(true);
  }, []);

  const toggleVisibility = () => {
    setVisible(prev => !prev);
  };

  // Let's log the stream state to help with debugging
  useEffect(() => {
    if (stream) {
      console.log('SelfView stream:', stream.id, 'Video tracks:', stream.getVideoTracks().length);
    } else {
      console.log('SelfView: No stream available');
    }
  }, [stream]);

  if (!initiallyRendered && !stream) {
    return null;
  }

  return (
    <div 
      className={cn(
        "self-view-container fixed bottom-24 right-6 z-10 transition-all duration-300 ease-in-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      )}
    >
      <div className="relative">
        <div className={cn(
          "rounded-lg overflow-hidden shadow-lg border border-muted",
          !isVideoOn && "bg-muted",
          visible ? "w-48 h-28" : "w-0 h-0"
        )}>
          {visible && (
            <VideoDisplay
              stream={stream}
              isVideoOn={isVideoOn}
              isScreenShare={false}
              isAudioOn={false} // Always mute self-view
              className="rounded-lg w-full h-full"
            />
          )}
          {!isVideoOn && visible && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-lg font-semibold">
                  Y
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <VideoOff className="w-3 h-3" /> Camera off
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleVisibility}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background shadow-md border border-muted"
        >
          {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </Button>
      </div>
    </div>
  );
};

export default SelfView;
