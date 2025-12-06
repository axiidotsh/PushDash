import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { authClient } from '../../auth-client';

export const Route = createFileRoute('/cli/auth')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: (search.code as string) || '',
    };
  },
  component: CliAuthPage,
});

function CliAuthPage() {
  const { code } = Route.useSearch();
  const [status, setStatus] = useState<
    'loading' | 'authenticating' | 'success' | 'error'
  >('loading');
  const [error, setError] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await authClient.getSession();
        setIsLoggedIn(!!session.data?.user);
        if (session.data?.user) {
          setStatus('authenticating');
        }
      } catch {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  // Complete CLI auth when logged in
  useEffect(() => {
    if (isLoggedIn && code && status === 'authenticating') {
      completeAuth();
    }
  }, [isLoggedIn, code, status]);

  async function completeAuth() {
    if (!code) {
      setError('No authorization code provided');
      setStatus('error');
      return;
    }

    try {
      const response = await fetch('/api/auth/cli/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to authorize CLI');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch (err) {
      setError('Failed to connect to server');
      setStatus('error');
    }
  }

  // No code provided
  if (!code) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Invalid Request</h1>
          <p style={styles.text}>
            No authorization code provided. Please try logging in from the CLI
            again.
          </p>
        </div>
      </div>
    );
  }

  // Still checking auth status
  if (isLoggedIn === null || status === 'loading') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>PushDash CLI</h1>
          <p style={styles.text}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // User not logged in - show login prompt
  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Authorize CLI</h1>
          <p style={styles.text}>
            Please log in to authorize the PushDash CLI.
          </p>
          <p style={styles.codeText}>
            Code: <code style={styles.code}>{code}</code>
          </p>
          <div style={styles.buttons}>
            <a
              href={`/login?redirect=/cli/auth?code=${code}`}
              style={styles.button}
            >
              Log in with Email
            </a>
            <button
              onClick={() =>
                authClient.signIn.social({
                  provider: 'github',
                  callbackURL: `/cli/auth?code=${code}`,
                })
              }
              style={styles.buttonSecondary}
            >
              Log in with GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Processing
  if (status === 'authenticating') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Authorizing...</h1>
          <p style={styles.text}>Completing CLI authorization...</p>
        </div>
      </div>
    );
  }

  // Success
  if (status === 'success') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.titleSuccess}>✓ CLI Authorized</h1>
          <p style={styles.text}>
            You can close this window and return to your terminal.
          </p>
        </div>
      </div>
    );
  }

  // Error
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titleError}>Authorization Failed</h1>
        <p style={styles.text}>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.button}>
          Try Again
        </button>
      </div>
    </div>
  );
}

// Minimal inline styles (will be replaced with proper styling later)
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#171717',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid #262626',
  },
  title: {
    color: '#fafafa',
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  titleSuccess: {
    color: '#22c55e',
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  titleError: {
    color: '#ef4444',
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  text: {
    color: '#a1a1aa',
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
  },
  codeText: {
    color: '#a1a1aa',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  code: {
    backgroundColor: '#262626',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
    color: '#fafafa',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  button: {
    backgroundColor: '#fafafa',
    color: '#0a0a0a',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
    border: 'none',
  },
  buttonSecondary: {
    backgroundColor: '#262626',
    color: '#fafafa',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid #404040',
  },
};
