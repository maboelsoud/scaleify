import request from "supertest";
import { app } from "../..";
import * as firebaseService from "../../firebase/config";
import { createMockFirestore } from "../../test/mockFirestore";
import { Firestore } from "firebase-admin/firestore";

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
});
