import { apiURL } from "@/utils/config";

export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface ChatStatus {
  status: "idle" | "connecting" | "streaming";
}

export type ErrorType =
  | "NO_NETWORK"
  | "SERVER_UNAVAILABLE"
  | "RATE_LIMIT"
  | "AI_ERROR"
  | "UNKNOWN";

export interface ChatError {
  type: ErrorType;
  message?: string;
}

export enum ErrorMessages {
  NO_NETWORK = "📡 Sem conexão de rede.",
  SERVER_UNAVAILABLE = "⚠ Servidor indisponível.",
  RATE_LIMIT = "🚫 Limite de requisições excedido.",
  AI_ERROR = "🤖 Erro na comunicação com a IA.",
  UNKNOWN = "❌ Erro desconhecido.",
};

const STREAM_TIMEOUT = 15000;

export class ChatClient {
  private es: EventSource | null = null;
  private timeout: number | null = null;
  private closedByClient = false;
  private assistantMessage: ChatMessage | null = null;

  constructor(
    private onMessage: (msg: ChatMessage, replace?: boolean) => void,
    private onStatusChange: (status: ChatStatus["status"]) => void,
    private onError: (err: ChatError) => void
  ) { }

  closeConnection() {
    this.closedByClient = true;
    this.es?.close();
    this.es = null;
    this.assistantMessage = null;
    this.onStatusChange("idle");
    if (this.timeout) clearTimeout(this.timeout);
  }

  pushSystem(text: string) {
    this.onMessage({ role: "system", content: text });
  }

  private handleError(type: ErrorType) {
    this.onError({ type });
    this.pushSystem(this.getErrorMessage(type));
  }

  private getErrorMessage(type: ErrorType) {
    return ErrorMessages[type] || ErrorMessages.UNKNOWN;
  }

  private startTimeout() {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => {
      this.closeConnection();
      this.handleError("AI_ERROR");
    }, STREAM_TIMEOUT);
  }

  openStream(message: string) {
    this.closeConnection();
    this.closedByClient = false;
    this.onStatusChange("connecting");

    const url = `${apiURL}/chat?message=${encodeURIComponent(message)}`;
    this.es = new EventSource(url);

    this.startTimeout();

    this.es.onopen = () => {
      this.onStatusChange("streaming");
    };

    this.es.onmessage = (event) => {
      this.startTimeout();
      if (!this.assistantMessage) {
        this.assistantMessage = { role: "assistant", content: event.data };
        this.onMessage(this.assistantMessage);
        return;
      }

      this.assistantMessage.content += event.data;
      this.onMessage(this.assistantMessage, true);
    };

    this.es.addEventListener("end", () => {
      this.closeConnection();
    });

    this.es.addEventListener("server-error", (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        this.closeConnection();

        if (payload.type === "RATE_LIMIT") {
          this.handleError("RATE_LIMIT");
        } else {
          this.handleError("AI_ERROR");
        }
      } catch {
        this.closeConnection();
        this.handleError("AI_ERROR");
      }
    });

    this.es.onerror = async () => {
      if (this.closedByClient) return;

      this.closeConnection();

      if (!navigator.onLine) {
        this.handleError("NO_NETWORK");
        return;
      }

      try {
        const res = await fetch(`${apiURL}/chat/health`, { cache: "no-store" });
        if (!res.ok) this.handleError("SERVER_UNAVAILABLE");
      } catch {
        this.handleError("SERVER_UNAVAILABLE");
      }
    };
  }
}
