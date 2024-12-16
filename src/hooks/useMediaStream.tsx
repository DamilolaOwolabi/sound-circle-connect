import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useMediaStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        
        mediaStream.getAudioTracks().forEach(track => {
          track.enabled = isAudioOn;
        });
        mediaStream.getVideoTracks().forEach(track => {
          track.enabled = isVideoOn;
        });
        
        console.log('Media stream obtained successfully');
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

  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isAudioOn;
        console.log(`Audio track ${track.label} enabled: ${!isAudioOn}`);
      });
      setIsAudioOn(!isAudioOn);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
        console.log(`Video track ${track.label} enabled: ${!isVideoOn}`);
      });
      setIsVideoOn(!isVideoOn);
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
  };
};