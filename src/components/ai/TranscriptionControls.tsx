import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface TranscriptionControlsProps {
  isTranscribing: boolean;
  stream: MediaStream | null;
  onStartTranscription: () => void;
  onStopTranscription: () => void;
}

const TranscriptionControls = ({
  isTranscribing,
  stream,
  onStartTranscription,
  onStopTranscription,
}: TranscriptionControlsProps) => {
  const handleTranscriptionToggle = () => {
    if (!stream) {
      toast({
        variant: "destructive",
        title: "No Audio Stream",
        description: "Please enable your microphone to use AI transcription.",
      });
      return;
    }

    if (isTranscribing) {
      onStopTranscription();
    } else {
      onStartTranscription();
    }
  };

  return (
    <Button
      variant={isTranscribing ? "destructive" : "default"}
      className="w-full"
      onClick={handleTranscriptionToggle}
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      {isTranscribing ? "Stop Transcription" : "Start Transcription"}
    </Button>
  );
};

export default TranscriptionControls;