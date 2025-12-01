import { Chat } from "@/components/Chat";
import { Header } from "@/components/Header";

export function HomePage() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <Chat />
    </div>
  );
}
