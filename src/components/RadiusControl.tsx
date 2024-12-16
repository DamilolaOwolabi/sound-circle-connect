import React from 'react';
import { Slider } from '@/components/ui/slider';

interface RadiusControlProps {
  radiusSize: number;
  onRadiusChange: (value: number[]) => void;
  minRadius: number;
  maxRadius: number;
}

const RadiusControl = ({ radiusSize, onRadiusChange, minRadius, maxRadius }: RadiusControlProps) => {
  return (
    <div className="bg-card p-4 rounded-lg shadow">
      <h3 className="text-sm font-medium mb-2">Proximity Range</h3>
      <Slider
        defaultValue={[radiusSize]}
        max={maxRadius}
        min={minRadius}
        step={1}
        onValueChange={onRadiusChange}
        className="w-48"
      />
      <p className="text-xs text-muted-foreground mt-1">
        Range: {radiusSize}px
      </p>
    </div>
  );
};

export default RadiusControl;