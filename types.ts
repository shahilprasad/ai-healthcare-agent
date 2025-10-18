
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  vitals: {
    heartRate: string;
    bloodPressure: string;
    temperature: string;
    respiratoryRate: string;
  };
  allergies: string[];
  medications: { name: string; dosage: string; frequency: string }[];
  labResults: { test: string; value: string; range: string }[];
  notes: string;
}

export interface Suggestion {
  problem: string;
  suggestion: string;
  dose?: string;
  rationale: string;
  citations: string[];
  monitoring: string;
}

export interface Alert {
  type: 'Drug Interaction' | 'Allergy' | 'Dose Warning' | 'Contradiction';
  severity: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface SbarSummary {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

export interface CarePlanResponse {
  patientId: string;
  sbarSummary: SbarSummary;
  suggestions: Suggestion[];
  alerts: Alert[];
  uncertainty: string;
  confidenceScore: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
