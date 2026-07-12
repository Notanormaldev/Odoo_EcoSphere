import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '@app/store/authStore';
import toast from 'react-hot-toast';
import api from '@shared/api/client';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken) {
      toast.error('Google authentication failed');
      navigate('/login');
      return;
    }

    setTokens(accessToken, refreshToken);

    // Fetch user info
    api.get('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(({ data }) => {
        setUser(data.data);
        toast.success(`Welcome, ${data.data.name.split(' ')[0]}!`);
        navigate('/dashboard');
      })
      .catch(() => {
        navigate('/login');
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--surface-base)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-stone-500)', fontSize: 14 }}>Completing sign in…</p>
      </div>
    </div>
  );
}
