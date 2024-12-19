// Import the type definitions from our speech.d.ts file
import type { SpeechRecognition } from '@/types/speech';

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;

  constructor(private onTranscript: (text: string) => void) {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      
      this.onTranscript(transcript);
      console.log('New transcript:', transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
  }

  start() {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      return;
    }

    if (!this.isListening) {
      this.recognition.start();
      this.isListening = true;
      console.log('Speech recognition started');
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('Speech recognition stopped');
    }
  }
}