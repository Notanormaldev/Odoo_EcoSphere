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
    gender: user?.gender || 'prefer-not-to-say',
    bio: user?.bio || '',
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
    <div className="animate-fade-in" style={{ maxWidth: 880 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 My Profile</h1>
          <p className="page-subtitle">Manage your personal details and view your ESG statistics</p>
        </div>
      </div>

      <div className="grid-chart-pie">
        {/* Profile Card & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'var(--color-forest-pale)', color: 'var(--color-forest)',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 36, margin: '0 auto 16px',
              border: '3px solid var(--color-forest-light)',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-stone-900)', marginBottom: 4 }}>{user?.name}</h3>
            <p style={{ color: 'var(--color-stone-600)', fontSize: 13, marginBottom: 12 }}>
              {user?.designation || 'Sustainability Partner'}
            </p>
            <span className="badge badge-forest" style={{ padding: '4px 10px', fontSize: 11 }}>{user?.role?.toUpperCase()}</span>

            {/* Profile Bio View */}
            {user?.bio && (
              <div style={{
                marginTop: 20, paddingTop: 16, borderTop: 'var(--border)',
                fontSize: 13, color: 'var(--color-stone-600)', fontStyle: 'italic',
                lineHeight: 1.5,
              }}>
                "{user.bio}"
              </div>
            )}
          </div>

          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-stone-800)', marginBottom: 12 }}>
              🏢 Organization Info
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-stone-500)' }}>Employee ID:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-stone-800)' }}>{user?.employeeId || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-stone-500)' }}>Email:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-stone-800)' }}>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-stone-500)' }}>Department:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-stone-800)' }}>
                  {user?.department?.name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-stone-800)', marginBottom: 12 }}>
              🏆 Gamification Stats
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-stone-500)' }}>XP Earned:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-forest)' }}>{user?.xp || 0} XP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-stone-500)' }}>Points:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-copper)' }}>{user?.points || 0} pts</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-stone-800)', marginBottom: 12 }}>
              🥇 Badges Earned ({user?.badges?.length || 0})
            </h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {user?.badges?.length ? user.badges.map(b => (
                <div key={b._id} style={{
                  width: 44, height: 44, background: 'var(--color-stone-50)',
                  border: 'var(--border)', borderRadius: 'var(--radius)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, cursor: 'help'
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
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-stone-900)', marginBottom: 8 }}>
            Personal Details
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-stone-500)', marginBottom: 24 }}>
            Update your basic info and description bio
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">Full Name</label>
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
                <option value="non-binary">Non-Binary</option>
                <option value="prefer-not-to-say">Prefer Not To Say</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Bio</label>
              <textarea
                className="form-input"
                rows={4}
                style={{ resize: 'vertical' }}
                placeholder="Tell us about your interest in sustainability..."
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                maxLength={250}
              />
              <div style={{ fontSize: 11, color: 'var(--color-stone-400)', marginTop: 4, textAlign: 'right' }}>
                {profileForm.bio.length}/250 characters
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
