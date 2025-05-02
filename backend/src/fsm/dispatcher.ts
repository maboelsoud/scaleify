import { Effects } from "./effects";
import { StoreState, StoreType } from "./store";

export type EventType =
  | { type: Exclude<StoreState, "LLM_TEXT_RESPONSE" | "SENDING_RESPONSE" | "ERROR_LLM">}
  | { type: "LLM_TEXT_RESPONSE"; payload: { message: string; expectReply: boolean } }
  | { type: "SENDING_RESPONSE"; payload: { message: string; expectReply: boolean } }
  | { type: "ERROR_LLM"; payload: { error: string } };

export type EmitFn = (b: StoreType , e: EventType)=> void;

export async function dispatch(store: StoreType, event: EventType, emit?: EmitFn ) {

    const handler = Effects[event.type];
    const { updatedStore, nextEvent } = handler(store, event);
    emit?.(updatedStore, event);

    if (nextEvent) {
        return dispatch(updatedStore, nextEvent, emit);
    }
    return updatedStore;
}