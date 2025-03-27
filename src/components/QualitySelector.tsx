
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info } from 'lucide-react';

interface QualitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onQualityChange?: (quality: 'low' | 'medium' | 'high' | 'hd') => void;
  currentQuality?: 'low' | 'medium' | 'high' | 'hd';
}

interface ConnectionInfo {
  type: string | null;
  downlink: number | null;
}

const QualitySelector = ({ isOpen, onClose, onQualityChange, currentQuality = 'medium' }: QualitySelectorProps) => {
  const [selectedQuality, setSelectedQuality] = useState<'low' | 'medium' | 'high' | 'hd'>(currentQuality);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({ type: null, downlink: null });
  const [recommendedQuality, setRecommendedQuality] = useState<'low' | 'medium' | 'high' | 'hd' | null>(null);

  // Get network information
  useEffect(() => {
    const updateConnectionInfo = () => {
      if ('connection' in navigator && navigator.connection) {
        const connection = navigator.connection as any;
        setConnectionInfo({
          type: connection.effectiveType || null,
          downlink: connection.downlink || null
        });
        
        // Set recommended quality based on connection
        if (connection.effectiveType === '2g' || connection.downlink < 1) {
          setRecommendedQuality('low');
        } else if (connection.effectiveType === '3g' || (connection.downlink >= 1 && connection.downlink < 5)) {
          setRecommendedQuality('medium');
        } else if (connection.effectiveType === '4g' || connection.downlink >= 5) {
          setRecommendedQuality('high');
        } else {
          setRecommendedQuality(null);
        }
      }
    };
    
    // Update connection info when modal opens
    if (isOpen) {
      updateConnectionInfo();
      setSelectedQuality(currentQuality);
    }
    
    // Set up listener for connection changes
    if ('connection' in navigator && navigator.connection) {
      (navigator.connection as any).addEventListener('change', updateConnectionInfo);
    }
    
    return () => {
      if ('connection' in navigator && navigator.connection) {
        (navigator.connection as any).removeEventListener('change', updateConnectionInfo);
      }
    };
  }, [isOpen, currentQuality]);

  const handleQualityChange = (value: string) => {
    setSelectedQuality(value as 'low' | 'medium' | 'high' | 'hd');
  };
  
  const handleSaveClick = () => {
    onQualityChange?.(selectedQuality);
    onClose();
  };

  const qualityInfo = {
    low: { resolution: '360p', bandwidth: '~0.5 Mbps', label: 'Low' },
    medium: { resolution: '480p', bandwidth: '~1 Mbps', label: 'Medium' },
    high: { resolution: '720p', bandwidth: '~2.5 Mbps', label: 'High' },
    hd: { resolution: '1080p', bandwidth: '~4 Mbps', label: 'HD' }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Video Quality Settings</DialogTitle>
          <DialogDescription>
            Select the video quality based on your connection speed.
            {connectionInfo.type && (
              <div className="mt-2 text-sm flex items-center gap-2">
                <span>Your connection:</span>
                <Badge variant="outline">
                  {connectionInfo.type}
                  {connectionInfo.downlink ? ` (${connectionInfo.downlink} Mbps)` : ''}
                </Badge>
                {recommendedQuality && (
                  <Badge className="bg-green-600">
                    Recommended: {qualityInfo[recommendedQuality].label}
                  </Badge>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={selectedQuality} onValueChange={handleQualityChange}>
            {Object.entries(qualityInfo).map(([quality, info]) => (
              <div key={quality} className="flex items-center space-x-2 mb-3 p-2 rounded hover:bg-muted">
                <RadioGroupItem value={quality} id={quality} />
                <div className="flex-1">
                  <Label htmlFor={quality} className="text-base font-medium">
                    {info.label} ({info.resolution})
                  </Label>
                  <p className="text-sm text-muted-foreground">{info.bandwidth}</p>
                </div>
                {quality === recommendedQuality && (
                  <Badge variant="outline" className="bg-green-600/10 text-green-600 border-green-600">
                    Recommended
                  </Badge>
                )}
              </div>
            ))}
          </RadioGroup>
          
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground rounded-md bg-muted p-3">
            <Info className="h-4 w-4" />
            <p>Higher quality requires better internet connection. If your video is stuttering, try a lower quality setting.</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveClick}>Apply Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QualitySelector;
