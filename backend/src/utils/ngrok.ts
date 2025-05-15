import ngrok from "ngrok";
import { config } from "dotenv";
config(); // importing early so that other libraries can use env vars

const port = process.env.PORT || 3001;

export const ngrokUrlPromise = (async function () {
  const url = await ngrok.connect(parseInt(port + "", 10));
  console.log(`ngrok promise public url at ${url}`);
  return url;
})();
