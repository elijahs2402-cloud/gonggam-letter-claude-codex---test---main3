import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/global.css";
import { installViewportHeightSync } from "./utils/viewport";
import { installTapToDismissKeyboard } from "./utils/dismissKeyboard";
import { installStatusBarColorSync } from "./utils/statusBarColor";
import { syncDerivedNotifications } from "./data/notificationEvents";
import { getMockAuthSnapshot } from "./data/mockAuth";

installViewportHeightSync();
installTapToDismissKeyboard();
installStatusBarColorSync();

// 알림 목록을 지금 상태에 맞춘다. 화면 이동이 페이지 새로고침이라 화면마다 다시 돈다.
// 로그인 전에는 볼 편지가 없으므로 건너뛴다.
if (getMockAuthSnapshot().account) syncDerivedNotifications();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
