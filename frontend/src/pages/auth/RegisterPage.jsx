import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@shared/api/client';
import Logo from '@shared/ui/Logo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'employee', employeeId: '', designation: '',
  });
  const [step, setStep] = useState(1); // Multi-step form

  const registerMutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess: () => {
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    },
    onError: (err) => {
      const details = err.response?.data?.errors?.[0]?.message;
      toast.error(details || err.response?.data?.message || 'Registration failed');
    },
  });

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email are required');
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    const { confirmPassword, ...submitData } = form;
    registerMutation.mutate(submitData);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface-base)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div className="register-logo-container" style={{ marginBottom: 32 }}>
          <Logo size={32} withText={true} variant="dark" />
        </div>

        <div className="card">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-stone-900)', marginBottom: 4 }}>
              Create your account
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-stone-500)' }}>
              Step {step} of 2 — {step === 1 ? 'Basic info' : 'Set your password'}
            </p>

            {/* Progress bar */}
            <div className="progress-bar" style={{ marginTop: 12 }}>
              <div className="progress-bar-fill" style={{ width: step === 1 ? '50%' : '100%' }} />
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1}>
              <div className="form-group">
                <label className="form-label required">Full Name</label>
                <input
                  type="text" className="form-input"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Work Email</label>
                <input
                  type="email" className="form-input"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="grid-2col">
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text" className="form-input"
                    placeholder="EMP001"
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <select
                    className="form-input"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  >
                    <option value="">Select job title...</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Sustainability Consultant">Sustainability Consultant</option>
                    <option value="CSR Manager">CSR Manager</option>
                    <option value="Governance Compliance Lead">Governance Compliance Lead</option>
                    <option value="Operations Coordinator">Operations Coordinator</option>
                    <option value="Financial Analyst">Financial Analyst</option>
                    <option value="Human Resources Manager">Human Resources Manager</option>
                    <option value="Chief Sustainability Officer (CSO)">Chief Sustainability Officer (CSO)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', height: 40 }}>
                Continue →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label required">Password</label>
                <input
                  type="password" className="form-input"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                />
                <div className="form-hint">Must contain at least one letter and one number</div>
              </div>

              <div className="form-group">
                <label className="form-label required">Confirm Password</label>
                <input
                  type="password" className="form-input"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}
                  disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (
                    <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Creating…</>
                  ) : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-stone-500)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-forest)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-stone-400)', marginTop: 20 }}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .register-logo-container {
            padding-top: 32px;
          }
          .register-logo-container .logo-lockup {
            gap: 16.8px !important;
          }
          .register-logo-container .logo-lockup svg {
            width: 48px !important;
            height: 48px !important;
          }
          .register-logo-container .logo-lockup span {
            font-size: 26.4px !important;
          }
        }
      `}</style>
    </div>
  );
}
