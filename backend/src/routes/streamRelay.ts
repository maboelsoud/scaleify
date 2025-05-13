import { Router } from "websocket-express";
import { Request } from 'express';
import { dispatch } from "../fsm/dispatcher";
import { TwilioVoiceWebhookParams } from "../models/store";

const router = new Router();

router.ws('/connect', async (req: Request, res)=> {
  const ws = await res.accept();
  console.log('accepted connection');

  ws.on('message', (msg)=> {
    const message = JSON.parse(msg.toString());
    console.log("🚀 ~ streamRelay.ts:16 ~ ws.on ~ message:", message);


    if (message.type === "setup") { 
      ( ws as unknown as {twilioParams: TwilioVoiceWebhookParams} ).twilioParams = {
        ...message,
        CallSid: message.callSid, // because twilio is stupid
      };

    }
    if (message.type === "prompt") {
      const twilioParams:TwilioVoiceWebhookParams = {
        ...( ws as unknown as {twilioParams: TwilioVoiceWebhookParams} ).twilioParams,
        SpeechResult: message.voicePrompt,
      }
      console.log("🚀 ~ streamRelay.ts:24 ~ ws.on ~ twilioParams:", twilioParams);
      dispatch({
        event: { type: "RESPONDED", payload: { twilioParams } },
        emit: (event) => {
          if (event.type === "SENDING_RESPONSE" && event.payload) {
            ws.send(
              JSON.stringify({
                type: "text",
                token: event.payload.message,
                last: true,
              })
            );
          }
        },
      });

    } else if (message.type === "interrupt") {
        console.log("🚀 ~ streamRelay.ts:48 ~ ws.on ~ message:", message);
        console.log("Handling interruption; last utterance: ", message.utteranceUntilInterrupt);
    }
  });


});

export default router;

