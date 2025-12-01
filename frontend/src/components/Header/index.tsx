import { usePreferences } from "@/contexts/PreferencesContext";
import { Sun, Moon } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { ErrorMessages } from "@/services/api/client";

export function Header() {
  const { isLightTheme, toggleTheme } = usePreferences();
  const { clearChat, messages, error, isOnline } = useChat();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 px-4 border-b dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-black shadow z-50">
        <h1 className="font-semibold text-lg select-none">IA Chat</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => clearChat()}
            className="px-3 py-1 bg-red-500 text-white rounded-full text-xs hover:opacity-80"
            disabled={messages.length === 0}
          >
            Limpar
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className={`
              w-12 h-6 rounded-full p-1 flex items-center relative
              transition-colors duration-300
              ${isLightTheme ? "bg-gray-300" : "bg-blue-500"}
            `}
          >
            <span
              className={`
                w-5 h-5 bg-white rounded-full shadow-md transform
                flex items-center justify-center
                transition-transform duration-300
                ${isLightTheme ? "translate-x-0" : "translate-x-6"}
              `}
            >
              {isLightTheme ? (
                <Sun size={12} className="text-yellow-500" />
              ) : (
                <Moon size={12} className="text-blue-900" />
              )}
            </span>
          </button>
        </div>
      </header>
      <div className="h-14" />
      <div className="fixed top-14 left-0 right-0 z-40 flex flex-col items-center gap-1 px-4">
        {!isOnline && (
          <div className="bg-red-100 text-red-800 p-2 text-center text-sm rounded-md w-full max-w-lg">
            📡 Sem conexão com a internet
          </div>
        )}
        {error && isOnline && (
          <div className="bg-yellow-100 text-yellow-800 p-2 text-center text-sm rounded-md w-full max-w-lg">
            {ErrorMessages[error.type] || "❌ Erro desconhecido."}
          </div>
        )}
      </div>
    </>
  );
}
