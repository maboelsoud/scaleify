import { saveStoreToFirebase, fetchStoreFromFirebase, getResponseFromLLM, executeCommand, fetchBusinessInfoFromFirebase, fetchOperatorFromFirebase } from "../services/firebaseHelpers";
import { EventType } from "./dispatcher";
import { StoreState, FullStore, createStore, singleTalk, updateStoreState } from "./store";

// fake functions to simulate the behavior until we have the real ones


export type EventOfType<T extends StoreState> = Extract<EventType, { type: T }>;

export type StorelessStates = "CREATED" | "RESPONDED" | "ERROR_NO_CONVO" | "ESCALATE_TO_HUMAN";
export type StorefulStates = Exclude<StoreState, StorelessStates>;

export type storelessHandler<T extends StorelessStates>  = (e: EventOfType<T>)=> Promise<{updatedStore?: FullStore, nextEvent?: EventType} | void>
export type storeFullHandler<T extends StorefulStates>  = (b: FullStore , e: EventOfType<T>)=> Promise<{updatedStore: FullStore, nextEvent?: EventType}>

const CreatedHandler: storelessHandler<"CREATED"> = async (e)=>{
  const createdStore = await saveStoreToFirebase(createStore(e.payload.twilioParams));
  if (!createdStore) {
    return { nextEvent: {type: "ERROR_NO_CONVO", payload: {error: "unable to save store", twilioParams: e.payload.twilioParams}}};
  }

  return { updatedStore: updateStoreState(createdStore, "PROCESSING_GREETING"), nextEvent: {type: "PROCESSING_GREETING"}};
};

const RespondedHandler:storelessHandler<"RESPONDED">  = async (event)=>{ 
  const { CallSid } = event.payload.twilioParams;
  const fetchedStore = await fetchStoreFromFirebase(CallSid);
  if (fetchedStore) {
    // rewriting the store with the new twilioParams because its hitting route /responded again
    // TODO: check if this is the right thing to do
    // fetchedStore.twilioParams = event.payload.twilioParams;
    return { updatedStore: updateStoreState(fetchedStore, "FETCHING_CUSTOMER_INPUT"),
      nextEvent: {type: "FETCHING_CUSTOMER_INPUT", payload: { twilioParams: event.payload.twilioParams }}};
  }
  return { nextEvent: {type: "ERROR_NO_CONVO", payload: {error: "unable to fetch store", twilioParams: event.payload.twilioParams}}};
};

const ProcessingGreetingHandler: storeFullHandler<"PROCESSING_GREETING"> = async (store) => {
  // todo: make this a function that takes in the store and returns the greeting based on the client
  const greeting = "Welcome to Scaleify, your solution to changing customer service for your business, what would you like to do today?";
  return { updatedStore: updateStoreState(store, "APPEND_MESSAGE_CONVO"),
    nextEvent: { type: "APPEND_MESSAGE_CONVO", payload: { expectReply: true, message: greeting }}}
};

const WaitingForUserHandler: storeFullHandler<"WAITING_FOR_USER"> = async (b, e)=>{ 
  // console.log('in WAITING_FOR_USER, b', b, 'e', e);
  // we dont do anything because we are waiting for the user to say something
  // no need to update the store because we are not updating the state
  return { updatedStore: b};
};
const NoCustomerInputHandler: storeFullHandler<"NO_CUSTOMER_INPUT"> = async (store)=>{
  const lastMessage = store.messages[store.messages.length - 1];
  if (!lastMessage) {
    return { updatedStore: updateStoreState(store, "ERROR_LLM"), nextEvent: {type: "ERROR_LLM", payload: {error: "no last message"}}};
  }
  return { updatedStore: updateStoreState(store, "PROCESSING_LLM"),
    nextEvent: {type: "PROCESSING_LLM", payload: {expectReply: true, who: "system", message: "customer did not provide input"}}};
};

const FetchingCustomerInputHandler: storeFullHandler<"FETCHING_CUSTOMER_INPUT"> = async (store, event) => {
  const { SpeechResult } = event.payload.twilioParams;
  if (SpeechResult) {
    return { updatedStore: updateStoreState(store, "PROCESSING_LLM"),
      nextEvent: {type: "PROCESSING_LLM", payload: {expectReply: true, who: "customer", message: SpeechResult}}};
  } else {
    return { updatedStore: updateStoreState(store, "NO_CUSTOMER_INPUT"), nextEvent: {type: "NO_CUSTOMER_INPUT"}};
  }
};

const ProcessingLlmHandler: storeFullHandler<"PROCESSING_LLM"> = async (store, event)=>{
  const newMessage: singleTalk = event.payload.who === "customer"? {
    customerToMachine: event.payload.message,
  } : {
    systemToMachine: event.payload.message,
  };
  
  const newStore: FullStore = {
    ...store,
    messages: [...store.messages, newMessage
    ],
    lastUpdated: new Date(),
  };

  const result = await getResponseFromLLM(newStore.messages)
  if (!result) {
    return { updatedStore: updateStoreState(newStore, "ERROR_LLM"),
      nextEvent: {type: "ERROR_LLM", payload: {error: "missing llm response"}}};
  }
  if (result.type === "text") {
    return { updatedStore: updateStoreState(newStore, "APPEND_MESSAGE_CONVO"),
      nextEvent: {type: "APPEND_MESSAGE_CONVO", payload: { expectReply: result.expectReply, message: result.text || ""}}};
  } else if (result.type === "fetch") {
    return { updatedStore: updateStoreState(newStore, "FETCHING_INFO"),
      nextEvent: {type: "FETCHING_INFO", payload: { message: result.fetch || ""}}};
  } else {
    return { updatedStore: updateStoreState(newStore, "EXECUTING_COMMAND"),
      nextEvent: {type: "EXECUTING_COMMAND", payload: { message: result.execute || ""}}};
  }
};

const LlmTextResponseHandler: storeFullHandler<"LLM_TEXT_RESPONSE"> = async (b, e)=>{
  throw "not supposed to be implemented";
  return { updatedStore: b, nextEvent: {type: "APPEND_MESSAGE_CONVO", payload: { expectReply: e.payload.expectReply, message: e.payload.message}}};
};

const LlmCommandResponseHandler: storeFullHandler<"LLM_COMMAND_RESPONSE"> = async (b, e)=>{
  const result = await executeCommand(e.payload.message);
  if (!result || !result.success) {
    return { updatedStore: updateStoreState(b, "ERROR_LLM"),
      nextEvent: {type: "ERROR_LLM", payload: {error: result? `result is not successful, error: ${result.error}` : "missing response from llm" }}};
  }
  return { updatedStore: updateStoreState(b, "PROCESSING_LLM"),
    nextEvent: {type: "PROCESSING_LLM", payload: { who: "system", message: result.text || ""}}};
  // return { updatedStore: b, nextEvent: {type: "COMMAND_SUCCESS", payload: { message: result.text || ""}}};
};
const ExecutingCommandHandler: storeFullHandler<"EXECUTING_COMMAND"> = async (b, e)=>{
  throw "not supposed to be implemented";
  return { updatedStore: b, nextEvent: e};
};
const CommandSuccessHandler: storeFullHandler<"COMMAND_SUCCESS"> = async (b, e)=>{
  throw "not supposed to be implemented";
  return { updatedStore: b, nextEvent: e}
};
const CommandFailureHandler: storeFullHandler<"COMMAND_FAILURE"> = async (b, e)=>{
  throw "not supposed to be implemented";
  return { updatedStore: b, nextEvent: e};
};
const LlmFetchResponseHandler: storeFullHandler<"LLM_FETCH_RESPONSE"> = async (b, e)=>{
  throw "not supposed to be implemented";
  return { updatedStore: b, nextEvent: e};
};
const FetchingInfoHandler: storeFullHandler<"FETCHING_INFO"> = async (b, e)=>{
  const result = await fetchBusinessInfoFromFirebase(e.payload.message);
  if (!result || !result.success) {
    return { updatedStore: updateStoreState(b, "ERROR_LLM"),
      nextEvent: {type: "ERROR_LLM", payload: { error: result? `result not successful, error: ${result.error}` : "missing business info"}}};
  }
  return { updatedStore: updateStoreState(b, "PROCESSING_LLM"), nextEvent: {type: "PROCESSING_LLM", payload: { who: "system", message: result.text}}};
};
const FetchSuccessHandler: storeFullHandler<"FETCH_SUCCESS"> = async (b, e)=>{
  throw "not supposed to be implemented";
  return { updatedStore: b, nextEvent: e};
};
const FetchFailureHandler: storeFullHandler<"FETCH_FAILURE"> = async (b, e)=>{
  throw "not supposed to be implemented";
  return { updatedStore: b, nextEvent: e};
};

const AppendMessageConvoHandler: storeFullHandler<"APPEND_MESSAGE_CONVO"> = async (store, event)=>{
  const {expectReply, message: appendedMessage } = event.payload;
  const lastMessage = store.messages[store.messages.length - 1];
  let updatedStore: FullStore;
  if (lastMessage?.machineToCustomer) {
    // log to the backend that we have double machine messages (or a message not created)
    console.error('double machine messages', store);
    const newMessage: singleTalk = {
      ...lastMessage,
      machineToCustomer: appendedMessage,
    }
    updatedStore = {
      ...store,
      messages: [...store.messages, newMessage],
      lastUpdated: new Date(),
    };

  } else {
    // add our machine message to all the messages
    const newLastMessage = {
      ...lastMessage,
      machineToCustomer: appendedMessage,
    };

    updatedStore = {
      ...store,
      messages: [...store.messages.slice(0, -1), newLastMessage],
      lastUpdated: new Date(),
    };
  }
  return { updatedStore: updateStoreState(updatedStore, "SENDING_RESPONSE"),
    nextEvent: {type: "SENDING_RESPONSE", payload: {expectReply, message: appendedMessage}}};
};
const SendingResponseHandler: storeFullHandler<"SENDING_RESPONSE"> = async (b, e)=>{
  if (!e.payload.expectReply) {
    return ({ updatedStore: updateStoreState(b, "ENDED"), nextEvent: {type: "ENDED"}}) 
  };
  return ({ updatedStore: updateStoreState(b, "WAITING_FOR_USER"), nextEvent: {type: "WAITING_FOR_USER"}});
};
const EndedHandler: storeFullHandler<"ENDED">  = async (b)=>{
  
  // we dont do anything because its the end of the convo
  // todo: update the store to the backend
  return { updatedStore: updateStoreState(b, "ENDED") };
};
const ErrorNoConvoHandler: storelessHandler<"ERROR_NO_CONVO"> = async (e)=>{
  // log error to backend
  console.error("Error: No conversation found");
  console.error("Error details: ", e.payload.error);

  const operatorNumber = await fetchOperatorFromFirebase(e.payload.twilioParams.To) || process.env.DEVELOPER_PHONE_NUMBER;
  if (!operatorNumber) throw new Error("No operator number found");
  
  const apologyMessage = "Transfering you to an operator, please hold on.";
  return { nextEvent: {type: "ESCALATE_TO_HUMAN",
    payload: {
      message: apologyMessage,
      operatorNumber,
      error: "no conversation found",
      twilioParams: e.payload.twilioParams
    },
  }};
};

const ErrorLlmHandler: storeFullHandler<"ERROR_LLM"> = async (store, event)=>{
  // log error to backend
  console.error("Error: llm error found");
  console.error("Error details: ", event.payload.error);

  const operatorNumber = await fetchOperatorFromFirebase(store.twilioParams.To) || process.env.DEVELOPER_PHONE_NUMBER;
  if (!operatorNumber) throw new Error("No operator number found");
  const apologyMessage = "Transfering you to an operator, please hold on.";
  return { updatedStore: updateStoreState(store, "ESCALATE_TO_HUMAN"), nextEvent: {type: "ESCALATE_TO_HUMAN",
    payload: {
      message: apologyMessage,
      operatorNumber,
      error: "no conversation found",
      twilioParams: store.twilioParams,
    },
  }};  
};
const EscalateToHumanHandler: storelessHandler<"ESCALATE_TO_HUMAN"> = async ()=>{
  // we do nothing here, we just pass the event to the emit function
  // we might want to log the error to the backend
  return;
};


// export const Effects: Record<StoreState, effectHandler | effectHandlerWithFullStore > = {
  // : { [K in StoreState]: effectHandler<K> | effectHandlerWithFullStore<K> }
export const Effects = {
  "CREATED": CreatedHandler,
  "RESPONDED": RespondedHandler,
  "PROCESSING_GREETING": ProcessingGreetingHandler,
  "WAITING_FOR_USER": WaitingForUserHandler,
  "NO_CUSTOMER_INPUT": NoCustomerInputHandler,
  "FETCHING_CUSTOMER_INPUT": FetchingCustomerInputHandler,
  "PROCESSING_LLM": ProcessingLlmHandler,
  "LLM_TEXT_RESPONSE": LlmTextResponseHandler,
  "LLM_COMMAND_RESPONSE": LlmCommandResponseHandler,
  "EXECUTING_COMMAND": ExecutingCommandHandler,
  "COMMAND_SUCCESS": CommandSuccessHandler,
  "COMMAND_FAILURE": CommandFailureHandler,
  "LLM_FETCH_RESPONSE": LlmFetchResponseHandler,
  "FETCHING_INFO": FetchingInfoHandler,
  "FETCH_SUCCESS": FetchSuccessHandler,
  "FETCH_FAILURE": FetchFailureHandler,
  "APPEND_MESSAGE_CONVO": AppendMessageConvoHandler,
  "SENDING_RESPONSE": SendingResponseHandler,
  "ENDED" : EndedHandler,
  "ERROR_NO_CONVO": ErrorNoConvoHandler,
  "ERROR_LLM": ErrorLlmHandler,
  "ESCALATE_TO_HUMAN": EscalateToHumanHandler,
} as const;
