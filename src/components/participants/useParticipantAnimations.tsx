import { useState, useEffect } from 'react';
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
  const [isAnimating, setIsAnimating] = useState(false); // Start with no animation
  const [participantsWithPositions, setParticipantsWithPositions] = useState<ParticipantWithPosition[]>([]);

  // Position calculation effect without random animations
  useEffect(() => {
    // Skip animation in all layouts - we don't want automatic movement
    setIsAnimating(false);
    
    // For grid layout, positions aren't relevant
    if (layout === 'grid') {
      return;
    }
    
    // For spotlight layout, assign stable positions
    const stablePositions = allParticipants.map((p, index) => {
      // If participant already has a position, keep it
      if ('position' in p && p.position) {
        return {
          ...p,
          position: p.position
        };
      }
      
      // Otherwise, calculate a stable position based on index
      // Use a deterministic algorithm that places participants in a circle
      // around the meeting area, not around the local user
      const totalParticipants = Math.max(1, allParticipants.length);
      const angleStep = (2 * Math.PI) / totalParticipants;
      const angle = angleStep * index;
      
      // Calculate positions in a circle around the center of the meeting area
      // Not relative to the local user to prevent movement when local user moves
      const centerX = 50; // Center of meeting area
      const centerY = 50;
      const radius = 35; // Fixed distance from center
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Ensure positions remain within bounds (5%-95%)
      const boundedX = Math.max(5, Math.min(95, x));
      const boundedY = Math.max(5, Math.min(95, y));
      
      return {
        ...p,
        position: { x: boundedX, y: boundedY }
      };
    });
    
    setParticipantsWithPositions(stablePositions);
  }, [layout, allParticipants]);

  return {
    isAnimating,
    participantsWithPositions
  };
};

export default useParticipantAnimations;
