/**
 * Auth types for PushDash
 * These types match the better-auth response structure
 */

/**
 * User type from better-auth session
 */
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session metadata from better-auth
 */
export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

/**
 * Combined session state with user
 */
export interface AuthSession {
  session: Session;
  user: User;
}

/**
 * Auth state for session query results
 */
export interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Sign-in credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Sign-up credentials
 */
export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
}
