import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Image as ImageIcon, Smile } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';

const gf = new GiphyFetch('pVF7yJTqxIoHwwTDTFHbIcnKNcnmmY8O');

const MEMES = [
  { url: '/lovable-uploads/c00aba7d-50a8-4993-83f8-139b74804439.png', alt: 'Meme 1' },
];

interface ChatInputProps {
  onSendMessage: (content: string, type: 'text' | 'gif' | 'meme') => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [showGifSearch, setShowGifSearch] = useState(false);
  const [showMemes, setShowMemes] = useState(false);
  const [gifSearchTerm, setGifSearchTerm] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage, 'text');
      setNewMessage('');
    }
  };

  const handleGifSelect = async (gif: any) => {
    onSendMessage(gif.images.original.url, 'gif');
    setShowGifSearch(false);
  };

  return (
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
                  onClick={() => {
                    onSendMessage(meme.url, 'meme');
                    setShowMemes(false);
                  }}
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
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button 
          onClick={handleSendMessage}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;