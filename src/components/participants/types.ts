
export interface Participant {
  id: string;
  name: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
  radiusSize: number;
  stream?: MediaStream | null;
  speakingMode?: 'private' | 'classroom' | 'muted';
}

export interface ParticipantWithPosition extends Participant {
  position?: { x: number, y: number };
  isMovable?: boolean;
}

export interface AudioConnection {
  sourceId: string;
  targetId: string;
  isConnected: boolean;
}
