
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { MapPin } from 'lucide-react';

interface RadiusControlProps {
  radiusSize: number;
  onRadiusChange: (value: number[]) => void;
  minRadius: number;
  maxRadius: number;
}

const RadiusControl = ({ radiusSize, onRadiusChange, minRadius, maxRadius }: RadiusControlProps) => {
  return (
    <div className="bg-card p-4 rounded-lg shadow h-full">
      <h2 className="font-semibold mb-4 flex items-center gap-2 text-lg">
        <MapPin className="w-4 h-4" />
        Proximity Range
      </h2>
      
      <div className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center">
            <div 
              className="rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-medium"
              style={{ 
                width: `${Math.min(200, radiusSize * 1.5)}px`, 
                height: `${Math.min(200, radiusSize * 1.5)}px` 
              }}
            >
              {radiusSize}px
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Adjust Range</h3>
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
          </p>
        </div>
      </div>
    </div>
  );
};

export default RadiusControl;
