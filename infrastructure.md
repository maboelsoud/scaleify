scaleify/
├── backend/ (Node.js + Express)
│   ├── index.js
│   ├── routes/
│   │   └── twilio.js
│   ├── services/
│   │   ├── stt.js
│   │   ├── tts.js
│   │   ├── llm.js             # Abstract LLM logic here (Gemini, GPT, etc)
│   │   ├── firestore.js
│   │   └── auth.js            # Firebase or alternate provider logic
│   ├── tools/
│   │   └── bookAppointment.js
│   ├── utils/
│   └── firebase.config.js
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