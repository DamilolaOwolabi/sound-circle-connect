import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Brain, Mic, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AITranscriptionPanelProps {
  stream: MediaStream | null;
  onTranscriptionUpdate: (text: string) => void;
}

const AITranscriptionPanel = ({ stream, onTranscriptionUpdate }: AITranscriptionPanelProps) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);

  const startTranscription = async () => {
    if (!stream) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No audio stream available for transcription.",
      });
      return;
    }

    try {
      setIsTranscribing(true);
      // TODO: Implement actual transcription service
      console.log('Starting transcription service');
      toast({
        title: "Transcription Started",
        description: "Live transcription is now active.",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start transcription.",
      });
    }
  };

  const stopTranscription = () => {
    setIsTranscribing(false);
    console.log('Stopping transcription service');
    toast({
      title: "Transcription Stopped",
      description: "Live transcription has been stopped.",
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          <h3 className="text-lg font-semibold">AI Transcription</h3>
        </div>
        <Button
          variant={isTranscribing ? "destructive" : "outline"}
          size="sm"
          onClick={isTranscribing ? stopTranscription : startTranscription}
        >
          {isTranscribing ? (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        {transcript.map((text, index) => (
          <p key={index} className="text-sm mb-2">
            {text}
          </p>
        ))}
      </ScrollArea>
    </div>
  );
};

export default AITranscriptionPanel;