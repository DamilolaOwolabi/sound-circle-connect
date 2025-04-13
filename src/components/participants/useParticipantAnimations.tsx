
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
        // Create more dramatic randomness by increasing the range
        x: Math.random() * 300 - 150, // Random position between -150 and 150
        y: Math.random() * 300 - 150  // Random position between -150 and 150
      }
    }));
    
    setParticipantsWithPositions(withRandomPositions);
    setIsAnimating(true);
    
    // First phase: Shuffle animation (wait 800ms to show the random positions)
    const shuffleTimeout = setTimeout(() => {
      // Second phase: Sort into positions around the host using polar coordinates
      const sortedPositions = allParticipants.map((p, index) => {
        // Calculate positions in a circular pattern using polar coordinates
        const angleStep = (2 * Math.PI) / allParticipants.length;
        const angle = angleStep * index;
        
        // Calculate radius based on user's radius size to maintain proper spacing
        // Ensure participants are at least double the user's radius away plus their own radius
        // This creates better spacing and prevents overlaps
        const minDistance = localUserRadiusSize * 2 + p.radiusSize;
        
        return {
          ...p,
          position: {
            x: Math.cos(angle) * minDistance,
            y: Math.sin(angle) * minDistance
          }
        };
      });
      
      setParticipantsWithPositions(sortedPositions);
      
      // End animation after sorting completes with a smooth transition
      setTimeout(() => setIsAnimating(false), 1000);
    }, 800);
    
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
