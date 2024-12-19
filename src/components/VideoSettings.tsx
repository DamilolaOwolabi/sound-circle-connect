import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import VideoDisplay from './VideoDisplay';
import AudioStream from './AudioStream';

interface Device {
  deviceId: string;
  label: string;
}

interface VideoSettingsProps {
  stream: MediaStream | null;
  onDeviceChange: (audioDeviceId: string, videoDeviceId: string) => void;
}

const VideoSettings = ({ stream, onDeviceChange }: VideoSettingsProps) => {
  const [audioDevices, setAudioDevices] = useState<Device[]>([]);
  const [videoDevices, setVideoDevices] = useState<Device[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const audioInputs = devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 5)}...`
          }));
        
        const videoInputs = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 5)}...`
          }));

        setAudioDevices(audioInputs);
        setVideoDevices(videoInputs);
        
        // Set initial selections
        if (audioInputs.length > 0) setSelectedAudioDevice(audioInputs[0].deviceId);
        if (videoInputs.length > 0) setSelectedVideoDevice(videoInputs[0].deviceId);
        
        console.log('Available devices:', { audioInputs, videoInputs });
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    };

    if (isOpen) {
      getDevices();
    }
  }, [isOpen]);

  const handleSave = () => {
    onDeviceChange(selectedAudioDevice, selectedVideoDevice);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Video Conference Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="audio-device">Microphone</label>
            <Select
              value={selectedAudioDevice}
              onValueChange={setSelectedAudioDevice}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {audioDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="video-device">Camera</label>
            <Select
              value={selectedVideoDevice}
              onValueChange={setSelectedVideoDevice}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {videoDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <VideoDisplay
              stream={stream}
              isVideoOn={true}
              isScreenShare={false}
              isAudioOn={true}
            />
          </div>

          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoSettings;