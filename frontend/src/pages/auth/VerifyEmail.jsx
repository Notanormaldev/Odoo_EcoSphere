import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';
import Logo from '@shared/ui/Logo';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    api.get(`/auth/verify-email/${token}`)
      .then(({ data }) => {
        setTokens(data.data.accessToken, data.data.refreshToken);
        setUser(data.data.user);
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2500);
      })
      .catch((err) => {
        setStatus('error');
        const errMsg = err.response?.data?.message || 'Verification failed';
        setMessage(errMsg);
      });
  }, [token]);

  // Resend verification
  const resendMutation = useMutation({
    mutationFn: (emailAddr) => api.post('/auth/resend-verification', { email: emailAddr }),
    onSuccess: () => {
      toast.success('Verification email resent! Check your inbox.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to resend. Try again.');
    },
  });

  const handleResend = (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');
    resendMutation.mutate(email);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--surface-base)',
      padding: '24px',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, textAlign: 'center', padding: '48px 40px' }}>

        {/* Logo at top */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Logo size={40} withText={true} variant="dark" />
        </div>

        {/* Verifying state */}
        {status === 'verifying' && (
          <>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-stone-800)', marginBottom: 8 }}>
              Verifying your email…
            </h2>
            <p style={{ color: 'var(--color-stone-500)', fontSize: 14 }}>
              Please wait a moment.
            </p>
          </>
        )}

        {/* Success state */}
        {status === 'success' && (
          <>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--color-success-pale)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 32,
            }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-stone-900)', marginBottom: 10 }}>
              Email Verified!
            </h2>
            <p style={{ color: 'var(--color-stone-500)', fontSize: 14, marginBottom: 24 }}>
              Your account is now active. Redirecting you to the dashboard…
            </p>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--color-danger-pale)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 32,
            }}>❌</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-stone-900)', marginBottom: 8 }}>
              Verification Failed
            </h2>
            <p style={{ color: 'var(--color-stone-500)', fontSize: 14, marginBottom: 24 }}>
              {message || 'Invalid or expired verification token.'}
            </p>

            <div style={{
              background: 'var(--color-stone-50)', border: 'var(--border)',
              borderRadius: 'var(--radius-md)', padding: '20px',
              marginBottom: 20, textAlign: 'left',
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-stone-700)', marginBottom: 12 }}>
                📧 Get a new verification link
              </p>
              <form onSubmit={handleResend}>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={resendMutation.isPending}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {resendMutation.isPending ? 'Sending…' : 'Resend Verification Email'}
                </button>
              </form>
            </div>

            <div className="divider" />

            <button
              className="btn btn-ghost"
              onClick={() => navigate('/login')}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
