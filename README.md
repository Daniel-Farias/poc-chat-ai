# POC Chat AI

Uma prova de conceito de chat com **streaming**, **rate limiting**, **tema claro/escuro**, e integração com OpenAI.

---

## 🚀 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/Daniel-Farias/poc-chat-ai.git
cd poc-chat-ai
````

2. Instale dependências no backend e frontend:

```bash
# Backend
cd backend
yarn install

# Frontend
cd ../frontend
yarn install
```

---

## 🔑 Configuração de Ambiente

Para usar OpenAI:

1. Crie um arquivo `.env` no backend:

```env
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXX
MODEL="gpt-4o-mini"
```

---

## 💻 Rodando localmente

### Backend (NestJS)

```bash
cd backend
yarn start:dev
```

* Rodará em: `http://localhost:8080`

### Frontend (Next.js)

```bash
cd frontend
yarn dev
```

* Rodará em: `http://localhost:3000`

---

## 🧪 Testes

### Backend

```bash
cd backend
yarn test
```

* Inclui:

  * 3 testes unitários
  * 1 teste de integração (endpoint SSE)
  * Teste de streaming (resposta em chunks)

---

## ⚙️ Decisões Técnicas

### Por quê React + Vite no frontend?

* Setup extremamente rápido para POC
* React Context + Hooks facilita gestão de estado global (`ChatContext`)
* Trade-off: Next.js poderia oferecer SSR, mas para streaming SSE local e prototipagem, React puro + Vite foi mais leve

### Por quê NestJS no backend?

* Estrutura modular e testável
* Suporte nativo a streaming SSE via EventSource
* Facilita injeção de dependências e organização de serviços (`ChatService`)

### Por quê OpenAI?

* Streaming real e confiável (`completion.stream = true`)
* Documentação completa e SDK oficial
* Claude poderia ser usado, mas OpenAI permitiu testes contínuos e fácil integração com SSE
* Trade-off: Claude teria limitação de tokens por requisição e menos exemplos de streaming

### Implementação do Streaming SSE

* Inicialmente, mensagens chegavam quebradas:

```
Olá
!
Como
posso
ajudar
você
```

* Solução:

  * Yield **cada token individualmente** no backend
  * No frontend, concatenar no contexto (`ChatContext`) e renderizar como mensagem única
  * Frontend mostra indicador `typing` enquanto SSE está ativo
  * Timeout de 15s para encerrar stream automaticamente

### Rate Limiting

* Limite: 10 mensagens por minuto
* Implementado com array de timestamps no backend
* Retorno SSE com evento `error` + tipo `RATE_LIMIT` para frontend mostrar mensagem de sistema
* Frontend exibe visualmente o aviso, sem tentar reconectar automaticamente

### Contexto e Estado Global

* `ChatContext` mantém:

  * Lista de mensagens (`user`, `assistant`, `system`)
  * Status de conexão (`idle`, `connecting`, `streaming`)
  * Funções: `addMessage`, `clearChat`, `sendMessage`
* `ChatClient` modulariza comunicação SSE e lógica de timeout

### Error Handling

* Offline ou servidor down agora mostra mensagem de sistema no frontend:

  * `"📡 Sem conexão com a internet."`
  * `"⚠ Servidor indisponível."`
  * `"❌ Erro ao conectar ao servidor."`

---

## 🛠 Desafios enfrentados

1. **Streaming SSE**

   * Problema: mensagens quebradas em várias linhas
   * Solução: yield cada token individual no backend, concatenar no frontend

2. **Error Handling**

   * Problema: offline ou servidor indisponível não mostrava feedback
   * Solução: SSE `onerror` + fetch health + mensagem de sistema

---

## 💡 Melhorias Futuras

* [ ] Deploy completo em Vercel
* [ ] Persistência de histórico com Prisma
* [ ] Suporte a múltiplos usuários simultâneos
* [ ] UI mais avançada (avatars, rich text)
* [ ] Suporte a Múltiplos Chats

---

## 🔗 Referências

* [OpenAI Node.js SDK](https://www.npmjs.com/package/openai)
* [NestJS SSE Docs](https://docs.nestjs.com/techniques/streaming)
