import { useState, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

export const useRecording = (stream: MediaStream | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = () => {
    if (!stream) {
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "No media stream available to record.",
      });
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `recording-${new Date().toISOString()}.webm`;
        a.click();
        window.URL.revokeObjectURL(url);
        setRecordedChunks([]);
        
        toast({
          title: "Recording Saved",
          description: "Your recording has been downloaded.",
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('Recording started');
      
      toast({
        title: "Recording Started",
        description: "Your meeting is now being recorded.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Recording stopped');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return {
    isRecording,
    toggleRecording,
  };
};