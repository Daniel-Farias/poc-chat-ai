import {
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async chat(@Query('message') message: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    if (!message?.trim()) {
      return this.sendError(res, 'INVALID_INPUT', 'Mensagem inválida.');
    }

    try {
      const allowed = await this.chatService.checkRateLimit();
      if (!allowed) {
        return this.sendError(
          res,
          'RATE_LIMIT',
          'You have exceeded your rate limit. Please try again later.'
        );
      }

      const stream = await this.chatService.streamAI(message);

      for await (const token of stream) {
        res.write(`data: ${token}\n\n`);
      }

      res.write(`event: end\ndata: {}\n\n`);
      res.end();
    } catch (err) {
      this.sendError(res, 'AI_ERROR', 'Error communicating with the AI.');
    }
  }

  private sendError(res: Response, type: string, message: string) {
    res.write(
      `event: error\ndata: ${JSON.stringify({ type, message })}\n\n`
    );
    res.write(`event: end\ndata: {}\n\n`);
    res.end();
  }

  @Get('health')
  health() {
    return { ok: true };
  }
}
