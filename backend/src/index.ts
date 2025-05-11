import express, { json, Request, Response, urlencoded } from "express";
import { config } from "dotenv";
config(); // importing early so that other libraries can use env vars
import twilio from "twilio";
import twiliorouterRoutes from "./routes/twilioRoutes";
import { getGeminiResponse } from "./llm/gemini";

export const app = express();
const port = process.env.PORT || 3001;

// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));
app.use(json());

app.get("/", (req, resp) => {
  resp.send("hello world!");
});

app.use("/twilio", twilio.webhook({ validate: false }), twiliorouterRoutes);

app.get("/health", (req: Request, resp: Response) => {
  resp.send("Server is healthy");
});

app.post('/ai', async (req: Request, resp: Response)=> {
  const prompt = req.body.text;
  if (!prompt) {
    throw "no prompt given"
    resp.status(500).send("no prompt given");
  } else {
    const result = await getGeminiResponse(prompt);

    resp.type('application/json').send({result});

  }
});

// in testing jest complains that this keeps running after the test is over
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`app listening on port ${port}`);
  });
}
