
import { useState, useEffect, useCallback } from 'react';
import { WebRTCService, getWebRTCService, destroyWebRTCService, PeerConnection } from '@/services/WebRTCService';
import { toast } from '@/components/ui/use-toast';

interface UseWebRTCOptions {
  meetingId: string;
  userName: string;
  stream: MediaStream | null;
}

export const useWebRTC = ({ meetingId, userName, stream }: UseWebRTCOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState<PeerConnection[]>([]);
  const [service, setService] = useState<WebRTCService | null>(null);
  
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    try {
      setIsConnecting(true);
      
      if (!stream) {
        throw new Error('No local stream available to connect');
      }
      
      const webRTCService = getWebRTCService(meetingId, userName);
      await webRTCService.init(stream);
      
      setService(webRTCService);
      setRemoteParticipants(webRTCService.getAllPeers());
      setIsConnected(true);
      
      toast({
        title: "Connected to meeting",
        description: `You've joined meeting ${meetingId}`,
      });
    } catch (error) {
      console.error('Failed to connect to meeting:', error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Could not connect to the meeting. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [meetingId, userName, stream, isConnecting, isConnected]);
  
  const disconnect = useCallback(() => {
    destroyWebRTCService();
    setService(null);
    setIsConnected(false);
    setRemoteParticipants([]);
    
    toast({
      title: "Disconnected",
      description: "You've left the meeting",
    });
  }, []);
  
  // Update remote participants when peers change
  useEffect(() => {
    if (!service) return;
    
    const unsubscribe = service.onPeersChanged(() => {
      setRemoteParticipants(service.getAllPeers());
    });
    
    return unsubscribe;
  }, [service]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  // Auto-connect when stream is available
  useEffect(() => {
    if (stream && meetingId && !isConnected && !isConnecting) {
      connect();
    }
  }, [stream, meetingId, isConnected, isConnecting, connect]);
  
  return {
    isConnected,
    isConnecting,
    remoteParticipants,
    connect,
    disconnect
  };
};
