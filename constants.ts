
import { Patient } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'PAT001',
    name: 'John Doe',
    age: 72,
    gender: 'Male',
    vitals: {
      heartRate: '98 bpm',
      bloodPressure: '145/90 mmHg',
      temperature: '38.5°C',
      respiratoryRate: '22 breaths/min',
    },
    allergies: ['Penicillin'],
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { name: 'Warfarin', dosage: '5mg', frequency: 'Once daily' },
    ],
    labResults: [
      { test: 'WBC', value: '15.2 x10^9/L', range: '4.5-11.0' },
      { test: 'Creatinine', value: '1.4 mg/dL', range: '0.6-1.2' },
      { test: 'INR', value: '2.5', range: '2.0-3.0' },
    ],
    notes: 'Admitted with shortness of breath and cough. Chest X-ray suggests pneumonia. Patient has a history of Type 2 Diabetes and Hypertension.',
  },
  {
    id: 'PAT002',
    name: 'Jane Smith',
    age: 65,
    gender: 'Female',
    vitals: {
      heartRate: '110 bpm',
      bloodPressure: '100/60 mmHg',
      temperature: '37.0°C',
      respiratoryRate: '18 breaths/min',
    },
    allergies: ['None known'],
    medications: [
      { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily' },
    ],
    labResults: [
      { test: 'Hemoglobin', value: '9.5 g/dL', range: '12.0-15.5' },
      { test: 'Potassium', value: '3.2 mEq/L', range: '3.5-5.0' },
    ],
    notes: 'Presents with chest pain and palpitations. EKG shows atrial fibrillation with rapid ventricular response. History of coronary artery disease.',
  },
   {
    id: 'PAT003',
    name: 'Emily White',
    age: 81,
    gender: 'Female',
    vitals: {
      heartRate: '75 bpm',
      bloodPressure: '150/85 mmHg',
      temperature: '36.8°C',
      respiratoryRate: '16 breaths/min',
    },
    allergies: ['Sulfa drugs', 'Codeine'],
    medications: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' },
      { name: 'Furosemide', dosage: '40mg', frequency: 'Once daily' },
      { name: 'Donepezil', dosage: '10mg', frequency: 'Once daily' },
    ],
    labResults: [
      { test: 'Sodium', value: '132 mEq/L', range: '136-145' },
      { test: 'BUN', value: '28 mg/dL', range: '7-20' },
    ],
    notes: 'Admitted due to increased confusion and a fall at home. Patient has a history of dementia and heart failure. Currently stable but seems disoriented.',
  },
];
