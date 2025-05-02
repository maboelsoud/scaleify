scaleify/
├── backend/ (Node.js + Express)
│   ├── index.ts
│   ├── routes/
│   │   └── twilio.ts
│   ├── services/
│   │   ├── stt.ts
│   │   ├── tts.ts
│   │   ├── llm.ts             # Abstract LLM logic here (Gemini, GPT, etc)
│   │   ├── firestore.ts
│   │   └── auth.ts            # Firebase or alternate provider logic
│   ├── tools/
│   │   └── bookAppointment.ts
│   ├── fsm/
│   │   ├── effects.ts
│   │   ├── store.ts
│   │   └── dispatcher.ts
│   ├── utils/
│   └── firebase.config.ts
│
├── frontend/ (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── Calls.tsx
│   │   │   ├── Appointments.tsx
│   │   │   ├── Orders.tsx
│   │   │   └── Simulation.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── auth.ts             # Firebase Auth wrapper
│   ├── public/
│   └── vite.config.ts
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── firebase.json
├── firestore.rules
└── README.md