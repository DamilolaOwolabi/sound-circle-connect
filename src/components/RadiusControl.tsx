import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { MapPin, Move } from 'lucide-react';
import SpeakingModeSelector from './participants/SpeakingModeSelector';

interface RadiusControlProps {
  radiusSize: number;
  onRadiusChange: (value: number[]) => void;
  minRadius: number;
  maxRadius: number;
  position?: { x: number, y: number };
  onPositionChange?: (position: { x: number, y: number }) => void;
  speakingMode?: 'private' | 'classroom' | 'muted';
  onSpeakingModeChange?: (mode: 'private' | 'classroom' | 'muted') => void;
}

const RadiusControl = ({ 
  radiusSize, 
  onRadiusChange, 
  minRadius, 
  maxRadius,
  position = { x: 50, y: 50 },
  onPositionChange,
  speakingMode = 'private',
  onSpeakingModeChange
}: RadiusControlProps) => {
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag interactions within the preview area
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onPositionChange) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    // Calculate position relative to the container
    const container = e.currentTarget as HTMLDivElement;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    onPositionChange({ x, y });
  };

  // Get color based on speaking mode
  const getModeColor = () => {
    switch (speakingMode) {
      case 'private':
        return 'rgba(155, 135, 245, 0.2)';
      case 'classroom':
        return 'rgba(52, 211, 153, 0.2)';
      case 'muted':
        return 'rgba(239, 68, 68, 0.2)';
      default:
        return 'rgba(155, 135, 245, 0.2)';
    }
  };

  const getModeBorderColor = () => {
    switch (speakingMode) {
      case 'private':
        return '#9b87f5';
      case 'classroom':
        return '#34d399';
      case 'muted':
        return '#ef4444';
      default:
        return '#9b87f5';
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow h-full">
      <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
        <MapPin className="w-4 h-4" />
        Proximity Range
      </h2>
      
      <div className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative w-full h-[140px] border border-muted rounded-lg bg-muted/20 overflow-hidden"
               onMouseDown={handleMouseDown}>
            <div 
              className="absolute rounded-full border flex items-center justify-center font-medium cursor-move"
              style={{ 
                width: `${Math.min(80, radiusSize)}px`, 
                height: `${Math.min(80, radiusSize)}px`,
                left: `calc(${position.x}% - ${Math.min(80, radiusSize) / 2}px)`,
                top: `calc(${position.y}% - ${Math.min(80, radiusSize) / 2}px)`,
                background: getModeColor(),
                border: `2px solid ${getModeBorderColor()}`
              }}
            >
              <Move className="w-4 h-4 opacity-70" />
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              Drag to adjust position
            </div>
          </div>
        </div>
        
        {onSpeakingModeChange && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Speaking Mode</h3>
            <SpeakingModeSelector 
              currentMode={speakingMode}
              onChange={onSpeakingModeChange}
              className="w-full"
            />
            
            <div className="mt-3 text-xs text-muted-foreground">
              {speakingMode === 'private' && 'Private Mode: Only users within your radius can hear you.'}
              {speakingMode === 'classroom' && 'Classroom Mode: Everyone in the meeting can hear you.'}
              {speakingMode === 'muted' && 'Muted Mode: No one can hear you.'}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Adjust Range Size</h3>
          <Slider
            defaultValue={[radiusSize]}
            value={[radiusSize]}
            max={maxRadius}
            min={minRadius}
            step={1}
            onValueChange={onRadiusChange}
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Minimum ({minRadius}px)</span>
            <span>Maximum ({maxRadius}px)</span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            The proximity range determines how far your voice can travel.
            Only users whose radii overlap with yours can hear and see you in private mode.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RadiusControl;
