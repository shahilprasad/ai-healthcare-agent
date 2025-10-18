
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Patient, CarePlanResponse } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: systemInstruction
    }
  });

  return chat;
}

export async function generateCarePlan(patient: Patient): Promise<CarePlanResponse> {
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
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to generate care plan from AI model. The model may have returned an invalid format or an error occurred.");
  }
}
