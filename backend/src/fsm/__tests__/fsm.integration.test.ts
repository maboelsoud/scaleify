import { dispatch, EventType } from "../dispatcher";
import { createStore, StoreType } from "../store";

test('FSM: CALL_START flow to greeting', async ()=> {

  const initialStore = createStore({CallSid: "Test"});

  const seenEvents: EventType[] = [];
  const seenStore: StoreType[] = [];

  const finalStore = await dispatch(initialStore, {type: "RESPONDED"}, (store, event)=> {
    seenEvents.push(event);
    seenStore.push(store);
  });

  expect(seenEvents.map(e=> e.type)).toEqual([
    "RESPONDED",
    "WAITING_FOR_USER",
    "FETCHING_CUSTOMER_INPUT",
    "PROCESSING_LLM",
    "APPEND_MESSAGE_CONVO",
    "SENDING_RESPONSE",
    "ENDED"
  ]);

  expect(finalStore.state).toBe("CREATED");
  expect(finalStore.twilioParams).toStrictEqual({"CallSid": "Test"});
});