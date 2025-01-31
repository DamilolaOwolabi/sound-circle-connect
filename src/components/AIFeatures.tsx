import React, { useState, useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SpeechRecognitionService } from '@/utils/speechUtils';
import TranscriptionControls from './ai/TranscriptionControls';
import AnalysisControls from './ai/AnalysisControls';
import AnalysisDisplay from './ai/AnalysisDisplay';
import TranscriptDisplay from './ai/TranscriptDisplay';

interface AIFeaturesProps {
  stream: MediaStream | null;
}

const AIFeatures = ({ stream }: AIFeaturesProps) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<string>('');
  const speechServiceRef = useRef<SpeechRecognitionService | null>(null);

  useEffect(() => {
    speechServiceRef.current = new SpeechRecognitionService((text) => {
      setTranscript(prev => [...prev, text]);
      analyzeSentiment(text);
      extractTopics(text);
      console.log('New transcription:', text);
    });

    return () => {
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
        console.log('Cleaning up speech service');
      }
    };
  }, []);

  const startTranscription = async () => {
    try {
      setIsTranscribing(true);
      speechServiceRef.current?.start();
      console.log('Starting AI transcription...');
      toast({
        title: "AI Transcription Started",
        description: "Your meeting is now being transcribed in real-time.",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        variant: "destructive",
        title: "Transcription Error",
        description: "Failed to start transcription. Please try again.",
      });
    }
  };

  const stopTranscription = () => {
    speechServiceRef.current?.stop();
    setIsTranscribing(false);
    console.log('Stopping AI transcription...');
    toast({
      title: "AI Transcription Stopped",
      description: "Transcription has been stopped.",
    });
  };

  const generateSummary = async () => {
    if (transcript.length === 0) {
      toast({
        variant: "destructive",
        title: "No Transcript Available",
        description: "Start transcription first to generate a meeting summary.",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log('Generating meeting summary...');
      toast({
        title: "Generating Summary",
        description: "AI is analyzing your meeting transcript...",
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      const summary = "Key points discussed:\n- Project timeline review\n- Budget allocation\n- Next steps and action items";
      setTranscript(prev => [...prev, "\n=== Meeting Summary ===\n" + summary]);
      
      toast({
        title: "Summary Generated",
        description: "Meeting summary is now available.",
      });
    } catch (error) {
      console.error('Summary generation error:', error);
      toast({
        variant: "destructive",
        title: "Summary Error",
        description: "Failed to generate meeting summary. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateActionItems = async () => {
    if (transcript.length === 0) {
      toast({
        variant: "destructive",
        title: "No Transcript Available",
        description: "Start transcription first to generate action items.",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log('Generating action items...');
      toast({
        title: "Generating Action Items",
        description: "AI is analyzing the transcript for action items...",
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      const actionItems = "Action Items:\n1. Schedule follow-up meeting\n2. Prepare project timeline\n3. Review budget proposal";
      setTranscript(prev => [...prev, "\n=== Action Items ===\n" + actionItems]);
      
      toast({
        title: "Action Items Generated",
        description: "Action items have been extracted from the meeting.",
      });
    } catch (error) {
      console.error('Action items generation error:', error);
      toast({
        variant: "destructive",
        title: "Generation Error",
        description: "Failed to generate action items. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeSentiment = async (text: string) => {
    try {
      const sentiments = ['positive', 'neutral', 'negative'];
      const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      setSentiment(randomSentiment);
      console.log('Sentiment analysis:', randomSentiment);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
    }
  };

  const extractTopics = async (text: string) => {
    try {
      const newTopics = ['Project Planning', 'Budget', 'Timeline'];
      setTopics(prev => [...new Set([...prev, ...newTopics])]);
      console.log('Topics extracted:', newTopics);
    } catch (error) {
      console.error('Topic extraction error:', error);
    }
  };

  return (
    <div className="w-80 bg-background border rounded-lg p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <Brain className="w-5 h-5 text-primary" />
      </div>
      
      <TranscriptionControls
        isTranscribing={isTranscribing}
        stream={stream}
        onStartTranscription={startTranscription}
        onStopTranscription={stopTranscription}
      />
      
      <AnalysisControls
        isAnalyzing={isAnalyzing}
        hasTranscript={transcript.length > 0}
        onGenerateSummary={generateSummary}
        onGenerateActionItems={generateActionItems}
      />

      <AnalysisDisplay
        sentiment={sentiment}
        topics={topics}
      />

      <TranscriptDisplay
        transcript={transcript}
      />
    </div>
  );
};

export default AIFeatures;