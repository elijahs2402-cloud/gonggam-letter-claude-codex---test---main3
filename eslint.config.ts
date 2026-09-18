// ESLint 설정 (flat config)
// TypeScript 설정 파일은 ESLint 가 jiti 로 읽는다 — jiti 는 devDependencies 에 있다.
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier/flat";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  // 검사하지 않는 곳: 빌드 결과물, 정적 파일, 보관용 옛 코드
  globalIgnores(["dist", "public", "artifacts"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 일부러 버리는 값은 허용한다: `_` 로 시작하는 인자, 나머지(...rest)를 얻으려고 꺼낸 형제 속성
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],

      // 아래는 오류가 아니라 경고로 둔다 (2026-09-14 결정, 개발팀 합의 대상).
      // React Compiler 기준 규칙이다. 이 앱은 React Compiler 를 쓰지 않아 지금은 권장 사항이고,
      // 고치면 동작이 바뀔 수 있어 화면별로 따로 검토한다.
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      // 개발 중 새로고침(Fast Refresh)에만 영향. 고치려면 파일을 나눠야 해서 폴더 구조 이동 때 함께 한다.
      "react-refresh/only-export-components": "warn",
    },
  },
  // 코드 모양(줄바꿈·따옴표 등)은 Prettier 가 맡으므로, 겹치는 ESLint 규칙을 끈다. 반드시 마지막에 둔다.
  prettierConfig,
]);
