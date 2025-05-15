import { json, Request, Response, urlencoded } from "express";
import { config } from "dotenv";
config(); // importing early so that other libraries can use env vars
config({path: ".env.ngrok"}); // importing early so that other libraries can use env vars
import twilio from "twilio";
import twiliorouterRoutes from "./routes/twilioRoutes";
import streamRelay from "./routes/streamRelay";
import { WebSocketExpress } from "websocket-express";

// export const app = express();
export const app = new WebSocketExpress();
const port = process.env.PORT || 3001;

// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));
app.use(json());

app.get("/", (req, resp) => {
  resp.send("hello world!");
});

app.use("/twilio", twilio.webhook({ validate: false }), twiliorouterRoutes);
// app.use("/streamRelay", twilio.webhook({ validate: false }), streamRelay);
app.use("/streamRelay", streamRelay);

app.get("/health", (req: Request, resp: Response) => {
  resp.send("Server is healthy");
});

// in testing jest complains that this keeps running after the test is over
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`app listening on port ${port}`);
  });
}
