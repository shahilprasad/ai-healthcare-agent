
import React, { useState, useEffect, useCallback } from 'react';
import { Patient, CarePlanResponse, ChatMessage } from './types';
import { MOCK_PATIENTS } from './constants';
import { generateCarePlan, startChatSession } from './services/geminiService';
import PatientSelector from './components/PatientSelector';
import PatientOverview from './components/PatientOverview';
import CarePlanDisplay from './components/CarePlanDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import ErrorDisplay from './components/ErrorDisplay';
import { Chat } from '@google/genai';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [patients] = useState<Patient[]>(MOCK_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [carePlan, setCarePlan] = useState<CarePlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New state for chat
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  useEffect(() => {
    if (patients.length > 0) {
      setSelectedPatient(patients[0]);
    }
  }, [patients]);

  const handleSelectPatient = useCallback((patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setCarePlan(null);
      setError(null);
      // Reset chat
      setChatSession(null);
      setChatHistory([]);
    }
  }, [patients]);

  const handleGeneratePlan = async () => {
    if (!selectedPatient) return;

    setIsLoading(true);
    setError(null);
    setCarePlan(null);
    // Reset chat
    setChatSession(null);
    setChatHistory([]);

    try {
      const plan = await generateCarePlan(selectedPatient);
      setCarePlan(plan);
      // Start a new chat session with the context
      const chat = startChatSession(selectedPatient, plan);
      setChatSession(chat);
    } catch (err) {
      console.error("Error generating care plan:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!chatSession || !message.trim() || isChatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const response = await chatSession.sendMessage({ message });
      const modelMessage: ChatMessage = { role: 'model', content: response.text };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error("Error sending chat message:", err);
      const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header />
      <main className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
        <PatientSelector
          patients={patients}
          selectedPatientId={selectedPatient?.id || ''}
          onSelectPatient={handleSelectPatient}
        />
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {selectedPatient ? (
            <div className="space-y-6">
              <PatientOverview patient={selectedPatient} />
              <div className="text-center">
                <button
                  onClick={handleGeneratePlan}
                  disabled={isLoading}
                  className="bg-primary hover:bg-secondary text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Generating Suggestions...</span>
                    </>
                  ) : (
                    'Generate AI Care Plan Suggestions'
                  )}
                </button>
              </div>
              {error && <ErrorDisplay message={error} />}
              {carePlan && !isLoading && (
                <>
                  <CarePlanDisplay carePlan={carePlan} />
                  <ChatInterface 
                    chatHistory={chatHistory}
                    onSendMessage={handleSendMessage}
                    isLoading={isChatLoading}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-on-surface-secondary">Select a patient to begin.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
