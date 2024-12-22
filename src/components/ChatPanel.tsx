import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { 
  MessageCircle, 
  Send, 
  Smile, 
  Image as ImageIcon,
  X 
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Initialize Giphy - in production, you'd want to use an environment variable
const gf = new GiphyFetch('pVF7yJTqxIoHwwTDTFHbIcnKNcnmmY8O');

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
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const MEMES = [
  { url: '/lovable-uploads/c00aba7d-50a8-4993-83f8-139b74804439.png', alt: 'Meme 1' },
  // Add more memes here
];

const ChatPanel = ({ participants }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showGifSearch, setShowGifSearch] = useState(false);
  const [showMemes, setShowMemes] = useState(false);
  const [gifSearchTerm, setGifSearchTerm] = useState('');

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
    setNewMessage('');
    setShowGifSearch(false);
    setShowMemes(false);
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

  const handleGifSelect = async (gif: any) => {
    addMessage(gif.images.original.url, 'gif');
  };

  return (
    <div className="w-80 bg-card rounded-lg shadow-lg flex flex-col h-[600px]">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        <h2 className="font-semibold">Chat</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="group">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{message.sender}</p>
                  {message.type === 'text' ? (
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
                        onClick={() => addReaction(message.id, emoji)}
                        className="text-lg hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2 mb-2">
          <Popover open={showGifSearch} onOpenChange={setShowGifSearch}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <ImageIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <div className="p-2">
                <Input
                  placeholder="Search GIFs..."
                  value={gifSearchTerm}
                  onChange={(e) => setGifSearchTerm(e.target.value)}
                />
              </div>
              <div className="h-[300px] overflow-auto">
                <Grid
                  width={280}
                  columns={2}
                  fetchGifs={(offset: number) => 
                    gf.search(gifSearchTerm || 'trending', { offset, limit: 10 })
                  }
                  onGifClick={handleGifSelect}
                  noLink
                />
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={showMemes} onOpenChange={setShowMemes}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Smile className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px]" align="start">
              <div className="grid grid-cols-2 gap-2">
                {MEMES.map((meme, index) => (
                  <button
                    key={index}
                    onClick={() => addMessage(meme.url, 'meme')}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={meme.url} 
                      alt={meme.alt}
                      className="w-full h-auto rounded-md" 
                    />
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newMessage.trim()) {
                addMessage(newMessage);
              }
            }}
          />
          <Button 
            onClick={() => newMessage.trim() && addMessage(newMessage)}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;