import express, {Request, Response} from "express";
import { config } from "dotenv";
config(); // importing early so that other libraries can use env vars
import { db, app as firebaseApp, auth } from "./services/firebaseService";
console.log("🚀 ~ firebaseApp:", firebaseApp !== null);

const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, resp) => {
  resp.send("hello world!");
});

app.get('/health', (req:Request, resp: Response)=> {
  resp.send("Server is healthy");
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
