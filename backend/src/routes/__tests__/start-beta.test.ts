jest.mock("../../services/firebaseHelpers", () => ({
  fetchStoreFromFirebase: jest.fn(),
  getResponseFromLLM: jest.fn(),
}));


import request from "supertest";
import { app } from "../..";
import { fetchStoreFromFirebase, getResponseFromLLM } from "../../services/firebaseHelpers";
import { createStore } from "../../models/store";
import { createTwilioParams } from "../../test/createTwilioParams";


describe('POST /start-beta', () => {
  test('/POST /start-beta returns valid TwiML', async ()=> {

    const twilioParams = createTwilioParams();
    const mockStore = createStore(twilioParams);
    mockStore.messages.push({
      machineToCustomer: "hello welcome to scaleify, what would you like to do today?",
    });

    (fetchStoreFromFirebase as jest.Mock).mockResolvedValue(mockStore);

    (getResponseFromLLM as jest.Mock).mockResolvedValue({
      type: "text",
      expectReply: true,
      text: "what is it that you want",
    });

    const res = await request(app)
      .post('/twilio/start-beta')
      .type('form')
      .send({CallSid: "Test", SpeechResult: "hello?"});
    
    expect(res.status).toBe(200);
    expect(res.type).toBe('text/xml')
    expect(res.text).toBe(`<?xml version="1.0" encoding="UTF-8"?><Response><Gather input="speech" action="/twilio/respond" method="POST" timeout="5"><Say>what is it that you want</Say></Gather></Response>`);
  });
});