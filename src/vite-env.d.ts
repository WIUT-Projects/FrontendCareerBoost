/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_AUTH_ME: string;
  readonly VITE_API_AUTH_ADMIN_LOGIN: string;
  readonly VITE_API_AUTH_REFRESH: string;
  readonly VITE_API_AUTH_GOOGLE: string;
  readonly VITE_ROUTE_ADMIN: string;
  readonly VITE_ROUTE_HR_PORTAL: string;
  readonly VITE_ROUTE_DASHBOARD: string;
  readonly VITE_SESSION_KEY: string;
  readonly VITE_ADMIN_EMAIL_HINT: string;
  readonly VITE_API_SUBSCRIPTION_PLANS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
