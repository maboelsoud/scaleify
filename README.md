# 📞 Scaleify – AI Voice Assistant for Local Businesses
![CI](https://github.com/maboelsoud/scaleify/actions/workflows/ci.yml/badge.svg)

**Scaleify** is a drop-in AI phone assistant for clinics, restaurants, and other local businesses. When the front desk doesn’t pick up, Scaleify answers calls, provides information, takes appointments or orders, and logs everything in a dashboard.

---

## 🚀 Features

- 🎙️ **AI-Powered Call Handling**
  - Responds to customer calls using voice
  - Provides office hours, booking info, or order support

- 📅 **Appointment & Order Processing**
  - Integrates with Google Calendar (future)
  - Restaurant orders via Toast API (future)

- 🧠 **LLM-Driven Assistant**
  - Responds using Gemini or OpenAI
  - Function calling to handle bookings and tasks

- 🧾 **Admin Dashboard**
  - View call logs, customers, appointments, and orders
  - Built with Vite + React + Tailwind

- 🧪 **Simulation Mode for Devs**
  - Test the full flow without using real Twilio calls

---

## 🏗️ Tech Stack

| Layer       | Tech                                        |
|-------------|---------------------------------------------|
| Frontend    | React, Vite, Tailwind, Shadcn UI, Firebase Auth |
| Backend     | Node.js, Express, TypeScript                |
| AI / LLM    | OpenAI / Gemini (switchable)                |
| Voice       | Twilio `<Gather>` / `<Say>` (MVP), WebSocket (future) |
| Database    | Firestore (via Firebase Emulator Suite)     |
| CI/CD       | GitHub Actions + Firebase Hosting + Cloud Run |

---

## 🛠️ Local Development

### Prerequisites
- Node.js (via `.nvmrc`)
- Firebase CLI
- `gcloud` CLI (for Cloud Run deploys)
- `ngrok` (if testing Twilio webhooks locally)

### Setup

```bash
# Clone the repo
git clone https://github.com/maboelsoud/scaleify.git
cd scaleify

# set up .env file

# Set up backend
cd backend
npm install

# Set up frontend
cd ../frontend
npm install

# to run in dev
npm run dev
# it should concurrently run the backend and frontend and the emulator for you
```

🔍 Testing the Call Flow

1. View the FSM state machine

The FSM that controls the AI voice assistant is visualized here:



It shows how a phone call progresses from the CREATED state through different stages like greeting, listening, LLM processing, executing commands, and escalation.

2. Run tests

From the backend folder:
```
cd backend
npm run test
```
This runs the unit and integration tests for the FSM and Firebase interactions.

3. In a different terminal, use Twilio + ngrok to simulate real calls
```
cd backend
npm run tunnel
```
This will start an ngrok tunnel and print a public URL. This means that calls the URL will correspond calls on your localhost.
After running the project locally, use this URL to configure your Twilio phone number webhook (for /twilio/start and /twilio/respond).

Now you can call your Twilio number and interact with the AI assistant in real time.

## 🧪 Dev Simulation
Use the “Simulation” tab in the frontend to test your AI voice assistant:

- Type or speak mock user input
- See how the LLM responds
- View mock function calls like bookAppointment

---

## Client API

Endpoints for connecting a business to Google Calendar and scheduling appointments.

### `GET /client/:id/linkGoogle`

- When called without a `code` query parameter the route redirects to Google so the business owner can authorize access.
- After authorization Google redirects back with `?code=...` and the endpoint stores the refresh token and responds with `{ success: true }`.

### `POST /client/:id/check_availability`

- **Body:**
  - `start` – ISO start datetime
  - `end` – ISO end datetime
- Returns a list of open 30‑minute slots between `start` and `end` using the linked calendar.

### `POST /client/:id/book_appointment`

- **Body:**
  - `start` – ISO start datetime
  - `end` – ISO end datetime
  - `customerId` – existing customer ID *(optional)*
  - `fullName`, `email`, `phoneNumber` – details for a new customer
  - `description` – notes to include on the event *(optional)*
- Creates the calendar event and returns `{ success: true, eventId }`.


## 🧱 Future Roadmap
- 🔄 Google Calendar Sync
- 🥡 Toast API integration
- 🌍 Multilingual support
- 🔊 Real-time audio streaming (via WebSocket)
- 🧠 Mid-response interruption
- 📜 Audio recordings in GCS

## 👨‍💻 Maintainer
Created and maintained by @maboelsoud

## 📄 License
MIT – Free for commercial or personal use.
