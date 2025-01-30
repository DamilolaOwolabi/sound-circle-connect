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
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          analyserRef.current.smoothingTimeConstant = 0.7;
          
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          
          const analyzeAudio = () => {
            if (!analyserRef.current || !canvasRef.current) return;
            
            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;

            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            
            const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
            const normalizedLevel = Math.min(average / 100, 1);
            setAudioLevel(normalizedLevel);
            
            // Clear canvas
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            
            // Draw waveform
            ctx.beginPath();
            ctx.strokeStyle = isAudioOn ? '#22c55e' : '#ef4444';
            ctx.lineWidth = 2;
            
            const sliceWidth = canvasRef.current.width / dataArray.length;
            let x = 0;
            
            ctx.moveTo(0, canvasRef.current.height / 2);
            
            for (let i = 0; i < dataArray.length; i++) {
              const v = dataArray[i] / 128.0;
              const y = (v * canvasRef.current.height) / 2;
              
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
              
              x += sliceWidth;
            }
            
            ctx.lineTo(canvasRef.current.width, canvasRef.current.height / 2);
            ctx.stroke();
            
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
    <div className="relative w-full h-full">
      <audio
        ref={audioRef}
        autoPlay
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        width={300}
        height={50}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-transform duration-75",
          isAudioOn && audioLevel > 0.05 && "animate-subtle-vibrate"
        )}
        style={{
          transform: `scale(${1 + audioLevel * 0.1})`,
        }}
      />
    </div>
  );
};

export default AudioStream;