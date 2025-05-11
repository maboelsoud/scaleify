
import { GoogleGenAI,  } from '@google/genai';


let _ai: GoogleGenAI | null = null;
const config = {
  responseMimeType: 'text/plain',
};
if (!process.env.GEMINI_MODEL) {
  throw 'GEMINI_MODEL is not set';
}
const geminiModel:string = process.env.GEMINI_MODEL;

export function getGemini() {
  if (!_ai) {
    _ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

  }
  return _ai;
}

export async function getGeminiResponse(prompt: string) {
  const ai = getGemini();

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: geminiModel,
    config,
    contents,
  });
  return response.text;

}
