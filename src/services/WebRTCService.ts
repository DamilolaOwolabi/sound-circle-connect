
import { toast } from '@/components/ui/use-toast';

export interface PeerConnection {
  id: string;
  name: string;
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  stream?: MediaStream;
  isAudioOn: boolean;
  isVideoOn: boolean;
  radiusSize: number;
}

interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate' | 'join' | 'leave' | 'error' | 'mute' | 'unmute' | 'radiusChange' | 'videoToggle';
  from: string;
  to?: string;
  name?: string;
  sdp?: string;
  candidate?: RTCIceCandidate;
  isAudioOn?: boolean;
  isVideoOn?: boolean;
  radiusSize?: number;
  meetingId?: string;
}

export class WebRTCService {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private signalingServer: WebSocket | null = null;
  private meetingId: string;
  private userId: string;
  private userName: string;
  private onPeerChangedCallbacks: Array<() => void> = [];
  private ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };
  
  constructor(meetingId: string, userName: string) {
    this.meetingId = meetingId;
    this.userId = `user_${Math.floor(Math.random() * 1000000)}`;
    this.userName = userName;
    
    // In a production app, we would use a real WebSocket server
    // For demo purposes, we'll use a mock implementation that simulates peer connections
    this.setupMockSignalingServer();
  }
  
  private setupMockSignalingServer() {
    // This is a mock implementation for demo purposes
    console.log(`Setting up mock signaling server for meeting ${this.meetingId}`);
    
    // In a real implementation, we would connect to an actual server
    setTimeout(() => {
      toast({
        title: "Connected to meeting server",
        description: `You've joined meeting ${this.meetingId}`,
      });
      
      // Simulate some users joining after a delay
      this.simulateUserJoining();
    }, 1500);
  }
  
  private simulateUserJoining() {
    const mockUsers = [
      { id: 'remote1', name: 'Alice Johnson', isAudioOn: true, isVideoOn: true, radiusSize: 60 },
      { id: 'remote2', name: 'Bob Smith', isAudioOn: false, isVideoOn: true, radiusSize: 45 }
    ];
    
    let delay = 2000;
    
    mockUsers.forEach(user => {
      setTimeout(() => {
        const connection = new RTCPeerConnection(this.ICE_SERVERS);
        
        // Create a mock stream
        const mockStream = new MediaStream();
        const mockTrack = this.createMockVideoTrack();
        if (mockTrack) {
          mockStream.addTrack(mockTrack);
        }
        
        const peerConnection: PeerConnection = {
          id: user.id,
          name: user.name,
          connection,
          stream: mockStream,
          isAudioOn: user.isAudioOn,
          isVideoOn: user.isVideoOn,
          radiusSize: user.radiusSize
        };
        
        this.peerConnections.set(user.id, peerConnection);
        
        toast({
          title: "New participant joined",
          description: `${user.name} has joined the meeting`,
        });
        
        this.notifyPeersChanged();
      }, delay);
      
      delay += 3000;
    });
  }
  
  private createMockVideoTrack(): MediaStreamTrack | null {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      // Draw something on the canvas
      setInterval(() => {
        if (!ctx) return;
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 70%)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Remote User', canvas.width / 2 - 80, canvas.height / 2);
      }, 1000);
      
      // Get a stream from the canvas
      const stream = canvas.captureStream(15);
      return stream.getVideoTracks()[0];
    } catch (err) {
      console.error('Failed to create mock video track:', err);
      return null;
    }
  }
  
  public async init(localStream: MediaStream) {
    this.localStream = localStream;
    console.log('WebRTC service initialized with local stream:', localStream.id);
    
    // In a real implementation, we would join the signaling server here
    // and handle incoming connection requests
  }
  
  public getAllPeers(): PeerConnection[] {
    return Array.from(this.peerConnections.values());
  }
  
  public onPeersChanged(callback: () => void) {
    this.onPeerChangedCallbacks.push(callback);
    return () => {
      this.onPeerChangedCallbacks = this.onPeerChangedCallbacks.filter(cb => cb !== callback);
    };
  }
  
  private notifyPeersChanged() {
    this.onPeerChangedCallbacks.forEach(callback => callback());
  }
  
  public updatePeerAudioState(peerId: string, isAudioOn: boolean) {
    const peer = this.peerConnections.get(peerId);
    if (peer) {
      peer.isAudioOn = isAudioOn;
      this.notifyPeersChanged();
      
      // In a real implementation, we would send this update through the signaling server
    }
  }
  
  public updatePeerVideoState(peerId: string, isVideoOn: boolean) {
    const peer = this.peerConnections.get(peerId);
    if (peer) {
      peer.isVideoOn = isVideoOn;
      this.notifyPeersChanged();
      
      // In a real implementation, we would send this update through the signaling server
    }
  }
  
  public updatePeerRadiusSize(peerId: string, radiusSize: number) {
    const peer = this.peerConnections.get(peerId);
    if (peer) {
      peer.radiusSize = radiusSize;
      this.notifyPeersChanged();
      
      // In a real implementation, we would send this update through the signaling server
    }
  }
  
  public disconnect() {
    // Close all peer connections
    this.peerConnections.forEach(peer => {
      peer.connection.close();
    });
    
    this.peerConnections.clear();
    
    // Close the signaling server connection
    if (this.signalingServer) {
      this.signalingServer.close();
      this.signalingServer = null;
    }
    
    console.log('WebRTC service disconnected');
  }
}

// Create a singleton instance to be used throughout the app
let webRTCServiceInstance: WebRTCService | null = null;

export const getWebRTCService = (meetingId: string, userName: string = 'Anonymous') => {
  if (!webRTCServiceInstance) {
    webRTCServiceInstance = new WebRTCService(meetingId, userName);
  }
  return webRTCServiceInstance;
};

export const destroyWebRTCService = () => {
  if (webRTCServiceInstance) {
    webRTCServiceInstance.disconnect();
    webRTCServiceInstance = null;
  }
};
