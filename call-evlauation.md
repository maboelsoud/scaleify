# 📞 AI Call System Evaluation Guide with Scoring

Use this guide to evaluate and score the performance of your AI-powered call system. Each section includes a score out of 10 to help quantify readiness across multiple calls.

---

## ✅ 1. Success Criteria (Score: /10)

Evaluate the overall performance of the call using the following metrics:

| Criterion                        | Max Points | Score | Notes |
|----------------------------------|------------|-------|-------|
| Task completed successfully      | 2          |       |       |
| AI gave clear, understandable responses | 2     |       |       |
| Recovered from errors gracefully | 2          |       |       |
| Followed correct FSM transitions | 2          |       |       |
| Maintained natural tone/persona  | 2          |       |       |

**Subtotal (Max 10):** `/10`

---

## 🧪 2. Scenario-Based Testing (Score: /10)

For each test case, mark pass/fail and take notes. Use 1 point per passed scenario.

| Scenario                                               | Pass/Fail | Notes |
|--------------------------------------------------------|-----------|-------|
| Booking an appointment (happy path)                    |           |       |
| Asking for pricing before giving name                  |           |       |
| Silent caller (timeout/clarification)                  |           |       |
| Noisy caller or garbled speech (ASR resilience)        |           |       |
| Changing appointment time midway                       |           |       |
| Wrong number call                                      |           |       |
| Asking about services or clinic hours                  |           |       |
| Repeating or rephrasing information                    |           |       |
| Off-topic/complaints                                   |           |       |
| Vague or unclear responses from caller                 |           |       |

**Subtotal (Max 10):** `/10`

---

## 🎧 3. Manual Call Review (Score: /10)

Rate overall call quality through human QA:

| Review Question                                      | Max Points | Score | Notes |
|------------------------------------------------------|------------|-------|-------|
| AI maintained appropriate tone and pace              | 2          |       |       |
| FSM state tracking was consistent and correct        | 2          |       |       |
| Transitions between topics/states felt natural       | 2          |       |       |
| AI handled interruptions or ambiguities gracefully   | 2          |       |       |
| Voice and speech sounded clear and pleasant          | 2          |       |       |

**Subtotal (Max 10):** `/10`

---

## 🧾 Total Call Score

| Category                    | Score |
|-----------------------------|-------|
| ✅ Success Criteria          |       |
| 🧪 Scenario Testing          |       |
| 🎧 Manual Review             |       |
| **Total (Out of 30)**       |       |

> 💡 Tip: Track multiple calls in a spreadsheet using this format to average scores across different callers, test cases, or model versions (e.g., ChatGPT vs Gemini).
