import { createContext, useCallback, useState, useContext, useRef, useEffect } from "react";
import { ChatMessage, ChatStatus, ChatClient, ChatError } from "@/services/api/client";
import initialMessages from "@/components/Chat/data/initialMensages.json";

interface ChatContextData {
  messages: ChatMessage[];
  status: ChatStatus["status"];
  error: ChatError | null;
  addMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  sendMessage: (msg: string) => void;
  isOnline: boolean;
}

interface Props {
  children: React.ReactNode;
}

const ChatContextProvider = createContext<ChatContextData>(
  {} as ChatContextData
);

export function ChatProvider({ children }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages as unknown as ChatMessage[]);
  const [status, setStatus] = useState<ChatStatus["status"]>("idle");
  const [error, setError] = useState<ChatError | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const clientRef = useRef<ChatClient | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const clearChat = useCallback(() => {
    clientRef.current?.closeConnection();
    setMessages([]);
    setStatus("idle");
    setError(null);
  }, []);

  const sendMessage = useCallback(
    (msg: string) => {
      if (!isOnline) {
        setError({ type: "NO_NETWORK", message: "📡 Sem conexão com a internet." });
        return;
      }

      if (!clientRef.current) {
        clientRef.current = new ChatClient(
          addMessage,
          setStatus,
          (err) => setError(err)
        );
      }

      addMessage({ role: "user", content: msg });
      setError(null);

      try {
        clientRef.current.openStream(msg);
      } catch {
        setError({ type: "AI_ERROR", message: "❌ Erro ao iniciar conexão com o servidor." });
      }
    },
    [addMessage, isOnline]
  );

  return (
    <ChatContextProvider.Provider value={{ messages, status, error, addMessage, clearChat, sendMessage, isOnline }}>
      {children}
    </ChatContextProvider.Provider>
  );
}

export function useChat(): ChatContextData {
  const context = useContext(ChatContextProvider);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
