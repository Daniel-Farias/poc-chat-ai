import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ChatModule } from '../../src/chat/chat.module';

describe('ChatController Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ChatModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('GET /api/chat/health returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/chat/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /api/chat with empty message returns error', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/chat')
      .query({ message: '' });
    expect(res.text).toContain('INVALID_INPUT');
  });

  afterAll(async () => {
    await app.close();
  });
});
