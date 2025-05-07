
export interface TwilioVoiceWebhookParams {
  // Call metadata
  CallSid: string;             // Unique ID for the call
  CallStatus: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'failed' | string;
  Direction: 'inbound' | 'outbound-api' | string;
  ApiVersion: string;

  // Phone numbers
  From: string;                // Caller (E.164 format, e.g. +14155552671)
  To: string;                  // Callee (your Twilio number)
  Caller: string;
  Called: string;

  // Location metadata
  FromCity?: string;
  FromState?: string;
  FromZip?: string;
  FromCountry?: string;

  ToCity?: string;
  ToState?: string;
  ToZip?: string;
  ToCountry?: string;

  CallerCity?: string;
  CallerState?: string;
  CallerZip?: string;
  CallerCountry?: string;

  CalledCity?: string;
  CalledState?: string;
  CalledZip?: string;
  CalledCountry?: string;

  // Account
  AccountSid: string;

  // STT result (only present on /completed after <Gather>)
  SpeechResult?: string;
  Confidence?: string;

  // Language info
  Language?: string;
}


export interface singleTalk {
  customerToMachine?: string;
  machineToCustomer?: string;
  machineToSystem?: string;
  systemToMachine?: string;
};

export type ConvoHistory = singleTalk[];

export type StoreState = 
| `CREATED`               // Conversation created from `/start`
| `RESPONDED`             // Conversation created from `/responded`
| `PROCESSING_GREETING`   // Generates greeting message
| `WAITING_FOR_USER`      // Waits for user speech input (via `<Gather>`)
| `NO_CUSTOMER_INPUT`     // STT was silent or empty
| `FETCHING_CUSTOMER_INPUT`// Gets `SpeechResult` from Twilio webhook
| `PROCESSING_LLM`        // Sends convo history to LLM
| `LLM_TEXT_RESPONSE`     // LLM returned a text reply
| `LLM_COMMAND_RESPONSE`  // LLM wants to run a function (e.g., `book_appointment`)
| `EXECUTING_COMMAND`     // Backend tool running
| `COMMAND_SUCCESS`       // Tool succeeded (e.g., appointment booked)
| `COMMAND_FAILURE`       // Tool failed or returned invalid result
| `LLM_FETCH_RESPONSE`    // LLM requested a fetch (e.g., hours)
| `FETCHING_INFO`         // Run fetch logic
| `FETCH_SUCCESS`         // Info returned
| `FETCH_FAILURE`         // Info fetch failed
| `APPEND_MESSAGE_CONVO`      // Add the message to conversation
| `SENDING_RESPONSE`      // TwiML response should be rendered
| `ENDED`                 // Final call step (e.g., `Hangup`)
| `ERROR_NO_CONVO`        // No conversation found (bad CallSid)
| `ERROR_LLM`             // LLM request failed
| `ESCALATE_TO_HUMAN`     // Transition call to human, or send apology message

export interface FullStore {
  state: StoreState;
  lastUpdated: Date;
  twilioParams: TwilioVoiceWebhookParams;
  customerId: string;
  messages: ConvoHistory;
}


export function createStore(reqBody: object): FullStore {
  return {
    twilioParams: reqBody as unknown as TwilioVoiceWebhookParams,
    state:  "CREATED",
    lastUpdated: new Date(),
    // customerId: "unknown",
    customerId: ( reqBody as unknown as TwilioVoiceWebhookParams )?.CallSid,
    messages: [],
  };
}


export function updateStoreState(store: FullStore, newState: StoreState): FullStore {
  return {
    ...store,
    state: newState,
    lastUpdated: new Date(),
  };
}
