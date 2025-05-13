

import { openAI, gpt41Nano } from "genkitx-openai"
import { Genkit, genkit } from "genkit";
import { ConvoHistory } from "../models/store";
import { systemInstruction } from "./systemPrompt";
import { answerSchema } from "./schema";

let _ai: Genkit | null;

function getOpenAi() {
  if (!_ai) {
    _ai = genkit({
      plugins: [openAI({
        apiKey: process.env.OPENAI_API_KEY,
      })],
      // model: gpt4o
      model: gpt41Nano
    })
  }
  return _ai;
}

export async function getChatGPTResponse(messages: ConvoHistory) {
  const ai = getOpenAi();

  const prompt = "continue the based on the previous conversation \n" + JSON.stringify(messages);
  console.log("🚀 ~ openai.ts:27 ~ getChatGPTResponse ~ prompt:", prompt);
  const { output } = await ai.generate({
    system: systemInstruction,
    prompt,
    output: { schema: answerSchema},
  });

  console.log("🚀 ~ openai.ts:43 ~ getChatGPTResponse ~ output:", output);

  return output;

}