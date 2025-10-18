
import React from 'react';
import { Patient } from '../types';

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ patients, selectedPatientId, onSelectPatient }) => {
  return (
    <aside className="w-full md:w-80 bg-surface border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-primary">Patients</h2>
      <nav className="space-y-2">
        {patients.map((patient) => (
          <button
            key={patient.id}
            onClick={() => onSelectPatient(patient.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
              selectedPatientId === patient.id
                ? 'bg-secondary text-white shadow-md'
                : 'hover:bg-background'
            }`}
          >
            <div className="font-semibold">{patient.name}</div>
            <div className="text-sm opacity-80">{patient.age}, {patient.gender}</div>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default PatientSelector;
