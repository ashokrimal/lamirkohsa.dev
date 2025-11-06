'use client';

import { useMemo, useState } from 'react';
import { Buffer } from 'buffer';

const ADMIN_EMAIL = 'admin@lamirkohsa.dev';
const ADMIN_PASSWORD = 'ashokrimal#9847177515';

type BasicAuthGateProps = {
  render: (authHeader: string) => React.ReactNode;
};

export default function BasicAuthGate({ render }: BasicAuthGateProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Invalid credentials.');
    }
  };

  if (isAuthenticated) {
    const authHeader = useMemo(() => {
      if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
        return `Basic ${window.btoa(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`)}`;
      }
      return `Basic ${Buffer.from(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`).toString('base64')}`;
    }, []);
    return <>{render(authHeader)}</>;
  }

  return (
    <div className="max-w-md mx-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900 text-center">Admin Login</h1>
      <p className="mt-2 text-sm text-gray-600 text-center">Enter credentials to view submitted messages.</p>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
            placeholder="admin@lamirkohsa.dev"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
            placeholder="Your password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
