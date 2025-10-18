
import React, { useState } from 'react';
import { CarePlanResponse } from '../types';
import SuggestionCard from './SuggestionCard';
import AlertsDisplay from './AlertsDisplay';
import ConfidenceIndicator from './ConfidenceIndicator';

interface CarePlanDisplayProps {
  carePlan: CarePlanResponse;
}

const SbarSection: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <div>
        <h4 className="font-bold text-primary">{title}</h4>
        <p className="mt-1 text-on-surface-secondary">{content}</p>
    </div>
);

const CarePlanDisplay: React.FC<CarePlanDisplayProps> = ({ carePlan }) => {
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="mt-6 bg-surface rounded-xl shadow-lg border border-gray-200 p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-on-surface">AI Generated Care Plan</h3>
          <p className="text-on-surface-secondary">For patient: {carePlan.patientId}</p>
        </div>
        <div className="flex items-center space-x-4">
            <ConfidenceIndicator score={carePlan.confidenceScore} />
             <button 
                onClick={() => setShowJson(!showJson)}
                className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition"
            >
                {showJson ? 'View Formatted' : 'View JSON'}
            </button>
        </div>
      </div>
      
      {showJson ? (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{JSON.stringify(carePlan, null, 2)}</code>
        </pre>
      ) : (
        <>
          <AlertsDisplay alerts={carePlan.alerts} />

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <h3 className="font-bold text-xl mb-3 text-primary">SBAR Summary</h3>
            <div className="space-y-3">
                <SbarSection title="Situation" content={carePlan.sbarSummary.situation} />
                <SbarSection title="Background" content={carePlan.sbarSummary.background} />
                <SbarSection title="Assessment" content={carePlan.sbarSummary.assessment} />
                <SbarSection title="Recommendation" content={carePlan.sbarSummary.recommendation} />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xl mb-3 text-primary">Suggestions</h3>
            <div className="space-y-4">
              {carePlan.suggestions.map((suggestion, index) => (
                <SuggestionCard key={index} suggestion={suggestion} />
              ))}
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
             <h4 className="font-bold text-primary">Uncertainty & Missing Context</h4>
             <p className="mt-1 text-on-surface-secondary">{carePlan.uncertainty}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default CarePlanDisplay;
