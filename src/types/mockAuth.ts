// mockAuth.ts 의 데이터 모양(타입). 2026-09-19 src/data/mockAuth.ts 에서 옮겼다(내용 그대로).

/**
 * Prototype-only authentication state. Replace this module with the real
 * authentication/session client when the production service is connected.
 * No credentials, provider tokens, email addresses, or real names are stored.
 */
export type MockAuthState =
  | "logged_out"
  | "logging_in"
  | "new_user"
  | "existing_user"
  | "login_failed"
  | "logged_in"
  | "withdrawn";

export type MockAuthProvider = "apple" | "google" | "kakao";

export type MockUserAccount = {
  id: string;
  authProvider: MockAuthProvider;
  anonymousName?: string;
  onboardingCompleted: boolean;
  termsAccepted: boolean;
  ageConfirmed: boolean;
};

export type MockAuthSnapshot = {
  state: MockAuthState;
  account?: MockUserAccount;
  pendingProvider?: MockAuthProvider;
  loginMode?: "new" | "existing" | "failure";
};
