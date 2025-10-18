
import React from 'react';

interface ConfidenceIndicatorProps {
  score: number;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ score }) => {
  const percentage = Math.round(score * 100);
  let colorClass = 'bg-success';
  if (percentage < 80) colorClass = 'bg-warning';
  if (percentage < 60) colorClass = 'bg-danger';

  let text = 'High Confidence';
  if (percentage < 80) text = 'Medium Confidence';
  if (percentage < 60) text = 'Low Confidence';

  return (
    <div className="flex items-center space-x-2" title={`Confidence Score: ${percentage}%`}>
      <div className="w-24 bg-gray-200 rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="text-sm font-medium text-on-surface-secondary">{text}</span>
    </div>
  );
};

export default ConfidenceIndicator;
