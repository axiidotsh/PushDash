import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
export const Route = createFileRoute('/')({ component: AuthPage });

function AuthPage() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-md p-6 pt-14">
        <h1 className="mb-6 text-2xl font-bold">Welcome</h1>
        <div className="mb-4 flex items-center rounded border border-slate-700 bg-slate-800 p-1">
          <button
            onClick={() => setMode('sign-in')}
            className={`flex-1 rounded px-3 py-2 ${mode === 'sign-in' ? 'bg-slate-700' : 'hover:bg-slate-700/60'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('sign-up')}
            className={`flex-1 rounded px-3 py-2 ${mode === 'sign-up' ? 'bg-slate-700' : 'hover:bg-slate-700/60'}`}
          >
            Sign Up
          </button>
        </div>
        <div className="mt-4">
          <AuthForm mode={mode} />
        </div>
      </div>
    </div>
  );
}

function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const action =
    mode === 'sign-in' ? '/api/auth/sign-in/email' : '/api/auth/sign-up/email';
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const email = String(formData.get('email') || '');
        const password = String(formData.get('password') || '');
        const name =
          mode === 'sign-up'
            ? String(formData.get('name') || email.split('@')[0] || 'User')
            : undefined;
        const res = await fetch(action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(
            mode === 'sign-in' ? { email, password } : { name, email, password }
          ),
        });
        if (!res.ok) {
          alert(`${mode} failed`);
          return;
        }
        window.location.href = '/todos';
      }}
      className="space-y-3"
    >
      <h3 className="text-lg font-semibold text-white capitalize">{mode}</h3>
      <input
        style={{ display: mode === 'sign-up' ? 'block' : 'none' }}
        name="name"
        type="text"
        placeholder="name"
        className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
      />
      <input
        name="email"
        type="email"
        placeholder="email"
        className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
      />
      <input
        name="password"
        type="password"
        placeholder="password"
        className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
      />
      <button
        type="submit"
        className="w-full rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
      >
        {mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  );
}
