import { useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { Message } from "@/components/Message";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ErrorMessages } from "@/services/api/client";

export function Chat() {
  const { messages, status, sendMessage, error, isOnline } = useChat();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (!value || status === "streaming") return;

    sendMessage(value);
    if (inputRef.current) inputRef.current.value = "";
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="h-screen flex flex-col">
      {!isOnline && (
        <div className="bg-red-100 text-red-800 p-2 text-center text-sm">
          📡 Sem conexão com a internet
        </div>
      )}
      {error && isOnline && (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-center text-sm">
          {ErrorMessages[error.type] || "❌ Erro desconhecido."}
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-black flex flex-col gap-2"
      >
        {messages.map((msg, i) => (
          <Message key={i} message={msg} />
        ))}

        {status === "connecting" && (
          <div className="text-xs text-gray-500 italic">
            🔄 Conectando ao servidor...
          </div>
        )}
        {status === "streaming" && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t dark:border-zinc-800 bg-white dark:bg-black flex gap-2"
      >
        <input
          ref={inputRef}
          placeholder="Digite uma mensagem..."
          disabled={!isOnline || status === "streaming"}
          className="flex-1 px-4 py-2 border rounded-full dark:border-zinc-700 dark:bg-zinc-900 dark:text-white outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isOnline || status === "streaming"}
          className="bg-blue-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
