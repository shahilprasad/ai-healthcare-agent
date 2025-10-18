
import React from 'react';
import { Suggestion } from '../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <h4 className="font-bold text-lg text-on-surface">{suggestion.problem}</h4>
      <p className="mt-2 bg-secondary/10 text-secondary font-semibold p-2 rounded-md">
        <strong>Suggestion:</strong> {suggestion.suggestion} {suggestion.dose && `(${suggestion.dose})`}
      </p>
      <div className="mt-3 text-sm space-y-2 text-on-surface-secondary">
        <p><strong>Rationale:</strong> {suggestion.rationale}</p>
        <p><strong>Monitoring:</strong> {suggestion.monitoring}</p>
        {suggestion.citations.length > 0 && (
          <p><strong>Citations:</strong> {suggestion.citations.join(', ')}</p>
        )}
      </div>
    </div>
  );
};

export default SuggestionCard;
