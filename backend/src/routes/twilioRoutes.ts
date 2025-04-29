import { Request, Response, Router } from "express";
// import { getActiveConvo } from "../services/twilioService";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";



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

router.post('/respond', (req: Request, resp: Response)=> {
    const activeConvo = getActiveConvo(req);

    if (!activeConvo
    ) {
        resp.status(500).send("serverError");
        return;
    }


    const twimlResp = new VoiceResponse();

    if (activeConvo.length === 0) {
      activeConvo.push({
        machine: "Welcome to Scaleify, your solution to changing customer service for your business, what would you like to do today?",
      });

      twimlResp.gather({
        input: ["speech"],
        action: '/twilio/respond',
        method: "POST",
        timeout: 5,
      }).say(activeConvo[activeConvo.length - 1].machine);

      resp.send(twimlResp.toString());
      return;

    } else {

    const lastTalk = activeConvo[activeConvo.length - 1];
    lastTalk.customer = req.body.SpeechResult;

      if (activeConvo.length  < 3) {
  
        activeConvo.push({
          machine: `got it, you said: ${lastTalk?.customer}, anything else you want to say?`
        });
  
        twimlResp.gather({
          input: ["speech"],
          action: '/twilio/respond',
          method: "POST",
          timeout: 5,
        }).say(activeConvo[activeConvo.length - 1].machine);
  
        resp.send(twimlResp.toString());
  
        return;
  
      } else {
  
        activeConvo.push({
          machine: `got it, you said: ${lastTalk?.customer}, thank you for calling Scaleify and have a great day!`
        });
  
        twimlResp.say(activeConvo[activeConvo.length - 1].machine);
      
        twimlResp.hangup();
        resp.send(twimlResp.toString());
        return;
      }
    }

});


export default router;