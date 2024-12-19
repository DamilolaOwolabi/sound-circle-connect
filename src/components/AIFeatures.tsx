import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SpeechRecognitionService } from '@/utils/speechUtils';

interface AIFeaturesProps {
  stream: MediaStream | null;
}

const AIFeatures = ({ stream }: AIFeaturesProps) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const speechServiceRef = useRef<SpeechRecognitionService | null>(null);

  useEffect(() => {
    speechServiceRef.current = new SpeechRecognitionService((text) => {
      setTranscript(prev => [...prev, text]);
    });

    return () => {
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
      }
    };
  }, []);

  const startTranscription = async () => {
    if (!stream) {
      toast({
        variant: "destructive",
        title: "No Audio Stream",
        description: "Please enable your microphone to use AI transcription.",
      });
      return;
    }

    try {
      setIsTranscribing(true);
      speechServiceRef.current?.start();
      console.log('Starting AI transcription...');
      toast({
        title: "AI Transcription Started",
        description: "Your meeting is now being transcribed in real-time.",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        variant: "destructive",
        title: "Transcription Error",
        description: "Failed to start transcription. Please try again.",
      });
    }
  };

  const stopTranscription = () => {
    speechServiceRef.current?.stop();
    setIsTranscribing(false);
    console.log('Stopping AI transcription...');
    toast({
      title: "AI Transcription Stopped",
      description: "Transcription has been stopped.",
    });
  };

  const generateSummary = async () => {
    if (transcript.length === 0) {
      toast({
        variant: "destructive",
        title: "No Transcript Available",
        description: "Start transcription first to generate a meeting summary.",
      });
      return;
    }

    try {
      console.log('Generating meeting summary...');
      toast({
        title: "Generating Summary",
        description: "AI is analyzing your meeting transcript...",
      });

      // Here we'll need to integrate with OpenAI for summary generation
      // For now, we'll show a placeholder message
      setTranscript(prev => [...prev, "\n=== Meeting Summary ===\nKey points discussed during the meeting..."]);
      
    } catch (error) {
      console.error('Summary generation error:', error);
      toast({
        variant: "destructive",
        title: "Summary Error",
        description: "Failed to generate meeting summary. Please try again.",
      });
    }
  };

  return (
    <div className="w-80 bg-background border rounded-lg p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <Brain className="w-5 h-5 text-primary" />
      </div>
      
      <div className="space-y-2">
        <Button
          variant={isTranscribing ? "destructive" : "default"}
          className="w-full"
          onClick={isTranscribing ? stopTranscription : startTranscription}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {isTranscribing ? "Stop Transcription" : "Start Transcription"}
        </Button>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={generateSummary}
          disabled={transcript.length === 0}
        >
          Generate Summary
        </Button>
      </div>

      <ScrollArea className="h-[200px] rounded-md border p-2">
        <div className="space-y-2">
          {transcript.map((text, index) => (
            <p key={index} className="text-sm whitespace-pre-wrap">{text}</p>
          ))}
          {transcript.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Transcription will appear here...
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AIFeatures;