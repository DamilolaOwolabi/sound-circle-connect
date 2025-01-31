import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptDisplayProps {
  transcript: string[];
}

const TranscriptDisplay = ({ transcript }: TranscriptDisplayProps) => {
  return (
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
  );
};

export default TranscriptDisplay;