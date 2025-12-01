import { motion } from "framer-motion";
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
  if (message.role === "system") {
    return (
      <div className="flex justify-center my-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="
            bg-gray-300 dark:bg-zinc-700
            text-xs text-gray-700 dark:text-gray-200
            px-3 py-1 rounded-full shadow-sm
            max-w-[75%] text-center
          "
        >
          {message.content}
        </motion.div>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <motion.div
        initial={{ opacity: 0, x: isUser ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          max-w-[75%]
          px-4 py-2
          rounded-2xl
          shadow
          text-sm leading-relaxed
          ${
            isUser
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 dark:bg-zinc-800 dark:text-gray-100 rounded-bl-none"
          }
        `}
      >
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {message.content}
        </ReactMarkdown>
      </motion.div>
    </div>
  );
}
