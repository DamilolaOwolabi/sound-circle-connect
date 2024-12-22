import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'gif' | 'meme';
  reactions: { [key: string]: string[] };
}

interface ChatPanelProps {
  participants: { id: string; name: string }[];
  isOpen: boolean;
  onClose: () => void;
}

const ChatPanel = ({ participants, isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (content: string, type: 'text' | 'gif' | 'meme' = 'text') => {
    const newMsg: Message = {
      id: crypto.randomUUID(),
      sender: 'You',
      content,
      timestamp: new Date(),
      type,
      reactions: {},
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        if (!reactions[emoji]) reactions[emoji] = [];
        if (!reactions[emoji].includes('You')) {
          reactions[emoji] = [...reactions[emoji], 'You'];
        }
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onReaction={addReaction}
                />
              ))}
            </div>
          </ScrollArea>

          <ChatInput onSendMessage={addMessage} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatPanel;