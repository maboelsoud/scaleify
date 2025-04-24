# 📞 Scaleify – Planning & Architecture

## 🎯 High-Level Vision

Scaleify is a voice-first AI assistant platform that answers phone calls for local businesses (e.g., clinics, restaurants) when the front desk is unavailable. It:

- Greets callers
- Provides office info (hours, location)
- Books appointments (via Google Calendar)
- Takes orders (for restaurants, via Toast API)
- Logs messages with customer name, number, and request
- Keeps a record of all calls and conversations for admin review

---

## 🔨 Tech Stack

| Component             | Tool/Platform              |
|-----------------------|----------------------------|
| Backend               | Node.js + Express          |
| Frontend              | React + Vite + Tailwind    |
| Database              | Firestore (Firebase)       |
| Auth                  | Firebase Auth              |
| Hosting               | Firebase Hosting (frontend) + Cloud Run (backend) |
| TTS                   | Twilio `<Say>` (Google/Polly voices) |
| STT                   | Twilio `<Gather input="speech">` with `googlev2_telephony` |
| AI                    | Gemini / GPT-4 (switchable via `.env`) |
| CI/CD                 | GitHub Actions             |

---

## ✅ MVP Scope (Launch Demo)

### 🧠 Conversation Flow

- Use **`<Gather>`** for speech input, with `speechModel="googlev2_telephony"`
- Use **`<Say>`** for TTS response (using Twilio’s Google/Polly voices)
- Send STT result via **HTTP POST** to backend
- Backend handles:
  - Tracking session via `CallSid`
  - Storing conversation history in Firestore
  - Passing context to LLM (Gemini/GPT)
  - Returning assistant reply for TTS
- State is restored per call by loading message history from DB

### 📋 MVP Features

- [x] Answer incoming calls with a custom greeting per business
- [x] Log caller number and interaction
- [x] STT with Twilio `<Gather>`
- [x] LLM-generated responses
- [x] TTS with Twilio `<Say>` (Google/Polly voice)
- [x] Appointment booking via mock `bookAppointment()` function
- [x] Admin dashboard with:
  - Customer list
  - Call log with summary + transcript
  - Appointment tab (calendar or list)
  - Dev simulation tab (text/mic input)
- [x] Auth with Firebase (admin-only for now)

---

## 🧪 Developer Simulation

- Local "Dev Mode" UI to simulate phone calls
- Supports both:
  - Text input (type what the caller would say)
  - Mic input (for testing STT locally)
- Dev simulation saves to **dev DB**, not production
- Controlled by Firebase project environment (not a toggle)

---

## 🚀 Future Plans

### 🧠 Enhanced Voice Infrastructure
- Switch to **`<ConversationRelay>` + WebSockets** for real-time, interruptible dialogue
- Handle full-duplex STT/TTS interaction over socket
- Use streaming Gemini/GPT responses
- Enable interruption mid-TTS playback

### 🛠 System Enhancements
- Real Toast API integration for restaurant ordering
- Google Calendar sync for live appointment booking
- Multi-language support (translation or multi-voice)
- Clarification logic (e.g., “Can you repeat that?”, “How do you spell that?”)
- Named tool calls (e.g., `getOfficeHours`, `rescheduleAppointment`)
- Admin vs. staff roles
- Audio recording and playback (saved to GCS)
- Firestore Emulator integration for local dev
- Voice feedback testing with OpenAI/Google streaming TTS
- Reconnect logic for conversation sessions (via `CallSid`)

---

## 💡 Key Design Decisions

- **No TTS hosting** in MVP — `<Say>` handles speech
- **No WebSocket server yet** — all logic over HTTP
- **Chat history** managed via `CallSid` in Firestore
- **LLM is stateless** — history must be included in every request
- **Simulation writes to local dev DB**, separate from prod

---