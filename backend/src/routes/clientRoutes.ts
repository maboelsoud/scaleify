import { Router, Request, Response } from "express";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import {
  saveBusinessToFirebase,
  fetchBusinessFromFirebase,
  saveCustomerToFirebase,
  fetchCustomerFromFirebase,
} from "../firebase/dbHelpers";
import { createBusiness, Business } from "../models/business";
import { Customer } from "../models/customer";

const router = Router();

function getOAuthClient(redirectUri: string) {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  );
}

router.get("/:id/linkGoogle", async (req: Request, res: Response) => {
  const { id } = req.params;
  const code = req.query.code as string | undefined;
  let business: Business | void = await fetchBusinessFromFirebase(id);
  if (!business) {
    business = createBusiness(id, "", "", id);
    await saveBusinessToFirebase(business);
  }
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${req.protocol}://${req.get("host")}/client/${id}/linkGoogle`;
  const oAuth2Client = getOAuthClient(redirectUri);
  if (!code) {
    const url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar"],
    });
    return res.redirect(url);
  }

  const { tokens } = await oAuth2Client.getToken(code);
  if (tokens.refresh_token) {
    (business as Business).googleRefreshToken = tokens.refresh_token;
    await saveBusinessToFirebase(business as Business);
  }
  return res.json({ success: true });
});

router.post("/:id/check_availability", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { start, end } = req.body as { start: string; end: string };
  const business = await fetchBusinessFromFirebase(id);
  if (!business || !business.googleRefreshToken) {
    return res.status(404).json({ error: "business not linked" });
  }
  const oAuth2Client = getOAuthClient("postmessage");
  oAuth2Client.setCredentials({ refresh_token: business.googleRefreshToken });
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  const fb = await calendar.freebusy.query({
    requestBody: {
      timeMin: new Date(start).toISOString(),
      timeMax: new Date(end).toISOString(),
      items: [{ id: "primary" }],
    },
  });
  const busy = fb.data.calendars?.primary?.busy || [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  const avail: Array<{ start: string; end: string }> = [];
  let pointer = new Date(startDate);
  while (pointer < endDate) {
    const next = new Date(pointer.getTime() + 30 * 60 * 1000);
    const overlap = busy.some(
      (b) => new Date(b.start!) < next && new Date(b.end!) > pointer,
    );
    if (!overlap && next <= endDate) {
      avail.push({ start: pointer.toISOString(), end: next.toISOString() });
    }
    pointer = next;
  }
  return res.json(avail);
});

router.post("/:id/book_appointment", async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    start,
    end,
    customerId,
    fullName,
    email,
    phoneNumber,
    description,
  } = req.body as {
    start: string;
    end: string;
    customerId?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    description?: string;
  };
  const business = await fetchBusinessFromFirebase(id);
  if (!business || !business.googleRefreshToken) {
    return res.status(404).json({ error: "business not linked" });
  }
  let customer: Customer | void;
  if (customerId) {
    customer = await fetchCustomerFromFirebase(customerId);
    if (!customer) return res.status(404).json({ error: "customer not found" });
  } else {
    customer = {
      id: uuidv4(),
      fullName: fullName || "",
      email: email || "",
      phoneNumber: phoneNumber || "",
    };
    await saveCustomerToFirebase(customer);
  }
  const oAuth2Client = getOAuthClient("postmessage");
  oAuth2Client.setCredentials({ refresh_token: business.googleRefreshToken });
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `${(customer as Customer).fullName} Appointment`,
      description: `${description || ""}\nBusiness: ${business.name}\n$${
        business.businessInfo.address || ""
      }\n${business.businessInfo.phone || ""}`,
      start: { dateTime: new Date(start).toISOString() },
      end: { dateTime: new Date(end).toISOString() },
      attendees: [{ email: (customer as Customer).email }],
    },
  });
  return res.json({ success: true, eventId: event.data.id });
});

export default router;
