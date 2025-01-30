import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QualitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onQualityChange?: (quality: 'low' | 'medium' | 'high' | 'hd') => void;
}

const QualitySelector = ({ isOpen, onClose, onQualityChange }: QualitySelectorProps) => {
  const handleQualityChange = (value: string) => {
    onQualityChange?.(value as 'low' | 'medium' | 'high' | 'hd');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Video Quality Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup defaultValue="medium" onValueChange={handleQualityChange}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low">Low (360p)</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Medium (480p)</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high">High (720p)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hd" id="hd" />
              <Label htmlFor="hd">HD (1080p)</Label>
            </div>
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QualitySelector;