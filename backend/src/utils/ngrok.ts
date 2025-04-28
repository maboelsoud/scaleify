import ngrok from "ngrok";

export default async function connectNgrok (port: number) {
    const url = await ngrok.connect(port);
    console.log(`ngrok public url at ${url}`);
};