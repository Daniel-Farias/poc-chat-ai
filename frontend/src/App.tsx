import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { routes } from "@/routes";

const router = createBrowserRouter(routes);

export default function App() {
  return (
    <PreferencesProvider>
      <ChatProvider>
        <RouterProvider router={router} />
      </ChatProvider>
    </PreferencesProvider>
  );
}
