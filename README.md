# 📞 Scaleify – AI Voice Assistant for Local Businesses

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
`


## 🧪 Dev Simulation
Use the “Simulation” tab in the frontend to test your AI voice assistant:

- Type or speak mock user input
- See how the LLM responds
- View mock function calls like bookAppointment

---

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
