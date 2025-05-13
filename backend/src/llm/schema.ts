import { z } from "genkit";


export const answerSchema = z.object({
  type: z.enum(["text", "fetch", "execute"])
    .describe("The type of response. Use 'text' for replies, 'fetch' to request data, 'execute' to perform an action."),
  
  expectReply: z.boolean()
    .describe("Set to false if the conversation to hang up the phone. True if a customer response is expected."),

  text: z.string().optional()
    .describe("Used if type is 'text'. This is what the assistant will say."),

  fetch: z.string().optional()
    .describe("Used if type is 'fetch'. Describe what info to retrieve, e.g., 'availability for Friday'."),

  execute: z.string().optional()
    .describe("Used if type is 'execute'. Describe the action to perform, e.g., 'book massage at 3pm'.")
}).describe("A structured response from the assistant with reply type and action intent.");;