import { dispatch, EventType } from "../dispatcher";
import { createStore, TwilioVoiceWebhookParams } from "../../models/store";
import * as firebaseHelpers from "../../services/firebaseHelpers";
import * as firebaseService from "../../services/firebaseService";

import { createTwilioParams } from "../../test/createTwilioParams";
import { SYSTEM_MESSAGES } from "../effects";
import { createMockFirestore } from "../../test/mockFirestore";
import { Firestore } from "firebase-admin/firestore";

describe("FSM - Integration", () => {
  afterEach(() => {
    jest.restoreAllMocks(); // restores all spied functions to original
  });

  test("FSM: Created flow to greeting", async () => {
    const twilioParams = createTwilioParams("TestCallSid");

    const saveSpy = jest.spyOn(firebaseHelpers, "saveStoreToFirebase");
    saveSpy.mockImplementation(async (x) => x);

    const seenEvents: EventType[] = [];
    const finalStore = await dispatch({
      event: { type: "CREATED", payload: { twilioParams } },
      emit: (event) => {
        seenEvents.push(event);
      },
    });

    expect(seenEvents.map((e) => e.type)).toEqual([
      "CREATED",
      "PROCESSING_GREETING",
      "APPEND_MESSAGE_CONVO",
      "SENDING_RESPONSE",
      "WAITING_FOR_USER",
    ]);

    if (!finalStore) {
      throw new Error("Final store is undefined");
    }
    const mockStore = createStore(twilioParams);
    mockStore.state = "WAITING_FOR_USER";
    mockStore.messages = [
      {
        machineToCustomer: SYSTEM_MESSAGES.greeting,
      },
    ];
    mockStore.lastUpdated = finalStore.lastUpdated;

    expect(finalStore).toEqual(mockStore);
  });

  test("FSM: Responded flow to response", async () => {
    const twilioParams = createTwilioParams("TestCallSid");
    const mockStore = createStore(twilioParams);

    const saveSpy = jest.spyOn(firebaseHelpers, "saveStoreToFirebase");
    saveSpy.mockImplementation(async (x) => x);

    const fetchSpy = jest.spyOn(firebaseHelpers, "fetchStoreFromFirebase");
    fetchSpy.mockResolvedValue(mockStore);

    const llmSpy = jest.spyOn(firebaseHelpers, "getResponseFromLLM");
    llmSpy.mockResolvedValue({
      type: "text",
      expectReply: true,
      text: "what is it that you want",
    });

    const seenEvents: EventType[] = [];

    const finalStore = await dispatch({
      event: {
        type: "RESPONDED",
        payload: {
          twilioParams: {
            CallSid: "TestCallSid",
            SpeechResult: "hello",
          } as TwilioVoiceWebhookParams,
        },
      },
      emit: (event) => {
        seenEvents.push(event);
      },
    });

    expect(seenEvents.map((e) => e.type)).toEqual([
      "RESPONDED",
      "FETCHING_CUSTOMER_INPUT",
      "PROCESSING_LLM",
      "APPEND_MESSAGE_CONVO",
      "SENDING_RESPONSE",
      "WAITING_FOR_USER",
    ]);

    if (!finalStore) {
      throw new Error("Final store is undefined");
    }
    expect(finalStore).toEqual({
      CallSid: "TestCallSid",
      state: "WAITING_FOR_USER",
      twilioParams: twilioParams,
      lastUpdated: finalStore.lastUpdated,
      messages: [
        {
          customerToMachine: "hello",
          machineToCustomer: "what is it that you want",
        },
      ],
    });
  });

  test("FSM: Responded with silence twice", async () => {
    const twilioParams = createTwilioParams("TestCallSid");
    twilioParams.SpeechResult = undefined; // not necessary but it's good practice

    const mockStore = createStore(twilioParams);
    mockStore.messages = [
      {
        machineToCustomer: "welcome",
      },
    ];

    const saveSpy = jest.spyOn(firebaseHelpers, "saveStoreToFirebase");
    saveSpy.mockImplementation(async (x) => x);

    const fetchSpy = jest.spyOn(firebaseHelpers, "fetchStoreFromFirebase");
    fetchSpy.mockResolvedValue(mockStore);

    let seenEvents: EventType[] = [];

    const firstStore = await dispatch({
      event: {
        type: "RESPONDED",
        payload: {
          twilioParams: {
            CallSid: "TestCallSid",
          } as TwilioVoiceWebhookParams,
        },
      },
      emit: (event) => {
        seenEvents.push(event);
      },
    });

    expect(seenEvents.map((e) => e.type)).toEqual([
      "RESPONDED",
      "FETCHING_CUSTOMER_INPUT",
      "NO_CUSTOMER_INPUT",
      "PROCESSING_LLM",
      "APPEND_MESSAGE_CONVO",
      "SENDING_RESPONSE",
      "WAITING_FOR_USER",
    ]);

    if (!firstStore) {
      throw new Error("first store is undefined");
    }

    expect(firstStore).toEqual({
      CallSid: "TestCallSid",
      state: "WAITING_FOR_USER",
      twilioParams: twilioParams,
      lastUpdated: firstStore.lastUpdated,
      messages: [
        {
          machineToCustomer: "welcome",
        },
        {
          systemToMachine: SYSTEM_MESSAGES.noInput,
          machineToCustomer: "Sorry, I didn't hear anything. Can you hear me?",
        },
      ],
    });

    fetchSpy.mockResolvedValue(firstStore);

    seenEvents = [];

    const secondStore = await dispatch({
      event: {
        type: "RESPONDED",
        payload: {
          twilioParams: {
            CallSid: "TestCallSid",
          } as TwilioVoiceWebhookParams,
        },
      },
      emit: (event) => {
        seenEvents.push(event);
      },
    });

    expect(seenEvents.map((e) => e.type)).toEqual([
      "RESPONDED",
      "FETCHING_CUSTOMER_INPUT",
      "NO_CUSTOMER_INPUT",
      "PROCESSING_LLM",
      "APPEND_MESSAGE_CONVO",
      "SENDING_RESPONSE",
      "ENDED",
    ]);

    if (!secondStore) {
      throw new Error("Second store is undefined");
    }

    expect(secondStore).toEqual({
      CallSid: "TestCallSid",
      state: "ENDED",
      twilioParams: twilioParams,
      lastUpdated: secondStore.lastUpdated,
      messages: [
        {
          machineToCustomer: "welcome",
        },
        {
          systemToMachine: SYSTEM_MESSAGES.noInput,
          machineToCustomer: "Sorry, I didn't hear anything. Can you hear me?",
        },
        {
          systemToMachine: SYSTEM_MESSAGES.noInputTwice,
          machineToCustomer:
            "Hey, I haven’t heard anything from you. Please call back when you're ready to continue.",
        },
      ],
    });
  });

  test("FSM: Responded with silence once then replied then silence twice", async () => {
    const mockDb = createMockFirestore({});

    jest
      .spyOn(firebaseService, "getFirestoreDb")
      .mockImplementation(() => mockDb as unknown as Firestore);
    const seenEvents: EventType[] = [];

    await dispatch({
      event: {
        type: "CREATED",
        payload: {
          twilioParams: {
            CallSid: "TestCallSid",
          } as TwilioVoiceWebhookParams,
        },
      },
      emit: (event) => {
        seenEvents.push(event);
      },
    });

    await dispatch({
      event: {
        type: "RESPONDED",
        payload: {
          twilioParams: {
            CallSid: "TestCallSid",
          } as TwilioVoiceWebhookParams,
        },
      },
      emit: (event) => {
        seenEvents.push(event);
      },
    });

    await dispatch({
      event: {
        type: "RESPONDED",
        payload: {
          twilioParams: {
            CallSid: "TestCallSid",
            SpeechResult: "hello",
          } as TwilioVoiceWebhookParams,
        },
      },
      emit: (event) => {
        seenEvents.push(event);
      },
    });

    await dispatch({
      event: {
        type: "RESPONDED",
        payload: {
          twilioParams: {
            CallSid: "TestCallSid",
          } as TwilioVoiceWebhookParams,
        },
      },
      emit: (event) => {
        seenEvents.push(event);
      },
    });

    const fifthStore = await dispatch({
      event: {
        type: "RESPONDED",
        payload: {
          twilioParams: {
            CallSid: "TestCallSid",
          } as TwilioVoiceWebhookParams,
        },
      },
      emit: (event) => {
        seenEvents.push(event);
      },
    });

    if (!fifthStore) {
      throw new Error("fifth store is undefined");
    }

    expect(fifthStore).toEqual({
      CallSid: "TestCallSid",
      state: "ENDED",
      twilioParams: {
        CallSid: "TestCallSid",
      },
      lastUpdated: fifthStore.lastUpdated,
      messages: [
        {
          machineToCustomer: SYSTEM_MESSAGES.greeting,
        },
        {
          systemToMachine: SYSTEM_MESSAGES.noInput,
          machineToCustomer: "Sorry, I didn't hear anything. Can you hear me?",
        },
        {
          customerToMachine: "hello",
          machineToCustomer:
            "this is a response from the LLM, customer message: hello",
        },
        {
          systemToMachine: SYSTEM_MESSAGES.noInput,
          machineToCustomer: "Sorry, I didn't hear anything. Can you hear me?",
        },
        {
          systemToMachine: SYSTEM_MESSAGES.noInputTwice,
          machineToCustomer:
            "Hey, I haven’t heard anything from you. Please call back when you're ready to continue.",
        },
      ],
    });
  });
});
