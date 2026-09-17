import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { createAppRouter } from "./routes/AppRoutes";
import "./styles/global.css";
import { installViewportHeightSync } from "./utils/viewport";
import { installTapToDismissKeyboard } from "./utils/dismissKeyboard";
import { installStatusBarColorSync } from "./utils/statusBarColor";
import { registerRouterNavigate } from "./utils/navigation";

installViewportHeightSync();
installTapToDismissKeyboard();
installStatusBarColorSync();

// 주소와 화면의 목록은 src/routes/AppRoutes.tsx 에 있다.
// 화면 이동 함수(utils/navigation.ts)가 이 라우터로 옮기도록 등록한다.
const router = createAppRouter();
registerRouterNavigate((path, { replace }) => {
  void router.navigate(path, { replace });
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
