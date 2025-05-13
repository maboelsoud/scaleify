
import { gemini20FlashLite, googleAI } from "@genkit-ai/googleai";
import { Genkit, genkit } from "genkit";
import { ConvoHistory } from "../models/store";
import { systemInstruction } from "./systemPrompt";
import { answerSchema } from "./schema";

let _ai: Genkit | null;

function getAi() {
  if (!_ai) {
    _ai = genkit({
      plugins: [googleAI({
        apiKey: process.env.GEMINI_API_KEY,
      })],
      // model: gemini20Flash
      model: gemini20FlashLite
    })
  }
  return _ai;
}

export async function getGeminiResponse(messages: ConvoHistory) {
  const ai = getAi();

  const prompt = JSON.stringify(messages);
  console.log("🚀 ~ gemini.ts:27 ~ getGeminiResponse ~ prompt:", prompt);
  const { output } = await ai.generate({
    system: systemInstruction,
    prompt,

    output: { schema: answerSchema},
  });

  console.log("🚀 ~ gemini.ts:43 ~ getGeminiResponse ~ output:", output);

  return output;

}