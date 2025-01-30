import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VideoConstraints {
  width: { ideal: number };
  height: { ideal: number };
  frameRate: { ideal: number };
}

const QUALITY_SETTINGS = {
  low: { width: 640, height: 360, frameRate: 15 },
  medium: { width: 854, height: 480, frameRate: 24 },
  high: { width: 1280, height: 720, frameRate: 30 },
  hd: { width: 1920, height: 1080, frameRate: 30 },
};

export const useMediaStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [videoQuality, setVideoQuality] = useState<'low' | 'medium' | 'high' | 'hd'>('medium');
  const { toast } = useToast();

  const getVideoConstraints = (quality: keyof typeof QUALITY_SETTINGS, deviceId?: string): VideoConstraints & { deviceId?: string } => {
    const settings = QUALITY_SETTINGS[quality];
    return {
      width: { ideal: settings.width },
      height: { ideal: settings.height },
      frameRate: { ideal: settings.frameRate },
      ...(deviceId ? { deviceId } : {}),
    };
  };

  const initializeMedia = async (audioDeviceId?: string, videoDeviceId?: string) => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: audioDeviceId ? { deviceId: audioDeviceId } : true,
        video: getVideoConstraints(videoQuality, videoDeviceId),
      });
      
      console.log('Initial media stream obtained:', mediaStream.getTracks().map(t => ({ kind: t.kind, label: t.label })));
      
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioOn;
        console.log(`Initial audio track ${track.label} enabled:`, isAudioOn);
      });
      
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOn;
        console.log(`Initial video track ${track.label} enabled:`, isVideoOn);
      });
      
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        variant: "destructive",
        title: "Media Access Error",
        description: "Unable to access camera or microphone. Please check your permissions.",
      });
    }
  };

  useEffect(() => {
    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped ${track.kind} track`);
        });
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  const handleDeviceChange = async (audioDeviceId: string, videoDeviceId: string) => {
    setSelectedAudioDevice(audioDeviceId);
    setSelectedVideoDevice(videoDeviceId);
    await initializeMedia(audioDeviceId, videoDeviceId);
    toast({
      title: "Settings Updated",
      description: "Your audio and video devices have been updated.",
    });
  };

  const handleQualityChange = async (quality: 'low' | 'medium' | 'high' | 'hd') => {
    setVideoQuality(quality);
    if (stream && isVideoOn) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        await videoTrack.applyConstraints(getVideoConstraints(quality));
        toast({
          title: "Video Quality Updated",
          description: `Video quality set to ${quality}`,
        });
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      const newState = !isAudioOn;
      audioTracks.forEach(track => {
        track.enabled = newState;
        console.log(`Audio track ${track.label} enabled:`, newState);
      });
      setIsAudioOn(newState);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      const newState = !isVideoOn;
      videoTracks.forEach(track => {
        if (!newState) {
          track.stop();
        } else {
          initializeMedia(selectedAudioDevice, selectedVideoDevice);
        }
        console.log(`Video track ${track.label} ${newState ? 'started' : 'stopped'}`);
      });
      setIsVideoOn(newState);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        setScreenStream(displayStream);
        setIsScreenSharing(true);
        toast({
          title: "Screen Sharing Started",
          description: "You are now sharing your screen.",
        });
      } else {
        screenStream?.getTracks().forEach(track => track.stop());
        setScreenStream(null);
        setIsScreenSharing(false);
        toast({
          title: "Screen Sharing Stopped",
          description: "You have stopped sharing your screen.",
        });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        variant: "destructive",
        title: "Screen Sharing Error",
        description: "Unable to share screen. Please check your permissions.",
      });
    }
  };

  return {
    stream,
    screenStream,
    isAudioOn,
    isVideoOn,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    handleDeviceChange,
    handleQualityChange,
  };
};