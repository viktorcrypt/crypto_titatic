import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import BoardingScreen from "./pages/BoardingScreen.jsx";
import IntroScene from "./pages/IntroScene.jsx";   // пока заглушка
import AppPage from "./pages/App.jsx";
import StatsPage from "./pages/Stats.jsx";

import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <BoardingScreen /> }, // подключение кошелька
  { path: "/intro", element: <IntroScene /> }, // титры (позже добавим анимации)
  { path: "/app", element: <AppPage /> },   
  { path: "/stats", element: <StatsPage /> }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
