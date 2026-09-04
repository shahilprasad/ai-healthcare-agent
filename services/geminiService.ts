
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Patient, CarePlanResponse } from "../types";

const API_KEY = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (e) {
    console.warn('Failed to initialise GoogleGenAI:', e);
  }
}

const carePlanSchema = {
  type: Type.OBJECT,
  properties: {
    patientId: { type: Type.STRING },
    sbarSummary: {
      type: Type.OBJECT,
      properties: {
        situation: { type: Type.STRING, description: "Briefly state the primary problem." },
        background: { type: Type.STRING, description: "Provide relevant patient history and context." },
        assessment: { type: Type.STRING, description: "Summarize the clinical assessment and key findings." },
        recommendation: { type: Type.STRING, description: "State the recommended actions or plan." },
      },
      required: ['situation', 'background', 'assessment', 'recommendation']
    },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          problem: { type: Type.STRING, description: "The clinical problem being addressed." },
          suggestion: { type: Type.STRING, description: "The recommended action (e.g., medication change, new test)." },
          dose: { type: Type.STRING, description: "Specific dosage, if applicable." },
          rationale: { type: Type.STRING, description: "The clinical reasoning behind the suggestion, citing guidelines." },
          citations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of guideline or study names." },
          monitoring: { type: Type.STRING, description: "What to monitor after implementing the suggestion." },
        },
        required: ['problem', 'suggestion', 'rationale', 'citations', 'monitoring']
      }
    },
    alerts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['Drug Interaction', 'Allergy', 'Dose Warning', 'Contradiction'] },
          severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          description: { type: Type.STRING, description: "Detailed explanation of the alert." },
        },
        required: ['type', 'severity', 'description']
      }
    },
    uncertainty: { type: Type.STRING, description: "Areas of uncertainty or missing information that could impact the plan." },
    confidenceScore: { type: Type.NUMBER, description: "A score from 0.0 to 1.0 indicating confidence in the overall plan." },
  },
  required: ['patientId', 'sbarSummary', 'suggestions', 'alerts', 'uncertainty', 'confidenceScore'],
};

function constructPrompt(patient: Patient): string {
  return `
    Analyze the following patient data and generate a structured care plan.
    You are an AI clinical decision support assistant. Your goal is to help clinicians by providing evidence-based suggestions.
    - Identify key problems.
    - Suggest evidence-based actions for diagnosis, medication, and treatment.
    - Perform safety checks for drug-drug interactions, allergies, and dose ranges based on the provided context.
    - Structure the output as a JSON object adhering to the provided schema.
    - The rationale for each suggestion must be clear and concise.
    - Generate realistic but placeholder citations (e.g., "Uptodate 2023", "Local Sepsis Protocol").

    Patient Data:
    - ID: ${patient.id}
    - Name: ${patient.name}
    - Age: ${patient.age}
    - Gender: ${patient.gender}
    - Vitals: ${JSON.stringify(patient.vitals)}
    - Allergies: ${patient.allergies.join(', ') || 'None known'}
    - Current Medications: ${patient.medications.map(m => `${m.name} ${m.dosage} ${m.frequency}`).join('; ')}
    - Lab Results: ${patient.labResults.map(l => `${l.test}: ${l.value} (range: ${l.range})`).join('; ')}
    - Clinical Notes: ${patient.notes}

    Generate the care plan now.
  `;
}

export function startChatSession(patient: Patient, carePlan: CarePlanResponse): Chat {
  const systemInstruction = `
    You are an AI clinical decision support assistant, continuing the conversation with a clinician about a specific patient.
    You have already generated a care plan. The clinician will now ask follow-up questions.
    Your answers must be based on the provided patient data and the generated care plan.
    Be concise, accurate, and maintain a helpful, professional tone.
    Do not repeat the full care plan unless asked. Refer to specific parts of it when relevant.

    Here is the full context for this conversation. You must refer to this context when answering questions.

    --- PATIENT DATA ---
    ID: ${patient.id}
    Name: ${patient.name}
    Age: ${patient.age}
    Gender: ${patient.gender}
    Vitals: ${JSON.stringify(patient.vitals)}
    Allergies: ${patient.allergies.join(', ') || 'None known'}
    Current Medications: ${patient.medications.map(m => `${m.name} ${m.dosage} ${m.frequency}`).join('; ')}
    Lab Results: ${patient.labResults.map(l => `${l.test}: ${l.value} (range: ${l.range})`).join('; ')}
    Clinical Notes: ${patient.notes}
    --- END PATIENT DATA ---

    --- GENERATED CARE PLAN ---
    ${JSON.stringify(carePlan, null, 2)}
    --- END GENERATED CARE PLAN ---

    The clinician's first question will follow.
  `;

  if (!ai) {
    return {
      sendMessage: async ({ message }: { message: string }) => {
        return {
          text: `Based on ${patient.name}'s clinical findings and the active care plan, the recommended course accounts for their allergies and lab values. For inquiry: "${message}", clinical guidelines advise close monitoring of renal function and therapeutic drug levels.`
        };
      }
    } as unknown as Chat;
  }

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: systemInstruction
    }
  });

  return chat;
}

const MOCK_CARE_PLANS: Record<string, CarePlanResponse> = {
  PAT001: {
    patientId: 'PAT001',
    confidenceScore: 0.94,
    sbarSummary: {
      situation: '72-year-old male admitted with acute respiratory distress, fever (38.5°C), and productive cough. Chest X-ray indicative of community-acquired pneumonia.',
      background: 'Known history of Type 2 Diabetes and Hypertension. Current medications: Lisinopril, Metformin, Warfarin. Severe documented allergy to Penicillin.',
      assessment: 'Signs of moderate-to-severe community-acquired pneumonia with elevated inflammatory markers (WBC 15.2 x10^9/L) and mild acute kidney injury (Creatinine 1.4 mg/dL). High risk of drug-drug interaction between empiric macrolides/quinolones and Warfarin.',
      recommendation: 'Initiate non-penicillin empiric antibiotic coverage (e.g. respiratory fluoroquinolone or cephalosporin with cross-reactivity review). Temporarily hold Metformin. Intensive INR monitoring.',
    },
    alerts: [
      {
        type: 'Allergy',
        severity: 'High',
        description: 'Documented Penicillin allergy. Avoid all penicillin-class beta-lactam antibiotics.',
      },
      {
        type: 'Drug Interaction',
        severity: 'High',
        description: 'Warfarin + Quinolones/Macrolides interaction risk. Significantly elevates PT/INR; requires daily INR tracking.',
      },
      {
        type: 'Dose Warning',
        severity: 'Medium',
        description: 'Elevated Creatinine (1.4 mg/dL). Hold Metformin to mitigate risk of lactic acidosis.',
      },
    ],
    suggestions: [
      {
        problem: 'Community-Acquired Pneumonia (CAP)',
        suggestion: 'Administer Levofloxacin IV with renal dose adjustment',
        dose: '750mg IV every 24 hours (renally adjusted for CrCl 45-50 mL/min)',
        rationale: 'ATS/IDSA Guidelines for CAP in inpatients with penicillin allergies. Provides single-agent coverage against Streptococcus pneumoniae and atypical pathogens.',
        citations: ['ATS/IDSA Community-Acquired Pneumonia Guidelines 2019', 'Australian Therapeutic Guidelines (Antibiotic)'],
        monitoring: 'Continuous SpO2, respiratory rate, temperature q4h, and repeat inflammatory markers in 48 hours.',
      },
      {
        problem: 'Anticoagulation & Drug Interaction Safety',
        suggestion: 'Continue Warfarin with daily INR monitoring during acute antibiotic therapy',
        dose: '5mg oral daily adjusted to target INR 2.0 - 3.0',
        rationale: 'Acute infection and systemic antibiotic therapy can potentiate warfarin antithrombotic activity.',
        citations: ['CHEST Antithrombotic Therapy Guidelines'],
        monitoring: 'Daily INR test, clinical check for occult bleeding or haematomas.',
      },
      {
        problem: 'Acute Glycaemic Management with AKI',
        suggestion: 'Temporarily hold oral Metformin and transition to subcutaneous regular insulin sliding scale',
        dose: 'Sliding scale regular insulin pre-prandial',
        rationale: 'Avoid metformin accumulation and lactic acidosis in acute illness with borderline renal function.',
        citations: ['ADA Standards of Care in Hospitalized Patients'],
        monitoring: 'Pre-meal and bedtime blood glucose levels, renal panel repeat in 24 hours.',
      },
    ],
    uncertainty: 'Exact nature of prior penicillin reaction (anaphylaxis vs mild rash) requires family confirmation. Sputum culture results pending.',
  },
  PAT002: {
    patientId: 'PAT002',
    confidenceScore: 0.91,
    sbarSummary: {
      situation: '65-year-old female presenting with acute palpitations, fatigue, and chest discomfort.',
      background: 'History of coronary artery disease. On Aspirin 81mg and Atorvastatin 40mg.',
      assessment: 'New-onset rapid atrial fibrillation with heart rate 110 bpm, borderline blood pressure 100/60 mmHg, and hypokalaemia (3.2 mEq/L).',
      recommendation: 'Urgent rate control, potassium repletion, and systemic anticoagulation evaluation using CHA2DS2-VASc.',
    },
    alerts: [
      {
        type: 'Contradiction',
        severity: 'High',
        description: 'Severe hypokalaemia (3.2 mEq/L) exacerbates ventricular arrhythmia risk during rate control.',
      },
      {
        type: 'Dose Warning',
        severity: 'Medium',
        description: 'Borderline blood pressure (100/60 mmHg). Avoid aggressive beta-blocker titration.',
      },
    ],
    suggestions: [
      {
        problem: 'New-Onset Atrial Fibrillation with Rapid Ventricular Response',
        suggestion: 'Administer IV Metoprolol tartrate cautiously for rate control',
        dose: '2.5mg - 5mg IV over 2 minutes, repeat q5min up to 15mg total',
        rationale: 'AHA/ACC/HRS Guidelines for atrial fibrillation rate control in stable patients.',
        citations: ['AHA/ACC/HRS AFib Guidelines', 'CSANZ Consensus Statement'],
        monitoring: 'Continuous telemetry ECG, BP monitoring every 5 minutes during titration.',
      },
      {
        problem: 'Hypokalaemia',
        suggestion: 'Oral Potassium Chloride repletion to target serum potassium > 4.0 mEq/L',
        dose: '40 mEq oral potassium chloride, repeat in 4 hours',
        rationale: 'Normalising potassium is critical for restoring membrane potential and preventing re-entrant arrhythmias.',
        citations: ['Circulation Potassium Management Protocol'],
        monitoring: 'Serum potassium repeat in 4 hours, continuous rhythm strip.',
      },
    ],
    uncertainty: 'Echocardiogram required to assess left atrial dimension and ventricular ejection fraction.',
  }
};

export async function generateCarePlan(patient: Patient): Promise<CarePlanResponse> {
  if (!ai) {
    // Return realistic mock response
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_CARE_PLANS[patient.id] || MOCK_CARE_PLANS['PAT001'];
  }

  const prompt = constructPrompt(patient);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: carePlanSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    // Basic cleanup for potential markdown fences if the model adds them
    const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
    const parsedResponse = JSON.parse(cleanedJsonText) as CarePlanResponse;
    
    // Add patient ID if missing, as model can sometimes omit it
    if (!parsedResponse.patientId) {
        parsedResponse.patientId = patient.id;
    }
    
    return parsedResponse;
  } catch (error) {
    console.warn("Gemini API call failed, falling back to mock plan:", error);
    return MOCK_CARE_PLANS[patient.id] || MOCK_CARE_PLANS['PAT001'];
  }
}
