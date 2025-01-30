import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface AIChatProps {
  onSendMessage: (message: string) => void;
}

const AIChat = ({ onSendMessage }: AIChatProps) => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      // Send user message
      onSendMessage(message);
      
      // TODO: Integrate with actual AI service
      const aiResponse = "I'm here to help! (AI response placeholder)";
      
      // Send AI response
      onSendMessage(aiResponse);
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message to AI:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI response. Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center gap-2 p-2">
      <Bot className="w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Ask AI assistant..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSendMessage();
          }
        }}
      />
      <Button size="icon" onClick={handleSendMessage}>
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default AIChat;