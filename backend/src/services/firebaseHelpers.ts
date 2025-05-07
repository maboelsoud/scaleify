import { ConvoHistory, FullStore } from "../fsm/store";



export const saveStoreToFirebase = async ( store: FullStore ): Promise<FullStore | void> => {};
export const fetchStoreFromFirebase = async ( s: string ): Promise<FullStore | void> => {};
export const fetchOperatorFromFirebase = async ( s: string ): Promise<string | void> => undefined;
export const fetchBusinessInfoFromFirebase = async ( s: string ): Promise<{success: boolean, text: string, error?: string} | void> => undefined;

export const executeCommand = async ( s: string ): Promise<{success: boolean, text: string, error?: string} | void> => {};
export const getResponseFromLLM = async ( s: string | ConvoHistory ): Promise<{type: "text" | "fetch" | "execute", expectReply: boolean , text?: string, fetch?: string, execute?: string} | void> => {};