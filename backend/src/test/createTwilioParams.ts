import { TwilioVoiceWebhookParams } from "../models/store";


export function createTwilioParams(CallSid: string ="Test"): TwilioVoiceWebhookParams {
  return {
    CallSid,
    AccountSid: "Test",
    From: "Test",
    To: "Test",
    CallStatus: "in-progress",
    ApiVersion: "Test",
    Direction: "inbound",
    ToState: "Test",
    ToZip: "Test",
    ToCity: "Test",
    ToCountry: "Test",
    FromZip: "Test",
    FromCity: "Test",
    FromCountry: "Test",
    CallerCountry: "Test",
    CallerState: "Test",
    CallerCity: "Test",
    CallerZip: "Test",


    Caller: "Test",
    Called: "Test",
  
    FromState: "Test",
  
    CalledCity: "Test",
    CalledState: "Test",
    CalledZip: "Test",
    CalledCountry: "Test",
  
    SpeechResult: "Test",
    Confidence: "0.3",
  
    Language: "test"
  };
}