import { Router } from "websocket-express";
import { Request } from 'express';

const router = new Router();

router.ws('/connect', async (req: Request, res)=> {
  const ws = await res.accept();
  console.log('accepted connection');

  ws.on('message', (msg)=> {
    const message = JSON.parse(msg.toString());
    console.log("🚀 ~ streamRelay.ts:16 ~ ws.on ~ message:", message);
    ws.send(
      JSON.stringify({
        type: "text",
        token: "this is a test",
        last: true,
      })
    );
  });


});

export default router;


// const wss = new WebSocketServer({port: 8080});

// wss.on('connection', function connection(ws){
//   ws.on('error', (err)=> {
//     console.log("on error:", err);
//   });

//   ws.on("message", (data)=> {
//     console.log('recieved: ', data)
//   });

//   ws.send("welcome to the websocket!");
// })
