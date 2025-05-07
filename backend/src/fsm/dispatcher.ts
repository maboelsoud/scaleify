import { Effects, storeFullHandler, StorefulStates, storelessHandler, StorelessStates } from "./effects";
import { FullStore, TwilioVoiceWebhookParams } from "./store";

export type EventType = 
| {type: `CREATED`, payload: { twilioParams: TwilioVoiceWebhookParams; }}
| {type: `RESPONDED`, payload: { twilioParams: TwilioVoiceWebhookParams; }}
| {type: `PROCESSING_GREETING`}
| {type: `WAITING_FOR_USER`}
| {type: `NO_CUSTOMER_INPUT`}
| {type: `FETCHING_CUSTOMER_INPUT`; payload: { twilioParams: TwilioVoiceWebhookParams; }}
| { type: "PROCESSING_LLM"; payload: { who: "customer" | "system"; message: string; } }
| { type: "LLM_TEXT_RESPONSE"; payload: { message: string; expectReply: boolean } }
| { type: "LLM_COMMAND_RESPONSE"; payload: { message: string } }
| { type: "EXECUTING_COMMAND"; payload: { message: string; } }
| {type: `COMMAND_SUCCESS`; payload: { message?: string; }}
| { type: "COMMAND_FAILURE"; payload: { error: string } }
| {type: `LLM_FETCH_RESPONSE`; payload: { json?: string; }}
| {type: `FETCHING_INFO`; payload: { message: string; }}
| {type: `FETCH_SUCCESS`; payload: { message?: string; }}
| {type: `FETCH_FAILURE`; payload: { error: string }}
| { type: "APPEND_MESSAGE_CONVO"; payload: { message: string; expectReply: boolean } }
| { type: "SENDING_RESPONSE"; payload: { message: string; expectReply: boolean } }
| {type: `ENDED`; payload?: { expectReply?: false }}
| {type: `ERROR_NO_CONVO`; payload: { error: string; twilioParams: TwilioVoiceWebhookParams; }}
| { type: "ERROR_LLM"; payload: { error: string } }
| {type: `ESCALATE_TO_HUMAN`; payload: { message: string; operatorNumber: string; error: string; twilioParams: TwilioVoiceWebhookParams; } };

export type EmitFn = (e: EventType, b?: FullStore )=> void;

type storelessEvent = Extract<EventType, { type: StorelessStates }>;
type storeFullEvent = Extract<EventType, { type: StorefulStates }>;

export async function storelessDispatch({event, emit}: {event: storelessEvent, emit?: EmitFn}): Promise<FullStore | void> {
  const handler = Effects[event.type] as storelessHandler<typeof event.type>;
  const result = await handler(event);
  const { updatedStore = undefined, nextEvent = undefined } = result || {};

  emit?.(event, updatedStore);
  if (nextEvent) {
    if (updatedStore) {
      return storeFullDispatch({ store: updatedStore, event: nextEvent as storeFullEvent, emit });
    }
    else {
      return storelessDispatch({ event: nextEvent  as storelessEvent, emit });
    }
  }
}


export async function storeFullDispatch({store, event, emit}: { store: FullStore, event: storeFullEvent, emit?: EmitFn  }):  Promise<FullStore | void>  {
  const handler = Effects[event.type] as storeFullHandler<typeof event.type>;
  const { updatedStore, nextEvent } = await handler(store, event);
  emit?.(event, updatedStore);

  if (nextEvent) {
    return storeFullDispatch({ store: updatedStore, event: nextEvent as storeFullEvent, emit });
  }
  return updatedStore;
}

export function dispatch(args: {
  store: FullStore;
  event: storeFullEvent;
  emit?: EmitFn;
}): Promise<FullStore>;

export function dispatch(args: {
  event: storelessEvent;
  emit?: EmitFn;
}): Promise<FullStore | void>;

export async function dispatch({store, event, emit}: { store?: FullStore, event: EventType, emit?: EmitFn }):  Promise<FullStore | void>  {
  if (store) {
    return storeFullDispatch({ store, event: event as storeFullEvent, emit });
  } else {
    return storelessDispatch({ event: event as storelessEvent, emit });
  }
}