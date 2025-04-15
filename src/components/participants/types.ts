
export interface Participant {
  id: string;
  name: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
  radiusSize: number;
  stream?: MediaStream | null;
}

export interface ParticipantWithPosition extends Participant {
  position?: { x: number, y: number };
  isMovable?: boolean;
}
