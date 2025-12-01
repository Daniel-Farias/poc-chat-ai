import { Navigate } from "react-router-dom";
import { HomePage } from "@/pages/Home";

export const routes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
