import { Request, Response, Router } from "express";
import OpenAI from "openai";


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router = Router();


router.post("/chat/completions", async (req: Request, resp: Response)=> {
// console.log("🚀 ~ vapiRoutes.ts:8 ~ router.post ~ req:", req);


  // resp.json("this is a test response");

  try {
    const {
      model,
      messages,
      max_tokens,
      temperature,
      stream,
      call,
      ...restParams
    } = req.body;
    console.log("🚀 ~ vapiRoutes.ts:29 ~ router.post ~ model:", model);
    console.log("🚀 ~ vapiRoutes.ts:30 ~ router.post ~ restParams:", restParams);
    console.log("🚀 ~ vapiRoutes.ts:30 ~ router.post ~ call:", call);
    console.log("🚀 ~ vapiRoutes.ts:30 ~ router.post ~ messages:", messages);

    const textFromFSM = "Thanks for calling Urban Flow! Are you looking to book a massage or chiropractic session?";

    const completionOld = {
      id: "customcmpl-xyz",
      object: "chat.completion",
      created: Date.now(),
      model: "genkit-custom-llm",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: textFromFSM,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: textFromFSM.split(" ").length,
        total_tokens: textFromFSM.split(" ").length,
      },
    };

    // resp.type('application/json').send(completion);
    // const response = await client.responses.create({
    //     model: "gpt-4.1",
    //     instructions: "Talk like a pirate.",
    //     input: "Are semicolons optional in JavaScript?",
    // });

  const openAIResponse = await client.chat.completions.create({
    // messages: [{ role: "developer", content: "You are a helpful assistant." }],
    // ...restParams,
    messages,
    model,
    // model: "gpt-4.1",
    max_tokens: max_tokens || 150,
    temperature: temperature || 0.7,
    stream: true,
    store: true,
  });
    console.log("🚀 ~ vapiRoutes.ts:75 ~ router.post ~ completion:", openAIResponse);
    // console.log("🚀 ~ vapiRoutes.ts:84 ~ router.post ~ completion.choices[0].message:", openAIResponse.choices[0].message);

    resp.setHeader("Content-Type", "text/event-stream");
    resp.setHeader("Cache-Control", "no-cache");
    resp.setHeader("Connection", "keep-alive");

    for await (const chunk of openAIResponse as unknown as AsyncIterable<any>) {
      console.log(`data: ${JSON.stringify(chunk)}\n\n`);

      resp.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    resp.write("data: [DONE]\n\n");
    resp.end();
    // resp.status(200).json(completion);

  } catch (e) {
    console.log(e);
    resp.status(500).json({error: e});
  }
});
      // console.log("🚀 ~ vapiRoutes.ts:30 ~ router.post ~ stream:", stream);
      // console.log("🚀 ~ vapiRoutes.ts:30 ~ router.post ~ temperature:", temperature);
      // console.log("🚀 ~ vapiRoutes.ts:30 ~ router.post ~ max_tokens:", max_tokens);

export default router;
