import express, {Request, Response} from "express";
import { config } from "dotenv";

config();
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
