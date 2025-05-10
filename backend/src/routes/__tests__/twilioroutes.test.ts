import request from "supertest";
import { app } from "../..";
import { createStore, TwilioVoiceWebhookParams } from "../../models/store";
import * as firebaseService from "../../services/firebaseService";
import * as firebaseHelpers from "../../services/firebaseHelpers";
import { createMockFirestore } from "../../test/mockFirestore";
import { Firestore } from "firebase-admin/firestore";
import { SYSTEM_MESSAGES } from "../../fsm/effects";

describe("Twilio routes", () => {
  afterEach(() => {
    jest.restoreAllMocks(); // restores all spied functions to original
  });

  test("/POST /start returns valid TwiML", async () => {
    const mockDb = createMockFirestore({});

    jest
      .spyOn(firebaseService, "getFirestoreDb")
      .mockImplementation(() => mockDb as unknown as Firestore);

    const res = await request(app)
      .post("/twilio/start")
      .type("form")
      .send({ CallSid: "Test" });

    expect(res.status).toBe(200);
    expect(res.type).toBe("text/xml");
    expect(res.text).toBe(`\
<?xml version="1.0" encoding="UTF-8"?>\
<Response><Gather input="speech" action="/twilio/respond" method="POST" \
bargeIn="true" timeout="5" speechTimeout="1" actionOnEmptyResult="true">\
<Say>${SYSTEM_MESSAGES.greeting}</Say></Gather></Response>`);

    expect(mockDb.__data).toEqual({
      call: {
        Test: {
          CallSid: "Test",
          twilioParams: {
            CallSid: "Test",
          },
          lastUpdated: mockDb.__data?.call?.Test?.lastUpdated,
          state: "WAITING_FOR_USER",
          messages: [
            {
              machineToCustomer: SYSTEM_MESSAGES.greeting,
            },
          ],
        },
      },
    });
  });

  test("/POST /respond returns valid TwiML", async () => {
    const startStore = createStore({
      CallSid: "Test",
    } as TwilioVoiceWebhookParams);
    startStore.messages.push({
      machineToCustomer: SYSTEM_MESSAGES.greeting,
    });
    const mockDb = createMockFirestore({
      call: {
        Test: startStore as unknown as Record<string, unknown>,
      },
    });

    jest
      .spyOn(firebaseService, "getFirestoreDb")
      .mockImplementation(() => mockDb as unknown as Firestore);

    const res = await request(app)
      .post("/twilio/respond")
      .type("form")
      .send({ CallSid: "Test", SpeechResult: "hello?" });

    const expectedMessage =
      "this is a response from the LLM, customer message: hello?";
    expect(res.status).toBe(200);
    expect(res.type).toBe("text/xml");
    expect(res.text).toBe(`\
<?xml version="1.0" encoding="UTF-8"?>\
<Response><Gather input="speech" action="/twilio/respond" method="POST" \
bargeIn="true" timeout="5" speechTimeout="1" actionOnEmptyResult="true">\
<Say>${expectedMessage}</Say></Gather></Response>`);

    expect(mockDb.__data).toEqual({
      call: {
        Test: {
          CallSid: "Test",
          twilioParams: {
            CallSid: "Test",
          },
          lastUpdated: mockDb.__data?.call?.Test?.lastUpdated,
          state: "WAITING_FOR_USER",
          messages: [
            {
              machineToCustomer: SYSTEM_MESSAGES.greeting,
            },
            {
              customerToMachine: "hello?",
              machineToCustomer: expectedMessage,
            },
          ],
        },
      },
    });
  });

  test("/POST /respond with no storeage returns dial to operator", async () => {
    jest
      .spyOn(firebaseHelpers, "fetchStoreFromFirebase")
      .mockResolvedValue(undefined);
    const expectedOperatorNumber = "1234";
    jest
      .spyOn(firebaseHelpers, "fetchOperatorFromFirebase")
      .mockResolvedValue(expectedOperatorNumber);

    const res = await request(app)
      .post("/twilio/respond")
      .type("form")
      .send({ CallSid: "Test", SpeechResult: "hello?" });

    expect(res.status).toBe(200);
    expect(res.type).toBe("text/xml");
    expect(res.text).toBe(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Dial>1234</Dial></Response>`,
    );
  });
});
