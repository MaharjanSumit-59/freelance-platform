import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register(name, email, password, role);
    if (!result.success) {
      setError(result.error ?? 'Something went wrong.');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-ink text-center">Join FreelanceHub</h1>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <p className="text-sm font-medium text-ink mb-2">I'm here to...</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`border rounded-lg px-3 py-3 text-sm text-left transition-colors ${
                    role === 'client' ? 'border-primary bg-primary-light' : 'border-border'
                  }`}
                >
                  <span className="font-semibold text-ink">Hire</span>
                  <p className="text-xs text-muted mt-0.5">Post jobs, hire freelancers</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`border rounded-lg px-3 py-3 text-sm text-left transition-colors ${
                    role === 'freelancer' ? 'border-primary bg-primary-light' : 'border-border'
                  }`}
                >
                  <span className="font-semibold text-ink">Work</span>
                  <p className="text-xs text-muted mt-0.5">Find jobs, submit proposals</p>
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-ink block mb-1">Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">Password</label>
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {error && <p className="text-sm text-warn">{error}</p>}

            <button
              type="submit"
              className="w-full bg-primary text-white py-2.5 rounded-full font-semibold text-sm hover:bg-primary-dark transition-colors"
            >
              Create account
            </button>
          </form>

          <p className="text-sm text-muted mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
