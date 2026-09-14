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
  globalIgnores(["dist", "public", "artifacts", "src/_archive"]),
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
  },
  // 코드 모양(줄바꿈·따옴표 등)은 Prettier 가 맡으므로, 겹치는 ESLint 규칙을 끈다. 반드시 마지막에 둔다.
  prettierConfig,
]);
