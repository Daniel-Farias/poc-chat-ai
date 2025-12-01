import { ChatService } from '../../src/chat/chat.service';

describe('ChatService Streaming SSE (real OpenAI)', () => {
  let service: ChatService;

  beforeEach(() => {
    service = new ChatService();
  });

  it('should stream multiple chunks correctly', async () => {
    const chunks: string[] = [];
    const generator = service.streamAI('Teste streaming SSE real');

    for await (const chunk of generator) {
      chunks.push(chunk);
    }

    const fullResponse = chunks.join('');
    expect(chunks.length).toBeGreaterThan(1);
    expect(fullResponse.length).toBeGreaterThan(0);

    const assistantMsg = service['history'].find((m) => m.role === 'assistant');
    expect(assistantMsg).toBeDefined();
    expect(assistantMsg!.content).toBe(fullResponse);
  }, 30000);
});
