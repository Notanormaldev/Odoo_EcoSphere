import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(({ data }) => {
        setTokens(data.data.accessToken, data.data.refreshToken);
        setUser(data.data.user);
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2500);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      });
  }, [token]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--surface-base)',
    }}>
      <div className="card" style={{ maxWidth: 400, textAlign: 'center', padding: 48 }}>
        {status === 'verifying' && (
          <>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 20px' }} />
            <p style={{ color: 'var(--color-stone-600)' }}>Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>Email Verified!</h2>
            <p style={{ color: 'var(--color-stone-500)', fontSize: 14 }}>
              Redirecting to your dashboard…
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ marginBottom: 8 }}>Verification Failed</h2>
            <p style={{ color: 'var(--color-stone-500)', fontSize: 14, marginBottom: 20 }}>{message}</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}
              style={{ justifyContent: 'center' }}>
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
