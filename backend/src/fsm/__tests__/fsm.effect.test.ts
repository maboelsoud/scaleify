jest.mock("../../services/firebaseHelpers", () => ({
  fetchStoreFromFirebase: jest.fn(),
  getResponseFromLLM: jest.fn(),
}));


import { Effects } from "../effects";
import { createStore, TwilioVoiceWebhookParams, updateStoreState } from "../store";

import { fetchStoreFromFirebase, getResponseFromLLM } from "../../services/firebaseHelpers";
function createTwilioParams(): TwilioVoiceWebhookParams {
  return {
    CallSid: "Test",
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

describe('Effects', () => {

  test('RESPONDED effect produces correct next state', async () => {

    const mockStore = createStore({CallSid: "Test"});
    (fetchStoreFromFirebase as jest.Mock).mockResolvedValue(mockStore);

    const twilioParams = createTwilioParams();

      const result = await Effects['RESPONDED']({
        type: 'RESPONDED',
        payload: { twilioParams },

      });

      if (!result || !result.nextEvent) {
        throw new Error('RESPONDED effect did not produce a next event');
      }

      expect(result.nextEvent?.type).toEqual('FETCHING_CUSTOMER_INPUT');
      expect(result.updatedStore?.state).toEqual("FETCHING_CUSTOMER_INPUT");

  });

  test('WAITING_FOR_USER effect produces correct next state', async () => {

    const initialStore = createStore({CallSid: "Test"});

      const result = await Effects['WAITING_FOR_USER'](initialStore, {
        type: 'WAITING_FOR_USER',
      });

      expect(result.updatedStore).toEqual(initialStore);

  });

  test('FETCHING_CUSTOMER_INPUT effect produces correct next state', async () => {

    const initialStore = createStore({CallSid: "Test"});
    const twilioParams = createTwilioParams();
    const testSpeech = "this is the first Test";
    twilioParams.SpeechResult = testSpeech;

    const result = await Effects['FETCHING_CUSTOMER_INPUT'](initialStore, {
      type: 'FETCHING_CUSTOMER_INPUT',
      payload: {
        twilioParams, 
      }
    });

    expect(result.nextEvent?.type).toEqual('PROCESSING_LLM');
    const expectedStore = updateStoreState(initialStore, "PROCESSING_LLM");
    expectedStore.lastUpdated = result.updatedStore?.lastUpdated;
    expect(result.updatedStore).toEqual(expectedStore);

    delete twilioParams.SpeechResult;

    const secondResult = await Effects['FETCHING_CUSTOMER_INPUT'](initialStore, {
      type: 'FETCHING_CUSTOMER_INPUT',
      payload: {
        twilioParams,
      }
    });

    expect(secondResult.nextEvent?.type).toEqual('NO_CUSTOMER_INPUT');
    expect(secondResult.updatedStore).toEqual(updateStoreState(initialStore, "NO_CUSTOMER_INPUT"));

  });

  test('PROCESSING_LLM effect produces correct next state', async () => {

    const initialStore = createStore({CallSid: "Test"});



    (getResponseFromLLM as jest.Mock).mockResolvedValue({
        type: "text",
        expectReply: true,
        text: "what is it that you want",
    });

      const result = await Effects['PROCESSING_LLM'](initialStore, {
        type: 'PROCESSING_LLM',
        payload: {
          who: "customer",
          message: "test",
        }
      });

      expect(result.updatedStore.messages.length).toEqual(1);
      expect(result.updatedStore.messages[0].customerToMachine).toEqual("test");
      // expect(result.updatedStore.messages[0].systemToMachine).toEqual("what is it that you want");
      expect(result.nextEvent).toEqual({
        type: 'APPEND_MESSAGE_CONVO',
        payload: {
          expectReply: true,
          message: "what is it that you want",
        }
      });
      expect(result.updatedStore.state).toEqual("APPEND_MESSAGE_CONVO");

      (getResponseFromLLM as jest.Mock).mockResolvedValue({
        type: "fetch",
        expectReply: false,
        fetch: "fetching info",
      });

      const secondResult = await Effects['PROCESSING_LLM'](result.updatedStore, {
        type: 'PROCESSING_LLM',
        payload: {
          who: "system",
          message: "second test",
        }
      });

      expect(secondResult.updatedStore.messages.length).toEqual(2);
      expect(secondResult.updatedStore.messages[1].systemToMachine).toEqual("second test");

      expect(secondResult.nextEvent).toEqual({
        type: 'FETCHING_INFO',
        payload: {
          message: "fetching info",
        }
      });
      expect(secondResult.updatedStore.state).toEqual("FETCHING_INFO");

  });


  test('APPEND_MESSAGE_CONVO effect produces correct next state', async () => {

    const initialStore = createStore({CallSid: "Test"});
    initialStore.messages.push({customerToMachine: "i am the customer"});


      const result = await Effects['APPEND_MESSAGE_CONVO'](initialStore, {
        type: 'APPEND_MESSAGE_CONVO',
        payload: {
          expectReply: true,
          message: "i am the machine",
        }
      });


      expect(result.nextEvent?.type).toEqual('SENDING_RESPONSE');
      if (result.nextEvent?.type !== "SENDING_RESPONSE") {
        throw new Error("unexpected event type");
      }
      expect(result.nextEvent.payload.expectReply).toBeTruthy();
      expect(result.nextEvent.payload.message).toEqual("i am the machine");
      expect(result.updatedStore.state).toEqual("SENDING_RESPONSE");

  });

  test('SENDING_RESPONSE effect produces correct next state', async () => {

    const initialStore = createStore({CallSid: "Test"});

    const result = await Effects['SENDING_RESPONSE'](initialStore, {
      type: 'SENDING_RESPONSE', payload: {expectReply: true, message: "this is a test message"}
    });

    expect(result.nextEvent?.type).toEqual('WAITING_FOR_USER');
    expect(result.updatedStore.state).toEqual("WAITING_FOR_USER");

    const secondResult = await Effects['SENDING_RESPONSE'](initialStore, {
      type: 'SENDING_RESPONSE', payload: {expectReply: false, message: "this is a test message"}
    });
    expect(secondResult.nextEvent?.type).toEqual('ENDED');
    expect(secondResult.updatedStore.state).toEqual("ENDED");

  });

});