import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { openAI } from 'src/utils/config';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class ChatService {
  private readonly openai = new OpenAI({
    apiKey: openAI.apiKey,
  });

  private history: ChatMessage[] = [];
  private userHits: number[] = [];

  async checkRateLimit(): Promise<boolean> {
    const now = Date.now();
    this.userHits = this.userHits.filter((t) => now - t < 60_000);

    if (this.userHits.length >= 10) return false;

    this.userHits.push(now);
    return true;
  }

  async *streamAI(message: string): AsyncGenerator<string> {
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: 'Você é um assistente educado, objetivo e responde em português.',
    };
    const userMessage: ChatMessage = { role: 'user', content: message };

    this.history.push(userMessage);
    this.history = this.history.slice(-5);

    const completion = await this.openai.chat.completions.create({
      model: openAI.model,
      messages: [systemPrompt, ...this.history],
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of completion) {
      const text = chunk.choices[0]?.delta?.content;
      if (!text) continue;

      yield text;
      fullResponse += text;
    }

    this.history.push({
      role: 'assistant',
      content: fullResponse,
    });
  }
}
