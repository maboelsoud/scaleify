import { Effects } from "../effects";
import { createStore } from "../store";


test('RESPONDED effect produces correct next state', async () => {

  const initialStore = createStore({CallSid: "Test"});

    const result = await Effects['RESPONDED'](initialStore, {
      type: 'RESPONDED',
    });

    expect(result.nextEvent?.type).toEqual('WAITING_FOR_USER');
    expect(result.updatedStore).toEqual(initialStore);

});

test('WAITING_FOR_USER effect produces correct next state', async () => {

  const initialStore = createStore({CallSid: "Test"});

    const result = await Effects['WAITING_FOR_USER'](initialStore, {
      type: 'WAITING_FOR_USER',
    });

    expect(result.nextEvent?.type).toEqual('FETCHING_CUSTOMER_INPUT');
    expect(result.updatedStore).toEqual(initialStore);

});

test('FETCHING_CUSTOMER_INPUT effect produces correct next state', async () => {

  const initialStore = createStore({CallSid: "Test"});

    const result = await Effects['FETCHING_CUSTOMER_INPUT'](initialStore, {
      type: 'FETCHING_CUSTOMER_INPUT',
    });

    expect(result.nextEvent?.type).toEqual('PROCESSING_LLM');
    expect(result.updatedStore).toEqual(initialStore);

});

test('PROCESSING_LLM effect produces correct next state', async () => {

  const initialStore = createStore({CallSid: "Test"});

    const result = await Effects['PROCESSING_LLM'](initialStore, {
      type: 'PROCESSING_LLM',
    });

    expect(result.nextEvent?.type).toEqual('APPEND_MESSAGE_CONVO');
    expect(result.updatedStore).toEqual(initialStore);

});


test('APPEND_MESSAGE_CONVO effect produces correct next state', async () => {

  const initialStore = createStore({CallSid: "Test"});

    const result = await Effects['APPEND_MESSAGE_CONVO'](initialStore, {
      type: 'APPEND_MESSAGE_CONVO',
    });


    expect(result.nextEvent?.type).toEqual('SENDING_RESPONSE');
    if (result.nextEvent?.type === "SENDING_RESPONSE") {
      expect(result.nextEvent.payload.expectReply).toBeTruthy();
      expect(result.nextEvent.payload.message).toEqual("waiting for user...");
    }
    expect(result.updatedStore).toEqual(initialStore);

});

test('SENDING_RESPONSE effect produces correct next state', async () => {

  const initialStore = createStore({CallSid: "Test"});

  const result = await Effects['SENDING_RESPONSE'](initialStore, {
    type: 'SENDING_RESPONSE', payload: {expectReply: true, message: "this is a test message"}
  });

  expect(result.nextEvent?.type).toEqual('ENDED');
  expect(result.updatedStore).toEqual(initialStore);

});
