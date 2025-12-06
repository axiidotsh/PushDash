import { createAuthClient } from 'better-auth/client';
import type { auth } from './src/auth.ts';
import { inferAdditionalFields } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  // In browser, use relative URL (same origin). In SSR, needs explicit URL.
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.APP_URL ?? 'http://localhost:3000'),
  plugins: [inferAdditionalFields<typeof auth>()],
});
