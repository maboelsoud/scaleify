import { Business } from "../models/business";
import { ConvoHistory, FullStore } from "../models/store";
import { getFirestoreDb } from "./firebaseService";
import { CollectionReference, DocumentData } from "firebase-admin/firestore";

const COLLECTIONS = {
  store: "call",
  business: "business"
} as const;

function getStore(): CollectionReference<DocumentData> {
  return getFirestoreDb().collection(COLLECTIONS.store);
}

function getBusiness(): CollectionReference<DocumentData> {
  return getFirestoreDb().collection(COLLECTIONS.business);
}

export const saveStoreToFirebase = async ( store: FullStore ): Promise<FullStore> => {
  const res = await getStore().doc(store.CallSid).set(store, { merge: true });
  console.log('set store at: ', res.writeTime);
  return store;
};

export const fetchStoreFromFirebase = async ( CallSid: string ): Promise<FullStore | void> => {
  const snapshot = await getStore().doc(CallSid).get();
  if (!snapshot.exists) {
    console.log('No matching documents');
    return;
  }  
  const fetchedStore = snapshot.data() as FullStore;
  return fetchedStore;
};

// TODO: I dont know where we might need this
export const saveBusinessToFirebase = async (business: Business): Promise<Business | void > => {
  const res = await getBusiness().doc(business.primaryEmail).set(business, { merge: true });
  console.log('set business at: ', res.writeTime);
  return business;
}

// TODO: we might wanna remove this
export const fetchBusinessFromFirebase = async (email: string): Promise<Business | void > => {
  const snapshot = await getBusiness().doc(email).get();
  if (!snapshot.exists) {
    console.log('No matching documents');
    return;
  }  
  const fetchedBusiness = snapshot.data() as Business;
  return fetchedBusiness;
}

export const fetchBusinessByToNumber = async ( toNumber: string ): Promise<Business | void> => {
  const snapshot = await getBusiness().where('twilioIncomingPhoneNumber', '==', toNumber).get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }  
  let fetchedBusiness: Business | undefined;
  snapshot.forEach(doc => {
    fetchedBusiness = doc.data() as Business;
  });
  return fetchedBusiness;

} 

export const fetchOperatorFromFirebase = async ( toNumber: string ): Promise<string | void> => {
  const fetchedBusiness = await fetchBusinessByToNumber(toNumber);
  return fetchedBusiness?.operatorPhoneNumber;
};

export const fetchBusinessInfoFromFirebase = async ( toNumber: string , infoSegment: string ): Promise<string | void> => {
  const fetchedBusiness = await fetchBusinessByToNumber(toNumber);
  return fetchedBusiness?.businessInfo[infoSegment];
};

export const executeCommand = async ( commandFn: string ): Promise<{success: boolean, text: string, error?: string} | void> => {
  // TODO: implement this when we have something of use
  return {success: true, text: `command executed ${commandFn}`};
};
export const getResponseFromLLM = async ( convoHistory: string | ConvoHistory ):
Promise<{type: "text" | "fetch" | "execute", expectReply: boolean , text?: string, fetch?: string, execute?: string} | void> => {
  const demoMessage: string = Array.isArray(convoHistory)?
    convoHistory[convoHistory.length-1]?.customerToMachine || ""
    : convoHistory;
  const expectReply: boolean  = Array.isArray(convoHistory)?
  (convoHistory.length < 5? true : false)
  : false;
  return {
    type: "text",
    expectReply,
    text: `this is a response from the LLM, customer message: ${demoMessage}`,
  }
};