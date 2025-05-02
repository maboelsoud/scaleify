import { EventType } from "./dispatcher";
import { StoreType, StoreState } from "./store";

export type effectHandler = (b: StoreType , e: EventType)=> ({updatedStore: StoreType, nextEvent?: EventType})

export const Effects: Record<StoreState, effectHandler> = {
  "CREATED": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "RESPONDED": (b, e)=>{ 
    console.log('in RESPONDED, b', b, 'e', e);
    return ({ updatedStore: b, nextEvent: {type: "WAITING_FOR_USER"}}) },
  "PROCESSING_GREETING": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "WAITING_FOR_USER": (b, e)=>{ 
    console.log('in WAITING_FOR_USER, b', b, 'e', e);
    return ({ updatedStore: b, nextEvent: {type: "FETCHING_CUSTOMER_INPUT"}}) },
  "NO_CUSTOMER_INPUT": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "FETCHING_CUSTOMER_INPUT": (b, e)=>{
    console.log('in FETCHING_CUSTOMER_INPUT, b', b, 'e', e);
    return ({ updatedStore: b, nextEvent: {type: "PROCESSING_LLM"}}) },
  "PROCESSING_LLM": (b, e)=>{
    console.log('in PROCESSING_LLM, b', b, 'e', e);
    return ({ updatedStore: b, nextEvent: {type: "APPEND_MESSAGE_CONVO"}}) },
  "LLM_TEXT_RESPONSE": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "LLM_COMMAND_RESPONSE": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "EXECUTING_COMMAND": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "COMMAND_SUCCESS": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "COMMAND_FAILURE": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "LLM_FETCH_RESPONSE": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "FETCHING_INFO": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "FETCH_SUCCESS": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "FETCH_FAILURE": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "APPEND_MESSAGE_CONVO": (b, e)=>{
    console.log('in APPEND_MESSAGE_CONVO, b', b, 'e', e);
    return ({ updatedStore: b, nextEvent: {type: "SENDING_RESPONSE", payload: {expectReply: true, message: "waiting for user..."}}}) },
  "SENDING_RESPONSE": (b, e)=>{
    console.log('in SENDING_RESPONSE, b', b, 'e', e);
    return ({ updatedStore: b, nextEvent: {type: "ENDED"}}) },
  "ENDED": (b)=>({ updatedStore: b }),
  "ERROR_NO_CONVO": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "ERROR_LLM": (b, e)=>({ updatedStore: b, nextEvent: e}),
  "ESCALATE_TO_HUMAN": (b, e)=>({ updatedStore: b, nextEvent: e}),
};