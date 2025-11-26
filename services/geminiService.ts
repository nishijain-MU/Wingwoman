import { GoogleGenAI } from "@google/genai";
import { 
  SYSTEM_INSTRUCTION_CORE, 
  PROMPT_ASSESSMENT_SYSTEM, 
  PROMPT_ICEBREAKER_SYSTEM, 
  PROMPT_ANALYZER_SYSTEM, 
  PROMPT_AMA_SYSTEM 
} from "./prompts";

const createClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper to convert file to base64
export const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 1. Profile Assessment
export const analyzeProfile = async (files: File[], platform: string) => {
  const ai = createClient();
  const imageParts = await Promise.all(files.map(f => fileToPart(f)));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        ...imageParts,
        { text: `Analyze this ${platform} profile. Follow the system instructions for assessment.` }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_CORE + "\n" + PROMPT_ASSESSMENT_SYSTEM,
      temperature: 0.7,
    }
  });

  return response.text;
};

// 2. Icebreaker Generator
export const generateIcebreakers = async (interest: string, matchContext: string) => {
  const ai = createClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [{ text: `Generate icebreakers for interest: ${interest}. Context about match: ${matchContext}. Remember to return ONLY JSON.` }]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_CORE + "\n" + PROMPT_ICEBREAKER_SYSTEM,
      temperature: 0.8,
      responseMimeType: "application/json"
    }
  });

  // Parse JSON response
  try {
    const text = response.text;
    // Remove any potential markdown wrapping if the model ignores instruction
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse Icebreaker JSON", e);
    throw new Error("Failed to generate valid icebreakers.");
  }
};

// 3. Prompt Analyzer
export const analyzePrompt = async (text: string, file: File | null) => {
  const ai = createClient();
  const parts: any[] = [{ text: `Analyze this prompt. Input text/context: ${text}` }];
  
  if (file) {
    const imgPart = await fileToPart(file);
    parts.unshift(imgPart);
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_CORE + "\n" + PROMPT_ANALYZER_SYSTEM,
      temperature: 0.7,
    }
  });
  
  return response.text;
};

// 4. AMA Assistant
export const askAma = async (question: string, history: {role: 'user'|'model', text: string}[]) => {
  const ai = createClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', 
    contents: {
      parts: [{ text: question }]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_CORE + "\n" + PROMPT_AMA_SYSTEM,
    }
  });

  return response.text;
};