jest.mock("../../services/firebaseHelpers", () => ({
  fetchStoreFromFirebase: jest.fn(),
  saveStoreToFirebase: jest.fn(),
  getResponseFromLLM: jest.fn(),
}));

import { dispatch, EventType } from "../dispatcher";
import { createStore, FullStore, TwilioVoiceWebhookParams } from "../../models/store";
import { fetchStoreFromFirebase, saveStoreToFirebase, getResponseFromLLM } from "../../services/firebaseHelpers";
import { createTwilioParams } from "../../test/createTwilioParams";

describe('FSM - Integration', () => {
  test('FSM: Created flow to greeting', async ()=> {

    const twilioParams = createTwilioParams("TestCallSid");
    const mockStore = createStore(twilioParams);
    (saveStoreToFirebase as jest.Mock).mockResolvedValue(mockStore);

    const seenEvents: EventType[] = [];
    const seenStore: (FullStore | undefined)[] = [];
    const finalStore = await dispatch({event: {type: "CREATED", payload: {
      twilioParams: {
        CallSid: "TestCallSid",
      } as TwilioVoiceWebhookParams
    }}, emit: (event, store)=> {
      seenEvents.push(event);
      seenStore.push(store);
    }});

    // console.log("🚀 ~ fsm.integration.test.ts:26 ~ test ~ seenStore:", seenStore);
    expect(seenEvents.map(e=> e.type)).toEqual([
      "CREATED",
      "PROCESSING_GREETING",
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
          machineToCustomer: "Welcome to Scaleify, your solution to changing customer service for your business, what would you like to do today?",
        }
      ]
      
    });
  });

  test('FSM: Responded flow to response', async ()=> {

    // const initialStore = createStore({CallSid: "Test"});

    const twilioParams = createTwilioParams("TestCallSid");
    const mockStore = createStore(twilioParams);
    (fetchStoreFromFirebase as jest.Mock).mockResolvedValue(mockStore);

    (getResponseFromLLM as jest.Mock).mockResolvedValue({
      type: "text",
      expectReply: true,
      text: "what is it that you want",
    });

    const seenEvents: EventType[] = [];
    const seenStore: (FullStore | undefined)[] = [];

    const finalStore = await dispatch({event: {type: "RESPONDED", payload: {
      twilioParams: {
        CallSid: "TestCallSid",
        SpeechResult: "hello"
      } as TwilioVoiceWebhookParams
    }}, emit: (event, store)=> {
      seenEvents.push(event);
      seenStore.push(store);
    }});

    expect(seenEvents.map(e=> e.type)).toEqual([
      "RESPONDED",
      "FETCHING_CUSTOMER_INPUT",
      "PROCESSING_LLM",
      "APPEND_MESSAGE_CONVO",
      "SENDING_RESPONSE",
      "WAITING_FOR_USER",
    ]);

    // console.log("🚀 ~ fsm.integration.test.ts:93 ~ test ~ seenStore:", seenStore);

    if (!finalStore) {
      throw new Error("Final store is undefined");
    }
    // console.log("🚀 ~ fsm.integration.test.ts:52 ~ test ~ finalStore:", finalStore);
    expect(finalStore).toEqual({
      CallSid: "TestCallSid",
      state: "WAITING_FOR_USER",
      twilioParams: twilioParams,
      lastUpdated: finalStore.lastUpdated,
      messages: [
        {
          customerToMachine: 'hello',
          machineToCustomer: "what is it that you want",
        }
      ]
    });
  });

});