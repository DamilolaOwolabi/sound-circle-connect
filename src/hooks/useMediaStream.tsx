import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NetworkInformation extends EventTarget {
  readonly downlink: number;
  readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  readonly rtt: number;
  readonly saveData: boolean;
  onchange: ((this: NetworkInformation, ev: Event) => any) | null;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

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
  const videoStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const updateNetworkStats = useCallback(() => {
    const nav = navigator as NavigatorWithConnection;
    if (nav.connection) {
      setNetworkStats({
        downlink: nav.connection.downlink || null,
        effectiveType: nav.connection.effectiveType || null,
        rtt: nav.connection.rtt || null,
        lastUpdated: Date.now()
      });
    }
  }, []);

  useEffect(() => {
    updateNetworkStats();
    
    const handleConnectionChange = () => {
      updateNetworkStats();
      const nav = navigator as NavigatorWithConnection;
      
      if (nav.connection) {
        let newQuality: 'low' | 'medium' | 'high' | 'hd' = videoQuality;
        
        switch (nav.connection.effectiveType) {
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
          console.log(`Network changed to ${nav.connection.effectiveType}, adjusting quality to ${newQuality}`);
          setVideoQuality(newQuality);
          if (stream) {
            applyVideoConstraints(stream, newQuality);
          }
        }
      }
    };
    
    const nav = navigator as NavigatorWithConnection;
    if (nav.connection) {
      nav.connection.addEventListener('change', handleConnectionChange);
    }
    
    return () => {
      if (nav.connection) {
        nav.connection.removeEventListener('change', handleConnectionChange);
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

      const combinedStream = new MediaStream();
      
      if (isAudioOn) {
        try {
          const audioConstraints = audioDeviceId ? { deviceId: audioDeviceId } : true;
          console.log('Requesting audio with constraints:', audioConstraints);
          
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => {
              track.stop();
              console.log(`Stopped audio track: ${track.label}`);
            });
          }
          
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });
          audioStreamRef.current = audioStream;
          
          audioStream.getAudioTracks().forEach(track => {
            combinedStream.addTrack(track);
            console.log(`Added audio track: ${track.label}`);
          });
        } catch (error) {
          console.error('Error accessing audio devices:', error);
          toast({
            title: "Audio Error",
            description: "Unable to access microphone. Please check your permissions.",
          });
        }
      }
      
      if (isVideoOn) {
        try {
          const videoConstraints = getVideoConstraints(videoQuality, videoDeviceId);
          console.log('Requesting video with constraints:', videoConstraints);
          
          if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach(track => {
              track.stop();
              console.log(`Stopped video track: ${track.label}`);
            });
          }
          
          const videoStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: videoConstraints });
          videoStreamRef.current = videoStream;
          
          videoStream.getVideoTracks().forEach(track => {
            combinedStream.addTrack(track);
            console.log(`Added video track: ${track.label}`);
            
            applyVideoConstraints(videoStream, videoQuality);
          });
        } catch (error) {
          console.error('Error accessing video devices:', error);
          toast({
            title: "Video Error",
            description: "Unable to access camera. Please check your permissions.",
          });
        }
      }
      
      streamRef.current = combinedStream;
      setStream(combinedStream);
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;
      
      console.log('Media initialization complete:', 
        `Audio: ${combinedStream.getAudioTracks().length} tracks, ` +
        `Video: ${combinedStream.getVideoTracks().length} tracks`
      );
    } catch (error) {
      console.error('Error in media initialization:', error);
      setConnectionStatus('disconnected');
      
      if (reconnectAttemptsRef.current === 1) {
        toast({
          variant: "destructive",
          title: "Media Access Error",
          description: "Unable to access media devices. Please check your permissions.",
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
      [streamRef.current, audioStreamRef.current, videoStreamRef.current, screenStream].forEach(stream => {
        if (stream) {
          stream.getTracks().forEach(track => {
            track.stop();
            console.log(`Cleanup: Stopped ${track.kind} track ${track.label}`);
          });
        }
      });
      
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
    
    try {
      if (stream) {
        const videoTracks = stream.getVideoTracks();
        
        if (!newState) {
          console.log('Turning off video - stopping all video tracks to release camera hardware');
          
          videoTracks.forEach(track => {
            track.enabled = false;
            track.stop();
            stream.removeTrack(track);
            console.log(`Video track ${track.label} completely stopped and removed from stream`);
          });
          
          if (videoStreamRef.current) {
            videoStreamRef.current.getTracks().forEach(track => {
              track.stop();
            });
            videoStreamRef.current = null;
          }
          
          toast({
            title: "Camera Hardware Released",
            description: "Your camera has been completely turned off and hardware access released.",
          });
        } else {
          console.log('Turning on video - requesting camera access');
          
          try {
            const videoConstraints = getVideoConstraints(videoQuality, selectedVideoDevice);
            const newVideoStream = await navigator.mediaDevices.getUserMedia({ 
              audio: false, 
              video: videoConstraints 
            });
            
            videoStreamRef.current = newVideoStream;
            
            newVideoStream.getVideoTracks().forEach(track => {
              stream.addTrack(track);
              console.log(`Added new video track: ${track.label}`);
            });
            
            applyVideoConstraints(newVideoStream, videoQuality);
            
            setStream(new MediaStream([...stream.getTracks()]));
            
            toast({
              title: "Camera Activated",
              description: "Your camera has been turned on and is now active.",
            });
          } catch (error) {
            console.error('Error activating camera:', error);
            setIsVideoOn(false);
            
            toast({
              variant: "destructive",
              title: "Camera Error",
              description: "Failed to access your camera. Please check permissions and try again.",
            });
          }
        }
      } else if (newState) {
        console.log('No existing stream but video requested - initializing media');
        await initializeMedia(selectedAudioDevice, selectedVideoDevice);
      }
    } catch (error) {
      console.error('Error in video toggle:', error);
      setIsVideoOn(!newState);
      
      toast({
        variant: "destructive",
        title: "Video Toggle Error",
        description: "An error occurred while changing camera state.",
      });
    }
  }, [isVideoOn, stream, initializeMedia, selectedAudioDevice, selectedVideoDevice, applyVideoConstraints, videoQuality, toast]);

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
