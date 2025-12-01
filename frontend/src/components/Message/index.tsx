import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

type Role = "user" | "assistant" | "system";

interface MessageProps {
  message: {
    role: Role;
    content: string;
  };
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";
  const [displayed, setDisplayed] = useState(message.content);

  useEffect(() => {
    if (message.role !== "assistant") {
      setDisplayed(message.content);
      return;
    }

    let i = displayed.length;
    let raf: number;

    function type() {
      if (i < message.content.length) {
        setDisplayed(message.content.slice(0, i + 1));
        i++;
        raf = requestAnimationFrame(type);
      }
    }

    raf = requestAnimationFrame(type);

    return () => cancelAnimationFrame(raf);
  }, [message.content, message.role]);

  if (message.role === "system") {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-gray-300 dark:bg-zinc-700 text-xs text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full shadow-sm max-w-[75%] text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`
          max-w-[75%] px-4 py-2 rounded-2xl shadow text-sm leading-relaxed
          ${isUser
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 dark:bg-zinc-800 dark:text-gray-100 rounded-bl-none"
          }
        `}
      >
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {displayed}
        </ReactMarkdown>
      </div>
    </div>
  );
}
