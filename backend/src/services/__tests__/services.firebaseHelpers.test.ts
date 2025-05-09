import { createBusiness } from "../../models/business";
import { createStore } from "../../models/store";
import { createTwilioParams } from "../../test/createTwilioParams";
import { createMockFirestore } from "../../test/mockFirestore";
import { executeCommand,
  fetchBusinessByToNumber,
  fetchBusinessFromFirebase,
  fetchBusinessInfoFromFirebase,
  fetchOperatorFromFirebase,
  fetchStoreFromFirebase,
  getResponseFromLLM,
  saveBusinessToFirebase,
  saveStoreToFirebase } from "../firebaseHelpers";

const expectedStore = {
  CallSid: "testCallSid",
  state: "CREATED",
  lastUpdated: (new Date()).toISOString(),
  twilioParams: createTwilioParams(),
  messages: [
    {
      machineToCustomer: "welcome how can i help you?",
    }
  ],
};

const expectedBusiness = {
  primaryEmail: "expected@test.com",
  twilioIncomingPhoneNumber: "+15551234",
  operatorPhoneNumber: "+15554321",
  name: "Test Business",
  businessInfo: {
    testInfo: "testInfo",
  },
  admins: [],
};

const mockDb = createMockFirestore({
  business: {
    "expected@test.com": expectedBusiness,
  },
  call: {
    testCallSid: expectedStore,
  },
});


jest.mock("../firebaseService", () => {
  const actual = jest.requireActual("../firebaseHelpers");
  return {
    ...actual, // preserve saveStoreToFirebase, executeCommand, etc.
    getFirestoreDb: jest.fn(() => mockDb),
  };
});

describe("firebaseHelpers",()=>{
  beforeEach(() => {
    Object.values(mockDb.__mocks).forEach(fn => fn.mockClear());

  });

  test("saveStoreToFirebase should save a store to firebase", async ()=> {
    const expectedStore = createStore(createTwilioParams("someSid"));

    const result = await saveStoreToFirebase(expectedStore);

    expect(result).toEqual(expectedStore);

    expect(mockDb.__mocks.set).toHaveBeenCalledWith(expectedStore, { merge: true });
    expect(mockDb.__mocks.set).toHaveBeenCalledTimes(1);
    expect(mockDb.__data.call[expectedStore.CallSid]).toEqual(expectedStore);

  });

  test("fetchStoreFromFirebase should fetch a store by callSid ", async ()=> {

    const result = await fetchStoreFromFirebase("testCallSid");

    expect(result).toEqual(expectedStore);
    expect(mockDb.__mocks.get).toHaveBeenCalledTimes(1);
  });

  test("saveBusinessToFirebase should save a business to firebase ", async ()=> {

    const testBusiness = createBusiness("test@test.com", "1234567890", "0987654321", "testBusiness");

    const result = await saveBusinessToFirebase(testBusiness);
    expect(result).toEqual(testBusiness);
    expect(mockDb.__mocks.set).toHaveBeenCalledTimes(1);
    expect(mockDb.__data.business[testBusiness.primaryEmail]).toEqual(testBusiness);

  });

  test("fetchBusinessFromFirebase should fetch a business by email ", async ()=> {

    const result = await fetchBusinessFromFirebase("expected@test.com");
    expect(result).toEqual(expectedBusiness);
    expect(mockDb.__mocks.get).toHaveBeenCalledTimes(1);
  });

  test("fetchBusinessByToNumber should fetch a business by number", async ()=> {
    const result = await fetchBusinessByToNumber("+15551234");
    expect(result).toEqual(expectedBusiness);
    expect(mockDb.__mocks.where).toHaveBeenCalledWith("twilioIncomingPhoneNumber", "==", "+15551234");

  });

  test("fetchOperatorFromFirebase should an operator by number", async ()=> {

    const result = await fetchOperatorFromFirebase("+15551234");
    expect(result).toEqual(expectedBusiness.operatorPhoneNumber);
    expect(mockDb.__mocks.where).toHaveBeenCalledWith("twilioIncomingPhoneNumber", "==", "+15551234");
  });

  test("fetchBusinessInfoFromFirebase should fetch business info", async ()=> {

    const result = await fetchBusinessInfoFromFirebase("+15551234", "testInfo");
    expect(result).toEqual(expectedBusiness.businessInfo["testInfo"]);
    expect(mockDb.__mocks.where).toHaveBeenCalledWith("twilioIncomingPhoneNumber", "==", "+15551234");

  });

  test("executeCommand should return command result", async ()=> {

    const result = await executeCommand("testCommand");
    expect(result).toEqual({success: true, text: "command executed testCommand"});
  });

  test("getResponseFromLLM should get response from llm", async ()=> {

    const result = await getResponseFromLLM("testMessage");
    expect(result).toEqual({type: "text", expectReply: false, text: "this is a response from the LLM, customer message: testMessage"});

  });

});