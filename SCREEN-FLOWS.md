# 실행 화면 흐름 인벤토리

모든 경로는 로컬 개발 서버(`http://127.0.0.1:8443`)에서 확인할 수 있다. `:letterId`는 예시 편지 ID를 넣는 동적 경로이며, 로그인 보호 화면은 목업 로그인 상태에서 연다.

"(앱 내 연결 없음)"은 주소로 직접 열 수는 있지만 앱 안의 버튼·링크로는 가지 않는 화면이다.

## 1. 첫 진입 · 가입 (Auth Flow)

![첫 진입 썸네일](public/assets/intro-door-uploaded.png)

- 신규 회원: `/` 또는 `/intro` → `/onboarding`(공감편지 소개) → "시작하기" → `/login?new=1`(신규회원용) → `/terms-consent` → `/nickname-entry` → `/returning-welcome`(환영) → `/home`
- 기존 회원: `/` 또는 `/intro` → `/onboarding`(공감편지 소개) → "이미 이용하고 있어요" → `/login`(기존회원용) → `/returning-welcome`(환영) → `/home`
- 로그아웃: 계정 관리 → 로그아웃 → `/intro`

## 2. 홈 (Home)

![홈 썸네일](public/assets/home-card-write.png)

`/home` (줄노트 감성 테마 `HomeRuledScreen`)

- 두 가지 핵심 행동 분기:
  - **편지 쓰기**: `/write-letter`
  - **편지 읽기**: 상황에 따라 세 갈래
    - 이미 맡은 편지가 있으면: `/read-letter/:letterId`
    - 기다리는 편지가 있으면: `/listen-entry-a`
    - 기다리는 편지가 없으면: `/listen-entry-empty`
- 알림 버튼(오른쪽 위): `/notifications`

## 3. 편지 작성 · 발송 (Write Flow)

![편지 작성 썸네일](public/assets/write-letter-object.png)

`/write-letter` → `/letter-preview` → `/letter-sent?id=:letterId` → `/mailbox` → `/mailbox/my/:letterId`

- 안전 점검에 걸렸을 때만: `/letter-preview` → `/letter-safety-review` (고치기 전까지 보낼 수 없음)

## 4. 편지 읽기 · 답장 작성 (Listen & Reply Flow)

![편지 읽기 썸네일](public/assets/read-letter-object.png)

`/listen-entry-a` → `/read-letter/:letterId` → `/write-reply/:letterId` → `/reply-review/:letterId` → `/reply-sending/:letterId` → `/reply-sent/:letterId`

- 대기 편지 없음: `/listen-entry-empty`
- 부담 덜기 (편지 두고 가기): `/read-letter/:letterId` → `/return-letter/:letterId`
- 답장이 안전 점검에 걸렸을 때: `/reply-sending/:letterId` → `/write-reply/:letterId`로 돌아감
- 데모: `/write-reply` (표본 편지로 여는 답장 쓰기)

## 5. 편지함 (Mailbox Flow)

![편지함 썸네일](public/assets/reply-sent-envelope.png)

`/mailbox` → `/mailbox/my/:letterId` 또는 `/mailbox/replied/:letterId`

- 편지함 상태 및 데모:
  - 빈 편지함: `/mailbox-empty`
  - 답장 도착 미리보기: `/mailbox-reply-arrived-demo`
  - 내가 쓴 편지(답장 도착 상태): `/mailbox-my-replied-demo`
  - 내가 쓴 편지(답장 대기 상태): `/mailbox-my-waiting-demo`
  - 내가 답장한 편지 보관 상태: `/mailbox-replied-demo`

## 6. 나의 공간 (My Space) — 총 7개 메뉴 및 계정 상세

![나의 공간 썸네일](public/assets/home-cards-room.jpg)

`/my-space` (메인 허브: 목록에서 7개 메뉴를 인앱 전환으로 렌더링)

### 1) 나의 이름
- 경로: `/anonymous-name-settings`
- 역할: 현재 익명 이름 확인, 직접 입력하거나 "이름 추천 받기"로 새 이름 정하기

### 2) 계정 관리
- 경로: `/account-settings`
- 화면 항목: 이메일 · 연결된 계정 · 로그아웃(확인 창 → `/intro`) · 계정 삭제
- 계정 삭제(회원 탈퇴): `/account-withdrawal`(이유 선택 → 삭제 확인 → 처리 중) → `/withdrawal-complete`

### 3) 알림 설정
- 경로: `/notification-settings`
- 역할: "답장 도착", "맡은 편지 답장 안내" 알림 켜고 끄기 ("서비스 중요 안내"는 항상 켜짐)
- 참고: 알림 목록은 `/notifications` (홈의 알림 버튼에서 열림) · 알림 유형 확인용 데모: `/notifications-all-demo`

### 4) 차단 및 신고 관리
- 경로: `/safety-management`
- 역할: 차단한 사용자 목록 조회와 차단 해제, 신고 내역 조회

### 5) 이용 안내
- 경로: `/service-guide`
- 관련 안내 화면 (앱 내 연결 없음):
  - 앱 정보: `/app-info`

### 6) 개인정보 처리방침
- 경로: `/privacy-policy`
- 역할: 개인정보 수집 및 처리 방침 전문 열람

### 7) 서비스 이용약관
- 경로: `/terms-of-service`
- 역할: 공식 서비스 이용약관 전문 열람

## 7. 신고 · 안전 흐름 (Safety Flow)

![안전 흐름 썸네일](public/assets/reply-sent-pen-star.png)

- **편지 신고**: `/report-letter/:letterId` (데모: `/report-letter-demo`, `/report-letter-complete-demo`)
- **답장 신고**: `/report-reply/:letterId` (접수하면 같은 화면에서 완료 안내로 바뀜 · 완료 상태 주소 `/report-reply/:letterId/complete`는 앱 내 연결 없음 · 데모: `/report-reply-demo`, `/report-reply-complete-demo`)
- **편지 두고 가기**: `/return-letter/:letterId`
- **차단 및 신고 관리**: `/safety-management`
- **보내기 전 안전 점검**: 편지는 `/letter-safety-review`, 답장은 답장 쓰기로 돌아감 (단어 규칙에 걸리면 고치기 전까지 보낼 수 없음)
