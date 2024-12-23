import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioStreamProps {
  stream: MediaStream | null;
  isAudioOn: boolean;
  volume?: number;
}

const AudioStream = ({ stream, isAudioOn, volume = 1 }: AudioStreamProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (stream && audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.volume = volume;
      
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach(track => {
          track.enabled = isAudioOn;
          console.log(`Audio track ${track.label} enabled:`, isAudioOn);
        });

        // Initialize Web Audio API
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          
          const analyzeAudio = () => {
            if (!analyserRef.current) return;
            
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Calculate average volume level
            const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
            const normalizedLevel = Math.min(average / 128, 1);
            setAudioLevel(normalizedLevel);
            
            animationFrameRef.current = requestAnimationFrame(analyzeAudio);
          };
          
          analyzeAudio();
        }
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stream, isAudioOn, volume]);

  if (!stream) {
    return null;
  }

  return (
    <div className="relative">
      <audio
        ref={audioRef}
        autoPlay
        playsInline
      />
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-transform duration-75",
          isAudioOn && audioLevel > 0.1 && "animate-subtle-vibrate"
        )}
        style={{
          transform: `scale(${1 + audioLevel * 0.05})`,
        }}
      />
    </div>
  );
};

export default AudioStream;