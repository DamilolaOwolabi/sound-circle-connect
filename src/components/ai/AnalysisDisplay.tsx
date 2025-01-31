import React from 'react';

interface AnalysisDisplayProps {
  sentiment: string;
  topics: string[];
}

const AnalysisDisplay = ({ sentiment, topics }: AnalysisDisplayProps) => {
  return (
    <>
      {sentiment && (
        <div className="text-sm">
          <span className="font-medium">Current Sentiment: </span>
          <span className={`capitalize ${
            sentiment === 'positive' ? 'text-green-500' :
            sentiment === 'negative' ? 'text-red-500' :
            'text-yellow-500'
          }`}>
            {sentiment}
          </span>
        </div>
      )}

      {topics.length > 0 && (
        <div className="text-sm">
          <span className="font-medium">Key Topics:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {topics.map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 rounded-full text-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AnalysisDisplay;