import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

export const openAI = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || '',
}

export const appConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
}