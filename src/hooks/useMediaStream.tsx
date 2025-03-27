import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VideoConstraints {
  width: { ideal: number };
  height: { ideal: number };
  frameRate: { ideal: number };
  aspectRatio?: number;
}

interface NetworkStats {
  downlink: number | null;
  effectiveType: string | null;
  rtt: number | null;
  lastUpdated: number;
}

const QUALITY_SETTINGS = {
  low: { width: 640, height: 360, frameRate: 15, bitrate: 500000 },
  medium: { width: 854, height: 480, frameRate: 24, bitrate: 1000000 },
  high: { width: 1280, height: 720, frameRate: 30, bitrate: 2500000 },
  hd: { width: 1920, height: 1080, frameRate: 30, bitrate: 4000000 },
};

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
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
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    downlink: null,
    effectiveType: null,
    rtt: null,
    lastUpdated: Date.now()
  });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');
  const streamRef = useRef<MediaStream | null>(null);
  const reconnectTimeoutRef = useRef<number>();
  const { toast } = useToast();

  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const updateNetworkStats = useCallback(() => {
    if ('connection' in navigator && navigator.connection) {
      const connection = navigator.connection as any;
      setNetworkStats({
        downlink: connection.downlink || null,
        effectiveType: connection.effectiveType || null,
        rtt: connection.rtt || null,
        lastUpdated: Date.now()
      });
    }
  }, []);

  useEffect(() => {
    updateNetworkStats();
    
    const handleConnectionChange = () => {
      updateNetworkStats();
      const connection = navigator.connection as any;
      
      if (connection && connection.effectiveType) {
        let newQuality: 'low' | 'medium' | 'high' | 'hd' = videoQuality;
        
        switch (connection.effectiveType) {
          case 'slow-2g':
          case '2g':
            newQuality = 'low';
            break;
          case '3g':
            newQuality = 'medium';
            break;
          case '4g':
            newQuality = 'high';
            break;
          default:
            break;
        }
        
        if (newQuality !== videoQuality) {
          console.log(`Network changed to ${connection.effectiveType}, adjusting quality to ${newQuality}`);
          setVideoQuality(newQuality);
          if (stream) {
            applyVideoConstraints(stream, newQuality);
          }
        }
      }
    };
    
    if ('connection' in navigator) {
      (navigator.connection as any)?.addEventListener('change', handleConnectionChange);
    }
    
    return () => {
      if ('connection' in navigator) {
        (navigator.connection as any)?.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateNetworkStats, videoQuality, stream]);

  const getVideoConstraints = (quality: keyof typeof QUALITY_SETTINGS, deviceId?: string): VideoConstraints & { deviceId?: string } => {
    const settings = QUALITY_SETTINGS[quality];
    return {
      width: { ideal: settings.width },
      height: { ideal: settings.height },
      frameRate: { ideal: settings.frameRate },
      aspectRatio: 16/9,
      ...(deviceId ? { deviceId } : {}),
    };
  };

  const applyVideoConstraints = useCallback(async (mediaStream: MediaStream, quality: keyof typeof QUALITY_SETTINGS) => {
    const videoTracks = mediaStream.getVideoTracks();
    if (videoTracks.length === 0) return;
    
    const videoTrack = videoTracks[0];
    const constraints = getVideoConstraints(quality);
    
    try {
      await videoTrack.applyConstraints(constraints);
      console.log(`Applied ${quality} quality constraints:`, constraints);
      
      if ('getSettings' in videoTrack) {
        const settings = videoTrack.getSettings();
        console.log('Current track settings:', settings);
      }
    } catch (error) {
      console.error('Error applying quality constraints:', error);
    }
  }, []);

  const initializeMedia = useCallback(async (audioDeviceId?: string, videoDeviceId?: string) => {
    try {
      setConnectionStatus('reconnecting');
      reconnectAttemptsRef.current++;
      
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
      
      streamRef.current = mediaStream;
      
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioOn;
        console.log(`Initial audio track ${track.label} enabled:`, isAudioOn);
      });
      
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOn;
        console.log(`Initial video track ${track.label} enabled:`, isVideoOn);
      });
      
      setStream(mediaStream);
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;
      
      applyVideoConstraints(mediaStream, videoQuality);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setConnectionStatus('disconnected');
      
      if (reconnectAttemptsRef.current === 1) {
        toast({
          variant: "destructive",
          title: "Media Access Error",
          description: "Unable to access camera or microphone. Please check your permissions.",
        });
      }
      
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        console.log(`Reconnection attempt ${reconnectAttemptsRef.current} of ${MAX_RECONNECT_ATTEMPTS}...`);
        reconnectTimeoutRef.current = window.setTimeout(() => {
          initializeMedia(audioDeviceId, videoDeviceId);
        }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Maximum reconnection attempts reached. Please refresh the page.",
        });
      }
    }
  }, [toast, isAudioOn, isVideoOn, videoQuality, applyVideoConstraints]);

  useEffect(() => {
    initializeMedia();

    return () => {
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
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initializeMedia]);

  const handleDeviceChange = useCallback(async (audioDeviceId: string, videoDeviceId: string) => {
    setSelectedAudioDevice(audioDeviceId);
    setSelectedVideoDevice(videoDeviceId);
    await initializeMedia(audioDeviceId, videoDeviceId);
    toast({
      title: "Settings Updated",
      description: "Your audio and video devices have been updated.",
    });
  }, [initializeMedia, toast]);

  const handleQualityChange = useCallback(async (quality: 'low' | 'medium' | 'high' | 'hd') => {
    setVideoQuality(quality);
    if (stream && isVideoOn) {
      try {
        await applyVideoConstraints(stream, quality);
        toast({
          title: "Video Quality Updated",
          description: `Video quality set to ${quality}`,
        });
      } catch (error) {
        console.error('Error changing quality:', error);
        await initializeMedia(selectedAudioDevice, selectedVideoDevice);
      }
    }
  }, [stream, isVideoOn, applyVideoConstraints, toast, initializeMedia, selectedAudioDevice, selectedVideoDevice]);

  const toggleAudio = useCallback(() => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      const newState = !isAudioOn;
      audioTracks.forEach(track => {
        track.enabled = newState;
        console.log(`Audio track ${track.label} enabled:`, newState);
      });
      setIsAudioOn(newState);
    }
  }, [stream, isAudioOn]);

  const toggleVideo = useCallback(async () => {
    const newState = !isVideoOn;
    setIsVideoOn(newState);
    
    if (stream) {
      if (!newState) {
        stream.getVideoTracks().forEach(track => {
          track.enabled = false;
          console.log(`Video track ${track.label} disabled`);
        });
      } else {
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0 || videoTracks[0].readyState === 'ended') {
          console.log('Video tracks ended or missing, reinitializing media');
          await initializeMedia(selectedAudioDevice, selectedVideoDevice);
        } else {
          videoTracks.forEach(track => {
            track.enabled = true;
            console.log(`Video track ${track.label} enabled`);
          });
          
          applyVideoConstraints(stream, videoQuality);
        }
      }
    } else if (newState) {
      await initializeMedia(selectedAudioDevice, selectedVideoDevice);
    }
  }, [isVideoOn, stream, initializeMedia, selectedAudioDevice, selectedVideoDevice, applyVideoConstraints, videoQuality]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor',
            logicalSurface: true
          },
          audio: true
        } as MediaStreamConstraints);
        
        displayStream.getVideoTracks()[0].addEventListener('ended', () => {
          console.log('Screen sharing stopped via browser UI');
          setScreenStream(null);
          setIsScreenSharing(false);
        });
        
        const videoTrack = displayStream.getVideoTracks()[0];
        if (videoTrack) {
          try {
            await videoTrack.applyConstraints({
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 15 }
            });
          } catch (error) {
            console.warn('Could not apply screen share constraints:', error);
          }
        }
        
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
  }, [isScreenSharing, screenStream, toast]);

  useEffect(() => {
    const checkConnection = () => {
      if (stream) {
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();
        
        const allTracksEnded = [...videoTracks, ...audioTracks].every(
          track => track.readyState === 'ended'
        );
        
        if (allTracksEnded && isVideoOn) {
          console.warn('All tracks have ended unexpectedly, attempting to reconnect...');
          initializeMedia(selectedAudioDevice, selectedVideoDevice);
        }
      }
    };
    
    const intervalId = setInterval(checkConnection, 10000);
    return () => clearInterval(intervalId);
  }, [stream, isVideoOn, initializeMedia, selectedAudioDevice, selectedVideoDevice]);

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
    connectionStatus,
    networkStats,
  };
};
