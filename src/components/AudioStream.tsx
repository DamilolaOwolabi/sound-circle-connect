import React, { useEffect, useRef } from 'react';

interface AudioStreamProps {
  stream: MediaStream | null;
  isAudioOn: boolean;
  volume?: number;
}

const AudioStream = ({ stream, isAudioOn, volume = 1 }: AudioStreamProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

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
      }
    }
  }, [stream, isAudioOn, volume]);

  if (!stream) {
    return null;
  }

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
    />
  );
};

export default AudioStream;