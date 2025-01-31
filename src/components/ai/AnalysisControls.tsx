import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, List } from 'lucide-react';

interface AnalysisControlsProps {
  isAnalyzing: boolean;
  hasTranscript: boolean;
  onGenerateSummary: () => void;
  onGenerateActionItems: () => void;
}

const AnalysisControls = ({
  isAnalyzing,
  hasTranscript,
  onGenerateSummary,
  onGenerateActionItems,
}: AnalysisControlsProps) => {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={onGenerateSummary}
        disabled={!hasTranscript || isAnalyzing}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Generate Summary
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={onGenerateActionItems}
        disabled={!hasTranscript || isAnalyzing}
      >
        <List className="w-4 h-4 mr-2" />
        Generate Action Items
      </Button>
    </div>
  );
};

export default AnalysisControls;