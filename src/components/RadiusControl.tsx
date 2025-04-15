
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { MapPin, Move } from 'lucide-react';

interface RadiusControlProps {
  radiusSize: number;
  onRadiusChange: (value: number[]) => void;
  minRadius: number;
  maxRadius: number;
  position?: { x: number, y: number };
  onPositionChange?: (position: { x: number, y: number }) => void;
}

const RadiusControl = ({ 
  radiusSize, 
  onRadiusChange, 
  minRadius, 
  maxRadius,
  position = { x: 0, y: 0 },
  onPositionChange
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
              className="absolute rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-medium cursor-move"
              style={{ 
                width: `${Math.min(80, radiusSize)}px`, 
                height: `${Math.min(80, radiusSize)}px`,
                left: `calc(${position.x}% - ${Math.min(80, radiusSize) / 2}px)`,
                top: `calc(${position.y}% - ${Math.min(80, radiusSize) / 2}px)`,
              }}
            >
              <Move className="w-4 h-4 opacity-70" />
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              Drag to adjust position
            </div>
          </div>
        </div>
        
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
            The proximity range determines how close other participants need to be for audio to be at full volume.
            You can drag the circle to reposition your radius in the meeting space.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RadiusControl;
