import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface AIChatAssistantProps {
  transcript: string[];
  onResponse: (response: string) => void;
}

const AIChatAssistant = ({ transcript, onResponse }: AIChatAssistantProps) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendQuery = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    try {
      // TODO: Integrate with actual AI service
      // For now, simulate AI responses
      const context = transcript.join('\n');
      console.log('Processing AI query with context:', context);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = `Here's what I found based on the meeting context:\n${query}`;
      
      onResponse(response);
      setQuery('');
      
      toast({
        title: "AI Response Generated",
        description: "The AI assistant has processed your query.",
      });
    } catch (error) {
      console.error('Error processing AI query:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your query. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Bot className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">AI Assistant</span>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Ask about the meeting..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendQuery();
            }
          }}
          disabled={isProcessing}
        />
        <Button 
          onClick={handleSendQuery}
          disabled={isProcessing}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AIChatAssistant;