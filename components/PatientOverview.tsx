
import React from 'react';
import { Patient } from '../types';

interface PatientOverviewProps {
  patient: Patient;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-surface rounded-lg shadow-sm p-4 border border-gray-200">
    <h3 className="font-bold text-lg mb-2 text-primary">{title}</h3>
    <div className="text-on-surface-secondary space-y-1">{children}</div>
  </div>
);

const PatientOverview: React.FC<PatientOverviewProps> = ({ patient }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-on-surface">
        {patient.name} <span className="font-normal text-xl text-on-surface-secondary">({patient.age}, {patient.gender})</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard title="Vitals">
          <p><strong>BP:</strong> {patient.vitals.bloodPressure}</p>
          <p><strong>HR:</strong> {patient.vitals.heartRate}</p>
          <p><strong>Temp:</strong> {patient.vitals.temperature}</p>
          <p><strong>RR:</strong> {patient.vitals.respiratoryRate}</p>
        </InfoCard>

        <InfoCard title="Allergies">
          {patient.allergies.length > 0 ? (
            <ul className="list-disc list-inside text-danger font-semibold">
              {patient.allergies.map((allergy, index) => <li key={index}>{allergy}</li>)}
            </ul>
          ) : <p>None known</p>}
        </InfoCard>

        <InfoCard title="Current Medications">
          <ul>
            {patient.medications.map((med, index) => (
              <li key={index}><strong>{med.name}</strong> - {med.dosage} {med.frequency}</li>
            ))}
          </ul>
        </InfoCard>
      </div>
      <InfoCard title="Clinical Notes">
        <p className="whitespace-pre-wrap">{patient.notes}</p>
      </InfoCard>
    </div>
  );
};

export default PatientOverview;
