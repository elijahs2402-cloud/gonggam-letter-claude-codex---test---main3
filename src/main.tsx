import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { App } from "./App";
import "./styles/global.css";
import { installViewportHeightSync } from "./utils/viewport";
import { installTapToDismissKeyboard } from "./utils/dismissKeyboard";
import { installStatusBarColorSync } from "./utils/statusBarColor";
import { registerRouterNavigate } from "./utils/navigation";

installViewportHeightSync();
installTapToDismissKeyboard();
installStatusBarColorSync();

// 화면 분기는 App.tsx 가 주소를 보고 직접 한다. 라우터는 주소 기록과 이동만 맡으므로
// 모든 주소를 App 하나로 보낸다. 빌드 결과를 파일로 바로 열면(file:) 주소 뒤 # 로 옮긴다.
const createRouter =
  window.location.protocol === "file:" ? createHashRouter : createBrowserRouter;
const router = createRouter([{ path: "*", element: <App /> }]);
registerRouterNavigate((path, { replace }) => {
  void router.navigate(path, { replace });
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
