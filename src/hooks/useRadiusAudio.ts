
import { useState, useEffect } from 'react';
import { ParticipantWithPosition, AudioConnection } from '@/components/participants/types';

interface UseRadiusAudioProps {
  localUser: ParticipantWithPosition;
  participants: ParticipantWithPosition[];
}

export const useRadiusAudio = ({ localUser, participants }: UseRadiusAudioProps) => {
  const [audioConnections, setAudioConnections] = useState<AudioConnection[]>([]);
  
  // Calculate if two radii are overlapping using the distance formula
  const areRadiiOverlapping = (p1: ParticipantWithPosition, p2: ParticipantWithPosition): boolean => {
    // If either participant doesn't have a position, they can't overlap
    if (!p1.position || !p2.position) return false;
    
    // Calculate the distance between the two participants
    const dx = p1.position.x - p2.position.x;
    const dy = p1.position.y - p2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If the distance is less than the sum of the radii, the radii overlap
    const sumOfRadii = (p1.radiusSize + p2.radiusSize) / 10; // Adjust scale factor as needed
    return distance < sumOfRadii;
  };
  
  // Update audio connections when participant positions change
  useEffect(() => {
    if (!localUser || !participants.length) return;
    
    // Create new connections based on radius overlap
    const newConnections = participants.map(participant => {
      // In classroom mode, always connect audio
      if (localUser.speakingMode === 'classroom' || participant.speakingMode === 'classroom') {
        return {
          sourceId: localUser.id,
          targetId: participant.id,
          isConnected: true
        };
      }
      
      // In muted mode, never connect audio
      if (localUser.speakingMode === 'muted' || participant.speakingMode === 'muted') {
        return {
          sourceId: localUser.id,
          targetId: participant.id,
          isConnected: false
        };
      }
      
      // In private mode, connect audio only if radii overlap
      const isOverlapping = areRadiiOverlapping(localUser, participant);
      return {
        sourceId: localUser.id,
        targetId: participant.id,
        isConnected: isOverlapping
      };
    });
    
    setAudioConnections(newConnections);
  }, [localUser, participants]);
  
  return {
    audioConnections,
    isUserConnectedTo: (userId: string) => 
      audioConnections.some(conn => conn.targetId === userId && conn.isConnected)
  };
};
