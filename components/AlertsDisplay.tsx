
import React from 'react';
import { Alert } from '../types';

interface AlertsDisplayProps {
  alerts: Alert[];
}

const AlertIcon: React.FC<{ severity: Alert['severity'] }> = ({ severity }) => {
    const iconPath = "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";
    let iconClass = "text-warning";
    if (severity === 'High') iconClass = "text-danger";
    if (severity === 'Low') iconClass = "text-on-surface-secondary";

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
    )
}


const AlertsDisplay: React.FC<AlertsDisplayProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="border-l-4 border-success bg-green-50 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">No critical safety alerts identified.</p>
          </div>
        </div>
      </div>
    );
  }

  const getAlertColors = (severity: Alert['severity']) => {
    switch (severity) {
      case 'High':
        return { border: 'border-danger', bg: 'bg-red-50', text: 'text-red-800' };
      case 'Medium':
        return { border: 'border-warning', bg: 'bg-yellow-50', text: 'text-yellow-800' };
      case 'Low':
        return { border: 'border-gray-400', bg: 'bg-gray-50', text: 'text-gray-800' };
    }
  };

  return (
    <div className="space-y-3">
        <h3 className="font-bold text-xl text-primary">Safety Alerts</h3>
        {alerts.map((alert, index) => {
            const colors = getAlertColors(alert.severity);
            return (
            <div key={index} className={`border-l-4 ${colors.border} ${colors.bg} p-4 rounded-r-lg`}>
                <div className="flex">
                <div className="flex-shrink-0">
                    <AlertIcon severity={alert.severity}/>
                </div>
                <div className="ml-3">
                    <p className={`text-sm font-bold ${colors.text}`}>{alert.severity} Risk: {alert.type}</p>
                    <p className={`mt-1 text-sm ${colors.text}`}>{alert.description}</p>
                </div>
                </div>
            </div>
            );
        })}
    </div>
  );
};

export default AlertsDisplay;
