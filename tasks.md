# ✅ Scaleify – Task Tracker (MVP)

## 🔹 1. Project Setup & Configuration

- [ ] Initialize GitHub repo & workspace
- [ ] Set up `frontend/` with Vite + React + Tailwind + Firebase config
- [ ] Set up `backend/` with Node.js + Express + TypeScript
- [ ] Configure `.env` for LLM, Firebase, etc.
- [ ] Enable Firebase Auth, Firestore, and Hosting
- [ ] Set up GCP service account + keys
- [ ] Set up Firebase Emulator for local testing

---

## 🔹 2. Twilio Voice Flow (MVP using `<Gather>` + `<Say>`)

- [ ] Buy a Twilio number
- [ ] Create TwiML handler route `/start`
  - [ ] Respond with `<Gather input="speech" speechModel="googlev2_telephony">`
- [ ] Create webhook route `/handle-speech`
  - [ ] Parse `SpeechResult`, `CallSid`, `From`
  - [ ] Load and update conversation history from Firestore
  - [ ] Format messages for LLM
  - [ ] Call Gemini or OpenAI API
  - [ ] Return `<Say>` with LLM response
- [ ] Handle fallbacks: silence, errors, retries
- [ ] Handle `/call-completed` webhook to clean up session

---

## 🔹 3. Backend Services

- [ ] `stt.ts`: Extract STT input from webhook
- [ ] `tts.ts`: Use `<Say>` for TTS generation
- [ ] `llm.ts`: LLM request handler (Gemini/OpenAI switchable)
- [ ] `firestore.ts`: Conversation & user state management
  - [ ] `messages[]` by `CallSid`
  - [ ] `customers[]` by phone
  - [ ] `calls[]` metadata logger
- [ ] `tools/bookAppointment.ts`: mock function handler

---

## 🔹 4. Frontend Dashboard (Admin Mode)

- [ ] Set up Firebase Auth (email/password + Google)
- [ ] Build auth hook + protected route wrapper
- [ ] Build sidebar layout + top nav

### 📋 Pages

- [ ] Dashboard
  - [ ] Show total call count, summaries
- [ ] Customers
  - [ ] List customers
  - [ ] Click → customer profile with call history
- [ ] Calls
  - [ ] Scrollable feed of recent calls
  - [ ] Expandable cards showing transcript + tool
- [ ] Appointments (toggle)
  - [ ] Calendar or list of mock bookings
- [ ] Orders (toggle)
  - [ ] Card view with status chips
- [ ] Simulation (Dev Mode)
  - [ ] Text + mic input
  - [ ] Display LLM result
  - [ ] Writes to dev Firestore only

---

## 🔹 5. Dev Experience

- [ ] Add `.env` toggle for dev/prod Firebase
- [ ] Set up Firebase Emulator Suite
- [ ] Ensure Simulation tab writes to dev DB
- [ ] Set up GitHub Action: lint & typecheck
- [ ] GitHub Action: Deploy frontend to Firebase Hosting
- [ ] GitHub Action: Deploy backend to Cloud Run

---

## 🔹 6. Testing and QA

- [ ] Simulate full call flow:
  - [ ] Twilio call → webhook → LLM → TTS
- [ ] Simulation input → LLM → fake TTS → log display
- [ ] Confirm Firestore security rules
- [ ] Validate auth guard on frontend routes

---

## 🔮 Future Features (Out of Scope for MVP)

- [ ] Use `<ConversationRelay>` + WebSocket for real-time voice interaction
- [ ] Stream LLM output token-by-token
- [ ] Enable mid-response interruption
- [ ] Google Calendar appointment sync
- [ ] Toast API order processing
- [ ] Clarification logic (“Can you spell that?”)
- [ ] Translation / multi-language
- [ ] Audio recordings (GCS)
- [ ] Ring-through to front desk
- [ ] Live transcript view for admins
- [ ] Admin vs staff roles
