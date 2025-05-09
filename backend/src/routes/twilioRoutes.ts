import { Request, Response, Router } from "express";
// import { getActiveConvo } from "../services/twilioService";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import { dispatch } from "../fsm/dispatcher";



interface singleTalk {
  customer? : string | undefined;
  machine : string;
};

type ConvoHistory = singleTalk[];
const activeConversations: Record<string, ConvoHistory> = {};


export function getActiveConvo(req: Request) : ConvoHistory | undefined{

  if (!req || !req.body || !req.body.CallSid) return undefined;

  const callerId: string = req.body.CallSid;
  if (!activeConversations[callerId]) {
    activeConversations[callerId] = [];
    }

  return activeConversations[callerId];
}


const router = Router();

router.post('/start', async (req: Request, res: Response)=> {
  await dispatch({event: {type: "CREATED", payload: {twilioParams: req.body }}, emit: (event)=> {
    console.log("🚀 ~ twilioRoutes.ts:99 ~ awaitdispatch ~ event:", event);
    if (event.type === "SENDING_RESPONSE" && event.payload) {
      const { message , expectReply = false } = event.payload;
      const twimlResp = new VoiceResponse();
      if (expectReply) {
        const gather = twimlResp.gather({
          input: ["speech"],
          action: '/twilio/respond',
          method: "POST",
          bargeIn: true,
          timeout: 5,
          speechTimeout: "1",
        });
        if (message) {
          gather.say(message);
        }
      } else {
        if (message) {
          twimlResp.say(message);
        }
        twimlResp.hangup();
      }
      res.type('text/xml').send(twimlResp.toString());
    }
  }});
});

router.post('/respond', async (req: Request, res: Response)=> {
  
  await dispatch({event: {type: "RESPONDED", payload: {twilioParams: req.body }}, emit: (event)=> {

    if (event.type === "SENDING_RESPONSE" && event.payload) {
      console.log("🚀 ~ awaitdispatch ~ e.payload:", event.payload)
      const { message , expectReply = false } = event.payload;

      const twimlResp = new VoiceResponse();
      if (expectReply) {
        const gather = twimlResp.gather({
          input: ["speech"],
          action: '/twilio/respond',
          method: "POST",
          bargeIn: true,
          timeout: 5,
          speechTimeout: "1",
        });
        if (message) {
          gather.say(message);
        }
      } else {
        if (message) {
          twimlResp.say(message);
        }
      }

      res.type('text/xml').send(twimlResp.toString());
  
    } else if (event.type === "ESCALATE_TO_HUMAN") {
      const twimlResp = new VoiceResponse();
      twimlResp.dial(event.payload.operatorNumber);
      res.type('text/xml').send(twimlResp.toString());
    }

  }});
});


export default router;