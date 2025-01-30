import React from 'react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'gif' | 'meme' | 'ai';
  reactions: { [key: string]: string[] };
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface ChatMessageProps {
  message: Message;
  onReaction: (messageId: string, emoji: string) => void;
}

const ChatMessage = ({ message, onReaction }: ChatMessageProps) => {
  return (
    <div className="group">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium">{message.sender}</p>
          {message.type === 'text' || message.type === 'ai' ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <img 
              src={message.content} 
              alt="Media content"
              className="rounded-md max-w-full h-auto" 
            />
          )}
        </div>
      </div>
      
      <div className="mt-1 flex flex-wrap gap-1">
        {Object.entries(message.reactions).map(([emoji, users]) => (
          <div 
            key={emoji}
            className="text-xs bg-muted px-1.5 py-0.5 rounded-full"
          >
            {emoji} {users.length}
          </div>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-1">
            {REACTION_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => onReaction(message.id, emoji)}
                className="text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChatMessage;