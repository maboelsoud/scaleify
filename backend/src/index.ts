import express, {json, Request, Response, urlencoded} from "express";
import { config } from "dotenv";
config(); // importing early so that other libraries can use env vars
import { db, app as firebaseApp, auth } from "./services/firebaseService";
import twilio from 'twilio'
import twiliorouterRoutes from "./routes/twilioRoutes";
console.log("🚀 ~ firebaseApp:", firebaseApp !== null);

const app = express();
const port = process.env.PORT || 3001;

// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));
app.use(json());

app.get("/", (req, resp) => {
  resp.send("hello world!");
});

app.use('/twilio', twilio.webhook({validate: false}), twiliorouterRoutes);

app.get('/health', (req:Request, resp: Response)=> {
  resp.send("Server is healthy");
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
