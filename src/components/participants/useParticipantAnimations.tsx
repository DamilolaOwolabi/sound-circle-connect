
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
  const [isAnimating, setIsAnimating] = useState(true);
  const [participantsWithPositions, setParticipantsWithPositions] = useState<ParticipantWithPosition[]>([]);

  // Entry animation and position calculation effect
  useEffect(() => {
    // Skip animation in grid layout
    if (layout === 'grid') {
      setIsAnimating(false);
      return;
    }
    
    // Add random positions for initial shuffle
    const withRandomPositions = allParticipants.map((p) => ({
      ...p,
      position: {
        // Create random positions within viewport bounds (0-100%)
        x: Math.random() * 80 + 10, // Random position between 10% and 90%
        y: Math.random() * 80 + 10  // Random position between 10% and 90%
      }
    }));
    
    setParticipantsWithPositions(withRandomPositions);
    setIsAnimating(true);
    
    // First phase: Show random positions briefly (800ms)
    const shuffleTimeout = setTimeout(() => {
      // Second phase: Sort into positions around the local user in a circular pattern
      const sortedPositions = allParticipants.map((p, index) => {
        // Calculate positions in a circular pattern using polar coordinates
        const totalParticipants = Math.max(1, allParticipants.length);
        const angleStep = (2 * Math.PI) / totalParticipants;
        const angle = angleStep * index;
        
        // Calculate spacing based on the local user's radius size
        // and ensure participants are placed at a reasonable distance
        const spacingFactor = 25; // Adjust this for larger/smaller circles
        const distanceFromCenter = (localUserRadiusSize / spacingFactor) + 15;
        
        // Calculate final position using the local user position as center
        // and convert from polar coordinates to cartesian (percentage-based)
        const x = localUserPosition.x + Math.cos(angle) * distanceFromCenter;
        const y = localUserPosition.y + Math.sin(angle) * distanceFromCenter;
        
        // Ensure positions remain within bounds (0-100%)
        const boundedX = Math.max(5, Math.min(95, x));
        const boundedY = Math.max(5, Math.min(95, y));
        
        return {
          ...p,
          position: { x: boundedX, y: boundedY }
        };
      });
      
      setParticipantsWithPositions(sortedPositions);
      
      // End animation after positions are sorted (with transition effect)
      setTimeout(() => setIsAnimating(false), 1000);
    }, 800);
    
    return () => {
      clearTimeout(shuffleTimeout);
    };
  }, [layout, allParticipants, localUserRadiusSize, localUserPosition]);

  return {
    isAnimating,
    participantsWithPositions
  };
};

export default useParticipantAnimations;
