
import { useState, useEffect } from 'react';
import { Participant, ParticipantWithPosition } from './types';

interface UseParticipantAnimationsProps {
  layout: 'grid' | 'spotlight';
  allParticipants: Participant[];
  localUserRadiusSize: number;
}

const useParticipantAnimations = ({ 
  layout, 
  allParticipants,
  localUserRadiusSize 
}: UseParticipantAnimationsProps) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [participantsWithPositions, setParticipantsWithPositions] = useState<ParticipantWithPosition[]>([]);

  // Entry animation effect
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
        x: Math.random() * 200 - 100, // Random position between -100 and 100
        y: Math.random() * 200 - 100
      }
    }));
    
    setParticipantsWithPositions(withRandomPositions);
    
    // First phase: Shuffle animation
    const shuffleTimeout = setTimeout(() => {
      // Second phase: Sort into positions around the host
      const sortedPositions = allParticipants.map((p, index) => {
        // Calculate positions in a circular pattern
        const angleStep = (2 * Math.PI) / allParticipants.length;
        const angle = angleStep * index;
        
        // Calculate radius based on user's radius size to maintain proper spacing
        // Ensure participants are at least half the user's radius diameter away plus their own radius
        const minDistance = localUserRadiusSize * 1.5 + p.radiusSize;
        
        return {
          ...p,
          position: {
            x: Math.cos(angle) * minDistance,
            y: Math.sin(angle) * minDistance
          }
        };
      });
      
      setParticipantsWithPositions(sortedPositions);
      
      // End animation after sorting completes
      setTimeout(() => setIsAnimating(false), 1000);
    }, 1500);
    
    return () => {
      clearTimeout(shuffleTimeout);
    };
  }, [layout, allParticipants, localUserRadiusSize]);

  return {
    isAnimating,
    participantsWithPositions
  };
};

export default useParticipantAnimations;
