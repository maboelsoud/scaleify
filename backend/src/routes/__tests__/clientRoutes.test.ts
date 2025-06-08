import request from "supertest";
import { app } from "../..";
import * as firebaseService from "../../firebase/config";
import { createMockFirestore } from "../../test/mockFirestore";
import { Firestore } from "firebase-admin/firestore";

jest.mock("googleapis", () => {
  const mOAuth = {
    generateAuthUrl: jest.fn(() => "https://google.com"),
    getToken: jest.fn(() => ({ tokens: { refresh_token: "rt" } })),
    setCredentials: jest.fn(),
  };
  return {
    google: {
      auth: { OAuth2: jest.fn(() => mOAuth) },
      calendar: jest.fn(() => ({
        freebusy: {
          query: jest.fn(() =>
            Promise.resolve({
              data: { calendars: { primary: { busy: [{ start: "2024-01-01T00:00:00Z", end: "2024-01-01T00:30:00Z" }] } } },
            }),
          ),
        },
        events: {
          insert: jest.fn(() => Promise.resolve({ data: { id: "ev123" } })),
        },
      })),
    },
  };
});

describe("Client routes", () => {
  test("GET /client/:id/linkGoogle redirects", async () => {
    const mockDb = createMockFirestore({});
    jest
      .spyOn(firebaseService, "getFirestoreDb")
      .mockImplementation(() => mockDb as unknown as Firestore);

    const res = await request(app).get("/client/test_business/linkGoogle");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("https://");
  });

  test("POST /client/:id/check_availability returns slots", async () => {
    const mockDb = createMockFirestore({
      business: { test_business: { googleRefreshToken: "token" } },
    });
    jest
      .spyOn(firebaseService, "getFirestoreDb")
      .mockImplementation(() => mockDb as unknown as Firestore);

    const res = await request(app)
      .post("/client/test_business/check_availability")
      .send({ start: "2024-01-01T00:00:00Z", end: "2024-01-01T01:00:00Z" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { start: "2024-01-01T00:30:00.000Z", end: "2024-01-01T01:00:00.000Z" },
    ]);
  });

  test("POST /client/:id/book_appointment creates event", async () => {
    const mockDb = createMockFirestore({
      business: { test_business: { googleRefreshToken: "token", name: "Test", businessInfo: {} } },
    });
    jest
      .spyOn(firebaseService, "getFirestoreDb")
      .mockImplementation(() => mockDb as unknown as Firestore);

    const res = await request(app)
      .post("/client/test_business/book_appointment")
      .send({
        start: "2024-01-01T00:30:00Z",
        end: "2024-01-01T01:00:00Z",
        fullName: "Bob",
        email: "bob@test.com",
        phoneNumber: "123",
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, eventId: "ev123" });
    expect(mockDb.__data.customer).toBeDefined();
  });
});
