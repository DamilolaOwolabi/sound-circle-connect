
import { useState, useEffect, useRef } from 'react';
import { Participant, ParticipantWithPosition } from './types';

interface UseParticipantAnimationsProps {
  layout: 'grid' | 'spotlight';
  allParticipants: Participant[];
  localUserRadiusSize: number;
  localUserPosition?: { x: number, y: number };
  onParticipantPositionUpdate?: (participantId: string, position: { x: number, y: number }) => void;
}

const useParticipantAnimations = ({ 
  layout, 
  allParticipants,
  localUserRadiusSize,
  localUserPosition = { x: 50, y: 50 },
  onParticipantPositionUpdate
}: UseParticipantAnimationsProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [participantsWithPositions, setParticipantsWithPositions] = useState<ParticipantWithPosition[]>([]);
  const [participantPositions, setParticipantPositions] = useState<Record<string, { x: number, y: number }>>({});
  const isFirstLoad = useRef(true);
  const prevLayoutRef = useRef(layout);
  const prevParticipantsRef = useRef(allParticipants.length);

  const handleParticipantPositionChange = (participantId: string, position: { x: number, y: number }) => {
    setParticipantPositions(prev => ({
      ...prev,
      [participantId]: position
    }));
    onParticipantPositionUpdate?.(participantId, position);
  };

  useEffect(() => {
    const shouldAnimate = isFirstLoad.current || 
                         prevLayoutRef.current !== layout ||
                         prevParticipantsRef.current !== allParticipants.length;
    
    prevLayoutRef.current = layout;
    prevParticipantsRef.current = allParticipants.length;

    if (layout === 'grid') {
      const gridParticipants: ParticipantWithPosition[] = allParticipants.map(p => ({
        ...p,
        position: { x: 50, y: 50 },
        isMovable: false
      }));
      
      setParticipantsWithPositions(gridParticipants);
      setIsAnimating(false);
      return;
    }
    
    if (layout === 'spotlight' && shouldAnimate) {
      setIsAnimating(true);
      
      const animatedPositions: ParticipantWithPosition[] = allParticipants.map((p, index) => {
        const startX = Math.random() > 0.5 ? -20 : 120;
        const startY = Math.random() * 100;
        
        return {
          ...p,
          position: { x: startX, y: startY },
          isMovable: true
        };
      });
      
      setParticipantsWithPositions(animatedPositions);
      
      const animationTimer = setTimeout(() => {
        isFirstLoad.current = false;
        
        const stablePositions = calculateStablePositions(allParticipants, localUserPosition);
        setParticipantsWithPositions(stablePositions);
        
        const endAnimationTimer = setTimeout(() => {
          setIsAnimating(false);
        }, 2500);
        
        return () => clearTimeout(endAnimationTimer);
      }, 100);
      
      return () => clearTimeout(animationTimer);
    } else if (layout === 'spotlight') {
      const stablePositions = calculateStablePositions(allParticipants, localUserPosition);
      setParticipantsWithPositions(stablePositions);
    }
  }, [layout, allParticipants.length, localUserPosition]);

  // Update positions when manually moved
  useEffect(() => {
    if (layout === 'spotlight') {
      setParticipantsWithPositions(prev => 
        prev.map(p => ({
          ...p,
          position: participantPositions[p.id] || p.position || { x: 50, y: 50 }
        }))
      );
    }
  }, [participantPositions, layout]);

  const calculateStablePositions = (
    participants: Participant[], 
    centerPos: { x: number, y: number }
  ): ParticipantWithPosition[] => {
    return participants.map((p, index) => {
      // Check if this participant has a manually set position
      if (participantPositions[p.id]) {
        return {
          ...p,
          position: participantPositions[p.id],
          isMovable: true
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
        position: { x: boundedX, y: boundedY },
        isMovable: true
      };
    });
  };

  return {
    isAnimating,
    participantsWithPositions,
    handleParticipantPositionChange
  };
};

export default useParticipantAnimations;
