
import request from "supertest";
import { app } from "../..";


test('/POST /start-beta returns valid TwiML', async ()=> {
  const res = await request(app)
    .post('/twilio/start-beta')
    .type('form')
    .send({CallSid: "Test"});
  
  expect(res.status).toBe(200);
  expect(res.type).toBe('text/xml')
  expect(res.text).toBe(`<?xml version="1.0" encoding="UTF-8"?><Response><Gather input="speech" action="/twilio/respond" method="POST" timeout="5"><Say>waiting for user...</Say></Gather></Response>`);
});