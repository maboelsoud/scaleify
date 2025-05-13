

import { openAI, gpt41Nano } from "genkitx-openai"
import { Genkit, genkit } from "genkit";
import { ConvoHistory } from "../models/store";
import { systemInstruction } from "./systemPrompt";
import { answerSchema } from "./schema";

type aioutput = {
  type: "text" | "fetch" | "execute";
  expectReply: boolean;
  text?: string;
  fetch?: string;
  execute?: string;
};
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

export async function getChatGPTResponse(messages: ConvoHistory) : Promise<aioutput>{
  const ai = getOpenAi();

  const prompt = "continue the based on the previous conversation \n" + JSON.stringify(messages);
  console.log("🚀 ~ openai.ts:27 ~ getChatGPTResponse ~ prompt:", prompt);
  const { output } = await ai.generate({
    system: systemInstruction,
    prompt,
    output: { schema: answerSchema},
  });
  // const { response, stream } = await ai.generateStream({
  //   system: systemInstruction,
  //   prompt,
  //   output: { schema: answerSchema},
  // });
  // let outputString = "";
  // for await (const chunk of stream) {
  //   // chunk.content
  //   console.log("🚀 ~ openai.ts:45 ~ forawait ~ chunk.text:", chunk.text);
  //   // outputString += chunk.text;
  //   // console.log("🚀 ~ openai.ts:46 ~ forawait ~ chunk.content:", chunk.content);
  //   // console.log("🚀 ~ openai.ts:40 ~ forawait ~ chunk:", chunk);
  //   // console.log("🚀 ~ openai.ts:39 ~ getChatGPTResponse ~ response:", response);
  //   // console.log(chunk.text);
  // }

  // const output2 = (await response).text;

  // const output3 = JSON.parse(output2);
  // console.log("🚀 ~ openai.ts:60 ~ getChatGPTResponse ~ output3:", output3);
  // console.log("🚀 ~ openai.ts:43 ~ getChatGPTResponse ~ output2:", output2);
  console.log("🚀 ~ openai.ts:43 ~ getChatGPTResponse ~ output:", output);

  return output as unknown as aioutput;

}