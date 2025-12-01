import { ChatService } from '../../src/chat/chat.service';

describe('ChatService Unit Tests (real OpenAI)', () => {
  let service: ChatService;

  beforeEach(() => {
    service = new ChatService();
  });

  it('should enforce rate limit', async () => {
    for (let i = 0; i < 10; i++) {
      const allowed = await service.checkRateLimit();
      expect(allowed).toBe(true);
    }

    const allowed = await service.checkRateLimit();
    expect(allowed).toBe(false);
  });

  it('should keep only last 5 messages in history', async () => {
    for (let i = 1; i <= 6; i++) {
      service['history'].push({ role: 'user', content: `msg ${i}` });
      service['history'] = service['history'].slice(-5);
    }
    expect(service['history'].length).toBe(5);
    expect(service['history'][0].content).toBe('msg 2');
  });

  it('should generate assistant response and save in history', async () => {
    const gen = service.streamAI('Olá teste unitário');
    let fullResponse = '';
    for await (const chunk of gen) {
      fullResponse += chunk;
    }

    const assistantMsg = service['history'].find((m) => m.role === 'assistant');
    expect(assistantMsg).toBeDefined();
    expect(assistantMsg!.content).toBe(fullResponse);
    expect(fullResponse.length).toBeGreaterThan(0);
  });
});
