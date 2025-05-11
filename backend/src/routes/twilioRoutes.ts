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
      speechModel: "phone_call",
      bargeIn: true,
      timeout: 5,
      speechTimeout: "1",
      actionOnEmptyResult: true,
    });
    if (message) {
      gather.say({}, message);
    }
  } else {
    if (message) {
      twimlResp.say({}, message);
    }
    twimlResp.hangup();
  }
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
  await dispatch({
    event: { type: "CREATED", payload: { twilioParams: req.body } },
    emit: (event) => {
      if (event.type === "SENDING_RESPONSE" && event.payload) {
        res.type("text/xml").send(createGather(event.payload).toString());
      }
    },
  });
});

router.post("/respond", async (req: Request, res: Response) => {
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
