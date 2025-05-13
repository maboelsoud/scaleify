import { Request, Response, Router } from "express";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import { dispatch } from "../fsm/dispatcher";

const router = Router();

function createGather({
  message,
  expectReply,
}: {
  message: string;
  expectReply: boolean;
}): VoiceResponse {
  const twimlResp = new VoiceResponse();
  if (expectReply) {
    const gather = twimlResp.gather({
      input: ["speech"],
      action: "/twilio/respond",
      method: "POST",
      speechModel: "deepgram_nova-3-general",
      bargeIn: false,
      timeout: 5,
      speechTimeout: "1.5",
      actionOnEmptyResult: true,
    });
    if (message) {
      gather.say({
        // @ ts-expect-error this voice is in beta but it is actually available
        // voice: "Polly.Joanna",
        // voice: "Google.en-US-Chirp3-HD-Orus"
        // voice: "Polly.Joanna-Neural"
        // voice: "Google.en-US-Neural2-C"
      }, message);
    }
  } else {
    if (message) {
      twimlResp.say({
        // @ ts-expect-error this voice is in beta but it is actually available
        // voice: "Polly.Joanna",
        // voice: "Google.en-US-Chirp3-HD-Orus"
        // voice: "Polly.Joanna-Neural"
        // voice: "Google.en-US-Neural2-C"
      }, message);
    }
    twimlResp.hangup();
  }
  return twimlResp;
}

function createConversationRelay(message:string): VoiceResponse  {
  const ngrokUrl = process.env.NGROK_URL;
  const url = new URL("/streamRelay/connect", ngrokUrl);
  url.protocol = "wss";

  const twimlResp = new VoiceResponse();
  const connect = twimlResp.connect({
  });

  const convoRelay = connect.conversationRelay({
    // ttsProvider:"Google",
    // ttsProvider:"ElevenLabs",
    transcriptionProvider: "Deepgram",
    speechModel: "nova-3-general",
    // voice:"en-US-Journey-O",
    // voice:"Qp2PG6sgef1EHtrNQKnf",
    welcomeGreeting: message,
    // transcriptionLanguage: "ar-EG",
    url: url.toString(),
  });

//   convoRelay.language({
//     code: 'en-US',
//     ttsProvider: 'google',
//     voice: 'en-US-Journey-O'
// });

//   convoRelay.language({
//     code: 'ar-XA',
//     ttsProvider: 'ElevenLabs',
//     voice: 'Qp2PG6sgef1EHtrNQKnf'
// });

  return twimlResp;
}

function dialOperator({
  operatorNumber,
}: {
  operatorNumber: string;
}): VoiceResponse {
  const twimlResp = new VoiceResponse();
  twimlResp.dial(operatorNumber);
  return twimlResp;
}

router.post("/start", async (req: Request, res: Response) => {
  console.log("🚀 ~ twilioRoutes.ts:89 ~ router.post ~ req.body:", req.body);
  await dispatch({
    event: { type: "CREATED", payload: { twilioParams: req.body } },
    emit: (event) => {
      if (event.type === "SENDING_RESPONSE" && event.payload) {
        // res.type("text/xml").send(createGather(event.payload).toString());
        res.type("text/xml").send(createConversationRelay(event.payload.message).toString());
      }
    },
  });
});

router.post("/respond", async (req: Request, res: Response) => {
  console.log("🚀 ~ twilioRoutes.ts:80 ~ router.post ~ req.body.SpeechResult:", req.body.SpeechResult);
  await dispatch({
    event: { type: "RESPONDED", payload: { twilioParams: req.body } },
    emit: (event) => {
      if (event.type === "SENDING_RESPONSE" && event.payload) {
        res.type("text/xml").send(createGather(event.payload).toString());
      } else if (event.type === "ESCALATE_TO_HUMAN") {
        res.type("text/xml").send(dialOperator(event.payload).toString());
      }
    },
  });
});

export default router;
