import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/todos')({ component: TodosPage });

function TodosPage() {
  const [todos, setTodos] = useState<
    Array<{ id: number; title: string; completed: boolean }>
  >([]);
  const [title, setTitle] = useState('');

  const fetchTodos = async () => {
    const res = await fetch('/api/todos', { credentials: 'include' });
    if (res.status === 401) {
      window.location.href = '/';
      return;
    }
    const data = (await res.json()) as typeof todos;
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const signOut = async () => {
    // await fetch('/api/auth/sign-out', { method: 'POST' })
    // window.location.href = '/'
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: t }),
    });
    setTitle('');
    fetchTodos();
  };

  const toggleTodo = async (id: number) => {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    fetchTodos();
  };

  const deleteTodo = async (id: number) => {
    await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    fetchTodos();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Todos</h1>
          <button
            onClick={signOut}
            className="rounded bg-slate-700 px-3 py-2 hover:bg-slate-600"
          >
            Sign out
          </button>
        </div>
        <form onSubmit={addTodo} className="mb-6 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a todo..."
            className="flex-1 rounded border border-slate-700 bg-slate-800 px-4 py-2"
          />
          <button
            type="submit"
            className="rounded bg-cyan-600 px-4 py-2 hover:bg-cyan-500"
          >
            Add
          </button>
        </form>
        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded border border-slate-700 bg-slate-800 p-3"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleTodo(t.id)}
                />
                <span className={t.completed ? 'line-through opacity-60' : ''}>
                  {t.title}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(t.id)}
                className="text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </li>
          ))}
          {todos.length === 0 && (
            <li className="opacity-70">No todos yet. Add one above.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
