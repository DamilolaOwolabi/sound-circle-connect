
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mic, Volume2, VolumeX } from 'lucide-react';

interface SpeakingModeSelectorProps {
  currentMode: 'private' | 'classroom' | 'muted';
  onChange: (mode: 'private' | 'classroom' | 'muted') => void;
  className?: string;
}

const SpeakingModeSelector = ({ currentMode, onChange, className }: SpeakingModeSelectorProps) => {
  const getModeIcon = () => {
    switch (currentMode) {
      case 'private':
        return <Mic className="w-4 h-4" />;
      case 'classroom':
        return <Volume2 className="w-4 h-4" />;
      case 'muted':
        return <VolumeX className="w-4 h-4" />;
    }
  };

  const getModeLabel = () => {
    switch (currentMode) {
      case 'private':
        return 'Private Mode';
      case 'classroom':
        return 'Classroom Mode';
      case 'muted':
        return 'Muted Mode';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          {getModeIcon()}
          <span className="ml-2">{getModeLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onChange('private')}>
          <Mic className="w-4 h-4 mr-2" />
          <span>Private Mode</span>
          {currentMode === 'private' && <span className="ml-2">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('classroom')}>
          <Volume2 className="w-4 h-4 mr-2" />
          <span>Classroom Mode</span>
          {currentMode === 'classroom' && <span className="ml-2">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('muted')}>
          <VolumeX className="w-4 h-4 mr-2" />
          <span>Muted Mode</span>
          {currentMode === 'muted' && <span className="ml-2">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SpeakingModeSelector;
