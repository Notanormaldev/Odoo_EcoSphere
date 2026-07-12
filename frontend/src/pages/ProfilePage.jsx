import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    designation: user?.designation || '',
    gender: user?.gender || 'male',
    avatar: user?.avatar || ''
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.put('/users/me/profile', data),
    onSuccess: ({ data }) => {
      toast.success('Profile updated successfully');
      setUser(data.data);
      qc.invalidateQueries({ queryKey: ['auth-user'] });
    },
    onError: () => toast.error('Failed to update profile')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 My Profile</h1>
          <p className="page-subtitle">Manage your personal details and view your ESG statistics</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* Profile Card & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--color-forest-pale)', color: 'var(--color-forest)',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 32, margin: '0 auto 16px'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h3 style={{ fontSize: 18, marginBottom: 4 }}>{user?.name}</h3>
            <p style={{ color: 'var(--color-stone-500)', fontSize: 13, marginBottom: 12 }}>
              {user?.designation || 'Employee'}
            </p>
            <span className="badge badge-forest">{user?.role}</span>
          </div>

          <div className="card">
            <h4 style={{ marginBottom: 12 }}>Badges Earned</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {user?.badges?.length ? user.badges.map(b => (
                <div key={b._id} style={{
                  width: 44, height: 44, background: 'var(--color-stone-50)',
                  border: 'var(--border)', borderRadius: 'var(--radius)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20
                }} title={`${b.name}: ${b.description}`}>
                  {b.icon}
                </div>
              )) : (
                <p style={{ fontSize: 12, color: 'var(--color-stone-500)' }}>No badges unlocked yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Personal Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">Name</label>
              <input
                type="text"
                className="form-input"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-input"
                value={profileForm.designation}
                onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={profileForm.gender}
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? 'Updating...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
