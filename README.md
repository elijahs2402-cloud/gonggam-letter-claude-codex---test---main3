# 공감편지

## 추후 확정 필요한 항목

아직 정해지지 않았거나 개발팀과 합의가 필요한 것만 적는다.

| 항목 | 현재 상태 | 비고 |
|---|---|---|
| 실제 API 연동 | 없음. 모든 데이터는 브라우저 `localStorage` 의 목업 | "13. 개발자 인계 사항 > Mock Data" 참고 |
| 실제 인증 방식 | 목업 로그인(`src/data/mockAuth.ts`). 화면에는 토스·Google·Apple 버튼이 있음 | 실제 로그인 수단 확정 필요 |
| 푸시 알림 | 없음. 앱 안의 알림 목록만 있음 | |
| Capacitor `appId` | `com.example.placeholder` (자리표시자) | 스토어 등록 전 확정 |
| 앱 아이콘 · Splash Screen | 없음 | |
| Vite `base: './'` (규격 §23) | 지금은 `"/"` (Figma 배포용 `FIGMA_PUBLIC_URL` 이 있으면 그 주소) | CSS 34곳 · TS/TSX 27곳이 `/assets/...` 절대 경로를 쓴다. 바꾸면 경로 검토 필요 |
| 화면 이동 함수 (규격 §12 "URL 문자열을 직접 조작하지 않는다") | 라우트는 `react-router-dom` 7 의 `src/routes/AppRoutes.tsx` 에 있다. 다만 화면들은 `useNavigate` 대신 `src/utils/navigation.ts` 의 `navigateTo('/주소')` 를 부른다(안에서 라우터로 넘김). 나가는 모션 · 탭 전환 · 나의 공간 셸 처리를 한곳에 모으려고 둔 층이다 | 주소 문자열을 상수로 모을지는 개발팀과 결정 |
| CSS Modules (규격 §6) | 앱 정보 화면을 뺀 모든 화면에 적용(모듈 파일 22개). `src/styles/global.css`(약 4,500줄)에는 여러 화면이 함께 쓰는 규칙, `@media` · `!important` 규칙, 옮기면 우선순위가 바뀌어 화면이 달라지는 규칙이 남아 있다 | 앱 정보 화면은 전환 대상에서 뺐다(결정) |
| 직접 DOM 조작 (규격 §25) | 키보드·화면 높이·상태 표시줄 대응에서 `document`·`window` 를 직접 쓴다 | `src/utils/` 의 `viewport.ts` · `dismissKeyboard.ts` · `statusBarColor.ts` · `navigation.ts` 등 |
| lint 규칙 수준 | 오류 0 · 경고 0(2026-09-17). React Compiler 기준 규칙 등 일부는 `eslint.config.ts` 에서 경고로 낮춰 두었다 | 오류로 올릴지는 개발팀과 결정. 이유는 `eslint.config.ts` 주석 참고 |
| 이미지·폰트 라이선스 | "9. Asset 출처" 의 "확인 필요" 항목 | |
| `@capacitor/cli` 보안 경고 | `npm audit` 보통(moderate) 3건 — CLI 가 쓰는 `xcode` 패키지의 `uuid` | 개발 도구 쪽 의존성이며 앱 번들에는 들어가지 않음. npm 제안은 CLI 8.4.3 으로 내리기 |
| 가로 모드 | 대응하지 않음(결정) | |

## 1. 프로젝트 소개

익명으로 마음을 담은 편지를 보내고, 다른 사람의 편지를 맡아 답장을 전하는 모바일 우선 웹앱이다.
주요 흐름: 가입·로그인 → 홈 → 편지 쓰기 / 기다리는 편지 읽고 답장 쓰기 → 편지함 → 나의 공간(이름, 계정·알림·안전 관리, 안내).

이 저장소는 완성된 화면을 개발팀 규격(`PROJECT_SPEC.md`)에 맞게 옮기는 중이다.
**현재 화면이 디자인 기준**이며, 옮기는 동안 화면이 바뀌지 않게 하는 규칙은 `CLAUDE.md` 에 있다.

## 2. 기술 스택

| 구분 | 사용 | 설치 버전 |
|---|---|---|
| 빌드 도구 | Vite | 8.2.2 |
| UI | React · React DOM | 19.2.8 |
| 언어 | TypeScript | 5.9.3 |
| 스타일 | 전역 CSS + 일부 CSS Modules (CSS 도구·프레임워크 없음) | — |
| 앱 포장 | Capacitor | 8.5.2 |
| 검사 · 정리 | ESLint · Prettier | 10.10.0 · 3.9.6 |

설치 버전은 `package-lock.json` 기준이다. `package.json` 에는 `^` 범위로 적혀 있다.

## 3. 프로젝트 구조

```text
.
├── public/
│   └── assets/            # 이미지·아이콘·폰트 (코드에서 /assets/... 로 부름, 쓰는 파일만 남김)
│                          # 그림은 WebP(품질 90). 2026-09-18 PNG·JPG 24장을 바꿔 13MB → 2.1MB
├── src/
│   ├── main.tsx           # 진입점: 화면 높이·키보드·상태 표시줄 대응 설치 후 App 렌더
│   ├── App.tsx            # 모든 화면의 틀: 화면 key · 나의 공간 셸 · ?system= · 스크롤
│   ├── routes/
│   │   ├── AppRoutes.tsx  # 주소 → 화면 목록, 라우터 만들기 (규격 §12)
│   │   └── RouteElements.tsx # 로그인 확인 · 가입 단계 조건 · :id 연결 컴포넌트
│   ├── pages/             # 주소로 열리는 화면
│   │   ├── Intro/         # 인트로 (/, /intro)
│   │   ├── Auth/          # 인트로 뒤 온보딩 · 로그인 · 약관 · 이름 정하기
│   │   ├── Home/          # 홈 (HomeRuledScreen + CSS Modules)
│   │   ├── Letter/        # 편지 쓰기 · 읽기 · 답장 (LetterFlowScreens.tsx), 편지 만나기
│   │   ├── Mailbox/       # 편지함
│   │   ├── MySpace/       # 나의 공간 · 이름 바꾸기 · 안내 · 약관
│   │   ├── Account/       # 계정 설정 · 로그인 정보 · 탈퇴
│   │   ├── Notifications/ # 알림 · 알림 설정
│   │   └── Safety/        # 신고 · 차단 관리 · 안전 점검 · 편지 두고 가기
│   ├── components/
│   │   └── common/        # 하단 내비 · 공통 상태 화면(없는 페이지, 서비스 상태)
│   ├── hooks/             # 임시 저장 자동 저장 Hook (draftGuards.ts)
│   ├── constants/         # 문구 상수 (copy.ts)
│   ├── data/              # 목업 데이터·저장소 (localStorage) — API 로 교체할 곳
│   ├── utils/             # 화면 이동 · 화면 높이 · 키보드 · 상태 표시줄 · 날짜 · 개발용 도구(draftDevTools.ts)
│   ├── styles/
│   │   ├── global.css     # 전역 스타일 — main.tsx 가 불러옴 (맨 위에서 common.css 를 불러옴)
│   │   ├── common.css     # 외부 폰트 · 디자인 토큰(:root 변수) (globals.css 를 불러옴)
│   │   └── globals.css    # 기본 스타일 초기화(Preflight) · @layer 구조 — 옛 Tailwind 생성 결과
│   └── _archive/          # 보관용 옛 CSS (빌드에 쓰이지 않음)
├── capacitor.config.ts
├── eslint.config.ts
├── vite.config.ts
└── tsconfig.json
```

- 규격 §4 의 구조로 파일을 옮겼다. 코드와 파일명은 그대로다.
- **규격과 다른 점**
  - `utils/` 는 규격 목록에 없다. 화면이 아닌 공용 도우미 8개를 모으려고 추가했다.
  - 한 파일에 여러 화면이 들어 있는 경우가 있다(예: `pages/Letter/LetterFlowScreens.tsx` 에 20여 개). 규격의 `pages/[Page]/[Page].tsx` 형태로 나누는 일은 CSS Modules 전환 때 화면별로 한다.
  - `styles/` 는 `global.css` · `common.css` · `globals.css` 세 파일이다. 규격은 `globals.css` · `variables.css` · `fonts.css` 이다. `global.css`(단수, 약 4,500줄)는 화면별 규칙을 CSS Modules 로 옮기고 남은 전역 규칙이다. `globals.css` 로 합치거나 토큰·폰트를 `variables.css` · `fonts.css` 로 나누는 일은 불러오는 순서가 바뀌어 화면이 달라질 위험이 있어 **보류했다**(2026-09-17 결정).
  - 불러오는 순서: `main.tsx` → `global.css` → `common.css` → (외부 폰트 3개) → `globals.css`. `globals.css` 의 규칙은 `@layer` 안에 있어 레이어 밖의 앱 CSS 보다 우선순위가 낮다. 파일을 옮기거나 합칠 때 이 구조를 유지해야 화면이 바뀌지 않는다.
  - 데이터 타입(`types/`)은 아직 각 `data/` 모듈 안에 함께 있다.

## 4. 설치 방법

Node.js 22 이상이 필요하다(`@capacitor/cli` 요구 사항). 개발 중 확인한 버전은 Node 24.18.0 · npm 11.16.0 이다.

```bash
npm install
```

## 5. 로컬 개발 방법

```bash
npm run dev
```

- 기본 주소: `http://localhost:8443` (`vite.config.ts`, 포트는 고정 — 이미 쓰이면 시작하지 않음)
- 다른 포트: `PORT` 환경변수 (예: PowerShell `$env:PORT = "6334"; npm run dev`)
- 로그인이 필요한 화면은 목업 로그인 상태가 있어야 열린다. 인트로(`/`)에서 목업 로그인을 거치거나, "13. 개발자 인계 사항 > Mock Data" 의 저장 키를 참고한다.

기타 명령:

```bash
npm run lint          # ESLint (오류 0 · 경고 0 이 현재 기준)
npx tsc --noEmit      # TypeScript 검사 (오류 0 이 현재 기준)
npm run format        # Prettier 로 정리
npm run format:check  # 정리 필요 여부만 검사
```

## 6. 빌드 방법

```bash
npm run build     # tsc -b(타입 검사) 후 vite build. 결과물: dist/ — 타입 오류가 있으면 빌드가 멈춘다
npm run preview   # 빌드 결과 미리보기 (포트 8443)
```

`vite build` 중 청크 크기 경고는 현재 나오지 않는다(JS 약 470KB · CSS 약 171KB — React Router 가 약 95KB). 500KB 에 가까워지면 경고가 다시 나온다.

## 7. 환경변수

앱 코드(`src/`)가 읽는 환경변수는 없다. 그래서 `.env.example` 은 두지 않았다.
설정 파일(`vite.config.ts`)만 아래 두 값을 읽는다.

| 이름 | 쓰는 곳 | 의미 | 기본값 |
|---|---|---|---|
| `PORT` | 개발 서버 · 미리보기 | 포트 번호 | `8443` |
| `FIGMA_PUBLIC_URL` | 빌드 `base` | Figma 배포 미리보기용 공개 주소 | 없으면 `"/"` |

`.env`, `.env.local` 은 `.gitignore` 에 들어 있다.

## 8. 주요 라이브러리

| 패키지 | 용도 |
|---|---|
| `react`, `react-dom` | UI |
| `@capacitor/core` | Capacitor 런타임 (아직 앱 코드에서 불러오지 않음) |
| `@capacitor/cli` | `npx cap` 명령 (개발용) |
| `vite`, `@vitejs/plugin-react` | 개발 서버 · 빌드 |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `eslint-config-prettier`, `jiti` | lint (`jiti` 는 `eslint.config.ts` 를 읽기 위해 필요) |
| `prettier` | 코드 정리 |

상태관리 라이브러리(Redux, Zustand)는 쓰지 않는다.

## 9. Asset 출처

| 대상 | 위치 | 출처 | 라이선스 |
|---|---|---|---|
| Noto Serif KR | 외부 — `fonts.googleapis.com` | Google Fonts | SIL OFL 1.1 (확인 필요) |
| Gelasio | 외부 — `fonts.googleapis.com` | Google Fonts | SIL OFL 1.1 (확인 필요) |
| Pretendard Variable 1.3.9 | 외부 — `cdn.jsdelivr.net/gh/orioncactus/pretendard` | orioncactus/pretendard | SIL OFL 1.1 (확인 필요) |
| SUITE Bold | 내부 — `public/assets/fonts/SUITE-Bold.woff2` | 확인 필요 | 확인 필요 |
| 일러스트·배경·아이콘 이미지 | 내부 — `public/assets/` (WebP·SVG) | **확인 필요** (제작 방식·저작권 기록 없음) | 확인 필요 |

- 외부 폰트는 `src/styles/common.css` 맨 위의 `@import` 로 불러온다. 앱(WebView)이 오프라인이면 기본 폰트로 떨어지므로, 출시 전에 폰트를 프로젝트 안에 포함할지 결정이 필요하다.
- 그림은 **WebP(품질 90)** 이다(2026-09-18). PNG·JPG 24장을 바꿔 `public/` 13MB → 2.1MB, 빌드 결과 15MB → 2.7MB 가 됐다. 화면의 픽셀은 조금 달라졌고(가장 큰 색 차이 65, 대부분 눈에 띄지 않음) 기준 스크린샷도 새로 찍었다. 계정 관리의 토스·구글 아이콘은 32px 로 보이는데 2000px 짜리 그림을 품은 SVG(1.2MB · 110KB)였다 — 128px WebP(각 3KB)로 바꿨다. **WebP 를 못 읽는 WebView 는 그림이 빈칸으로 나온다**(iOS 14 · Android 5 이상은 지원). 아주 오래된 기기를 지원해야 하면 되돌려야 한다.

## 10. Capacitor 설정

`capacitor.config.ts`:

```ts
appId: "com.example.placeholder"   // 자리표시자 — 확정 필요
appName: "공감편지"
webDir: "dist"
```

- 네이티브 프로젝트(`android/`, `ios/`)는 아직 만들지 않았다.
- 웹 결과물을 네이티브 프로젝트로 복사: `npm run cap:sync` (= `npm run build && npx cap sync`)

## 11. Android 빌드 방법

처음 한 번:

```bash
npm install @capacitor/android
npm run build
npx cap add android
```

이후:

```bash
npm run cap:sync
npx cap open android
```

Android Studio 에서 빌드·실행한다. 필요한 Android Studio · JDK 버전은 Capacitor 8 문서에서 확인한다(확인 필요).

## 12. iOS 빌드 방법

macOS 와 Xcode 가 필요하다. 처음 한 번:

```bash
npm install @capacitor/ios
npm run build
npx cap add ios
```

이후:

```bash
npm run cap:sync
npx cap open ios
```

필요한 Xcode 버전 · CocoaPods 사용 여부는 Capacitor 8 문서에서 확인한다(확인 필요).

## 13. 개발자 인계 사항

### Routing
- 라우터는 `react-router-dom` 7(`createBrowserRouter`, 파일로 열면 `createHashRouter`). 주소와 화면의 목록은 `src/routes/AppRoutes.tsx` 에 있다.
- 목록은 세 묶음이다: 로그인 없이 여는 화면 · 가입 단계 화면(`LoginRoute` · `OnboardingStepRoute` 등 자체 조건) · 로그인이 필요한 화면(`RequireAuth` 아래). 로그인이 필요한데 목업 로그인이 없으면 지금 주소를 기억해 두고(`setPostLoginPath`) 가입 단계나 로그인으로 보낸다. 목록에 없는 주소는 `NotFoundScreen`.
- 모든 라우트는 `App`(틀) 아래에 있고, `App` 이 `<Outlet>` 으로 화면을 그린다.
- 화면 이동(`navigateTo`, `navigateBack`, `replaceRoute` — `src/utils/navigation.ts`)은 React Router 로 **문서를 새로 불러오지 않고** 일어난다. 나가는 모션(140ms) 뒤 라우터로 옮긴다.
- 하단 메뉴의 세 탭(홈 · 편지함 · 나의 공간)끼리는 나가는 모션과 화면 전체 들어오는 모션 없이 바로 바뀐다(`html[data-tab-switch]`, `markTabSwitch`). 하단 메뉴가 각 화면 안에 있어 모션을 타면 메뉴가 함께 흔들리기 때문이다. 화면 안쪽 모션(홈 카드 등)은 그대로 돈다.
- `App.tsx` 는 주소 기록마다 화면에 새 `key` 를 주어 처음부터 다시 그린다(화면 상태 초기화 · 들어오는 모션 재생 · 맨 위에서 시작). 나의 공간(`MySpaceScreen`)이 맡은 주소는 같은 `key` 를 써서 셸 안 전환을 유지한다(`registerShellRouter`, `isShellPath`).
- 주소 기록이 바뀔 때마다 `App.tsx` 가 알림 목록을 다시 맞춘다(예전에는 `main.tsx` 가 페이지마다 했다).
- 화면을 떠난 뒤 실행되면 안 되는 타이머(계정 삭제 · 신고 접수 · 편지 만나기 · 두고 가기 · 임시 저장 후 나가기)는 `setPageTimeout` 을 쓴다. 그사이 화면이 바뀌면 실행하지 않는다.
- 답장 자동 저장(`src/hooks/draftGuards.ts`)은 앱 안에서 화면을 떠날 때도 저장되지 않은 입력을 저장한다. 문서를 닫지 않으므로 `beforeunload` 만으로는 부족하다. 일부러 떠나는 경로(다음 단계 저장 · 지우고 나가기)는 `cancel()` 로 이 저장을 끈다.
- '뒤로 갈 곳이 있는지'는 라우터가 기록에 남기는 순번(`history.state.idx`)으로 판단한다. 주소만 바꾸는 `replaceAppState` 등도 이 값을 지우지 않게 되어 있다.

### State Management
- 화면 안 상태: `useState`.
- 전역 상태 라이브러리·Context 는 쓰지 않는다. 화면 사이에 공유되는 데이터는 모두 `localStorage` 를 모듈 함수로 읽고 쓴다(예: `getLetters()`, `saveLetter()`).

### Mock Data
실제 서버 대신 브라우저 `localStorage` 에 저장한다. 서버 API 로 바꿀 때 교체할 모듈(모두 `src/data/`):

| 모듈 | 내용 | 주요 저장 키 |
|---|---|---|
| `mockAuth.ts` | 목업 로그인·온보딩·익명 이름 | `gonggam_mock_auth_v1`, `gonggam_onboarding_v1` |
| `letters.ts` | 편지·답장·상태 변화 | `gonggam_letters_v1`, `gonggam_current_user_v1` |
| `sampleLetters.ts` | 기다리는 편지 표본 2통을 심음 | (`gonggam_letters_v1`) |
| `letterDraft.ts` | 편지·답장 임시 저장 | `gonggam_letter_drafts_v1`, `gonggam_reply_drafts_v1` |
| `notifications.ts`, `notificationEvents.ts` | 앱 안 알림·알림 설정 | `gonggam_mock_notifications_v1`, `gonggam_mock_notification_settings_v1` |
| `reports.ts`, `blocks.ts`, `contentVisibility.ts` | 신고·차단·숨김 | `gonggam_reports_v1`, `gonggam_blocks_v1`, `gonggam_hidden_content_v1` |
| `letterReturns.ts` | 맡은 편지 두고 가기 | `gonggam_mock_letter_returns_v1` |
| `safety.ts` | 편지 내용 안전 점검(단어 규칙) | `gonggam_safety_reviews_v1` |

- 전체 저장 키는 `src/` 에서 `"gonggam` 으로 검색하면 나온다.
- 확인용 주소 옵션: `?system=offline|maintenance|update_required|restricted|error` — 서비스 상태 화면. (`?preview=…` 와 `-demo` 주소, 테스트용 편지 주소는 2026-09-16~17 에 지웠다.)

### 알려진 제약
- 가로 모드 미대응, 시스템 푸시 없음(앱 안 목록만).
- 알림 설정에 "편지 맡음" 알림을 끄는 스위치가 없다(코드는 `letterUpdates` 로 제어).
- 서비스 안내 세부 화면(`/service-notices/:id`, `ServiceNoticeScreen`)은 디자인만 만들어 두었다(1차 오픈 제외). 앱 어디에서도 연결하지 않고, 서비스 안내 알림(`service_notice`)도 알림 목록에서 걸러진다. 예시 글은 `src/data/serviceNotices.ts` 에 있다.
- 홈 하단 소식 카드는 1차 오픈에서 빠졌다. 화면 코드는 `HomeRuledScreen.tsx` 에 남아 있고, `getHomeNotice()` 가 항상 `null` 을 돌려주게 막아 두었다. 실제 데이터는 연결되지 않았다.
- 1차 오픈에서 뺀 기능은 코드에서 지웠다(2026-09-15): 답장 문장 간직하기 · 고마움 전하기 · 받은 답장 목록 · 편지의 여정 · 답장 도착 봉투 화면 · 편지 거두기/기다림 연장/다시 보내기, 옛 읽기 단계(`/waiting-letters`, `/reader-promise`, `/assign-letter/`, `/assigned-letter/`), `?qa=1` 테스트 패널과 `?state=` 옵션.
- CSS Modules 로 옮긴 화면은 JSX 에 기존 전역 class 이름과 모듈 class 를 함께 쓴다. 모듈 CSS 는 `global.css` 보다 **먼저** 불러와지므로(`main.tsx` 의 import 순서), 전역의 같은 우선순위 규칙과 겹치는 규칙은 `global.css` 에 남겨 두었다.
- CSS Modules 는 `@keyframes` 이름도 바꾸므로, 모듈 안에서 쓰는 애니메이션은 같은 모듈 파일에 `@keyframes` 를 함께 둔다.
- 뒤로 · 앞으로 가기로 돌아온 화면은 떠날 때의 스크롤 위치로 되돌린다(`src/utils/scrollMemory.ts`). 화면 안쪽 스크롤 영역 기준이며 메모리에만 두므로 새로고침하면 처음부터다. 나의 공간 셸 안 이동은 대상이 아니다.
- 첫 페인트 배경을 종이색으로 칠해 두었다(`index.html`, `common.css`). 새로고침·첫 진입 때 흰 화면이 보이지 않게 하기 위해서다.

### 검증 방법
- 화면이 바뀌지 않았는지는 기준 스크린샷(375×667 · 390×844 · 430×932)과 파일 해시로 비교해 확인해 왔다. 촬영 도구와 기준 이미지는 저장소 밖에 있다(인계 시 별도 전달 여부 결정 필요).
