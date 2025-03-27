
import { useState, useEffect, useRef } from 'react';
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
  const streamRef = useRef<MediaStream | null>(null);
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
      // Stop existing tracks before requesting new ones
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped track: ${track.kind} - ${track.label}`);
        });
      }

      const constraints = {
        audio: audioDeviceId ? { deviceId: audioDeviceId } : true,
        video: getVideoConstraints(videoQuality, videoDeviceId),
      };

      console.log('Requesting media with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Media stream obtained:', mediaStream.getTracks().map(t => ({ kind: t.kind, label: t.label })));
      
      // Store the stream in the ref for cleanup
      streamRef.current = mediaStream;
      
      // Set audio track state
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioOn;
        console.log(`Initial audio track ${track.label} enabled:`, isAudioOn);
      });
      
      // Set video track state
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
      // Clean up all streams on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`Cleanup: Stopped ${track.kind} track ${track.label}`);
        });
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => {
          track.stop();
          console.log(`Cleanup: Stopped screen share track ${track.label}`);
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
        try {
          await videoTrack.applyConstraints(getVideoConstraints(quality));
          toast({
            title: "Video Quality Updated",
            description: `Video quality set to ${quality}`,
          });
        } catch (error) {
          console.error('Error applying quality constraints:', error);
          // If constraints fail, try reinitializing the stream
          await initializeMedia(selectedAudioDevice, selectedVideoDevice);
        }
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

  const toggleVideo = async () => {
    const newState = !isVideoOn;
    setIsVideoOn(newState);
    
    if (stream) {
      if (!newState) {
        // Disable video tracks but don't stop them
        stream.getVideoTracks().forEach(track => {
          track.enabled = false;
          console.log(`Video track ${track.label} disabled`);
        });
      } else {
        // Check if we need to reinitialize
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0 || videoTracks[0].readyState === 'ended') {
          console.log('Video tracks ended or missing, reinitializing media');
          await initializeMedia(selectedAudioDevice, selectedVideoDevice);
        } else {
          // Just re-enable existing tracks
          videoTracks.forEach(track => {
            track.enabled = true;
            console.log(`Video track ${track.label} enabled`);
          });
        }
      }
    } else if (newState) {
      // If we don't have a stream but video is being turned on, initialize it
      await initializeMedia(selectedAudioDevice, selectedVideoDevice);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Add event listener for when user stops sharing via browser UI
        displayStream.getVideoTracks()[0].addEventListener('ended', () => {
          console.log('Screen sharing stopped via browser UI');
          setScreenStream(null);
          setIsScreenSharing(false);
        });
        
        setScreenStream(displayStream);
        setIsScreenSharing(true);
        toast({
          title: "Screen Sharing Started",
          description: "You are now sharing your screen.",
        });
      } else {
        if (screenStream) {
          screenStream.getTracks().forEach(track => {
            track.stop();
            console.log(`Screen share track ${track.label} stopped`);
          });
        }
        setScreenStream(null);
        setIsScreenSharing(false);
        toast({
          title: "Screen Sharing Stopped",
          description: "You have stopped sharing your screen.",
        });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      setIsScreenSharing(false);
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
