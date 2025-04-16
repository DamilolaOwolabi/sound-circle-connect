import { useState, useEffect, useRef } from 'react';
import { Participant, ParticipantWithPosition } from './types';

interface UseParticipantAnimationsProps {
  layout: 'grid' | 'spotlight';
  allParticipants: Participant[];
  localUserRadiusSize: number;
  localUserPosition?: { x: number, y: number };
}

const useParticipantAnimations = ({ 
  layout, 
  allParticipants,
  localUserRadiusSize,
  localUserPosition = { x: 50, y: 50 }  // Default to center if not provided
}: UseParticipantAnimationsProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [participantsWithPositions, setParticipantsWithPositions] = useState<ParticipantWithPosition[]>([]);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (layout === 'grid') {
      const gridParticipants: ParticipantWithPosition[] = allParticipants.map(p => ({
        ...p,
        position: { x: 50, y: 50 }
      }));
      
      setParticipantsWithPositions(gridParticipants);
      setIsAnimating(false);
      return;
    }
    
    if (layout === 'spotlight' && isFirstLoad.current && allParticipants.length > 0) {
      setIsAnimating(true);
      
      const animatedPositions: ParticipantWithPosition[] = allParticipants.map((p, index) => {
        const startX = Math.random() > 0.5 ? -20 : 120;
        const startY = Math.random() * 100;
        
        return {
          ...p,
          position: { x: startX, y: startY }
        };
      });
      
      setParticipantsWithPositions(animatedPositions);
      
      setTimeout(() => {
        isFirstLoad.current = false;
        
        const stablePositions = calculateStablePositions(allParticipants, localUserPosition);
        setParticipantsWithPositions(stablePositions);
        
        setTimeout(() => {
          setIsAnimating(false);
        }, 3000);
      }, 500);
    } else {
      setIsAnimating(false);
      const stablePositions = calculateStablePositions(allParticipants, localUserPosition);
      setParticipantsWithPositions(stablePositions);
    }
  }, [layout, allParticipants, localUserPosition]);

  const calculateStablePositions = (
    participants: Participant[], 
    centerPos: { x: number, y: number }
  ): ParticipantWithPosition[] => {
    return participants.map((p, index) => {
      if ('position' in p && 
          p.position && 
          typeof p.position === 'object' && 
          'x' in p.position && 
          'y' in p.position && 
          typeof p.position.x === 'number' && 
          typeof p.position.y === 'number') {
        return {
          ...p,
          position: p.position as { x: number, y: number }
        };
      }
      
      const totalParticipants = Math.max(1, participants.length);
      const angleStep = (2 * Math.PI) / totalParticipants;
      const angle = angleStep * index;
      
      const radius = 35;
      
      const x = centerPos.x + Math.cos(angle) * radius;
      const y = centerPos.y + Math.sin(angle) * radius;
      
      const boundedX = Math.max(5, Math.min(95, x));
      const boundedY = Math.max(5, Math.min(95, y));
      
      return {
        ...p,
        position: { x: boundedX, y: boundedY }
      };
    });
  };

  return {
    isAnimating,
    participantsWithPositions
  };
};

export default useParticipantAnimations;
