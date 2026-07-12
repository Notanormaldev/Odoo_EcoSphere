import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState('profile'); // 'profile' | 'notifications' | 'security' | 'organization'
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    designation: user?.designation || '',
    gender: user?.gender || 'prefer-not-to-say',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  // Password Form state
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Organization settings query (Admin only)
  const { data: esgConfig } = useQuery({
    queryKey: ['esg-settings'],
    queryFn: () => api.get('/notifications/settings').then(r => r.data.data),
    enabled: isAdmin && tab === 'organization',
  });

  const [orgForm, setOrgForm] = useState({
    organizationName: '',
    autoEmissionCalculation: false,
    evidenceRequiredForCSR: false,
    badgeAutoAward: true,
    scoreWeights: { environmental: 0.4, social: 0.3, governance: 0.3 }
  });

  // Sync orgForm when config loads
  React.useEffect(() => {
    if (esgConfig) {
      setOrgForm({
        organizationName: esgConfig.organizationName || '',
        autoEmissionCalculation: !!esgConfig.autoEmissionCalculation,
        evidenceRequiredForCSR: !!esgConfig.evidenceRequiredForCSR,
        badgeAutoAward: !!esgConfig.badgeAutoAward,
        scoreWeights: esgConfig.scoreWeights || { environmental: 0.4, social: 0.3, governance: 0.3 }
      });
    }
  }, [esgConfig]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.put('/users/me/profile', data),
    onSuccess: ({ data }) => {
      toast.success('Profile updated successfully');
      setUser(data.data);
      qc.invalidateQueries({ queryKey: ['auth-user'] });
    },
    onError: () => toast.error('Failed to update profile')
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => api.put('/users/me/password', data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs) => api.put('/notifications/preferences', prefs),
    onSuccess: () => {
      toast.success('Notification preferences updated');
      qc.invalidateQueries({ queryKey: ['auth-user'] });
    },
    onError: () => toast.error('Failed to update preferences'),
  });

  const updateConfigMutation = useMutation({
    mutationFn: (config) => api.put('/notifications/settings', config),
    onSuccess: () => {
      toast.success('Organization settings updated');
      qc.invalidateQueries({ queryKey: ['esg-settings'] });
    },
    onError: () => toast.error('Failed to update organization settings'),
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (pwForm.newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }
    changePasswordMutation.mutate({
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword
    });
  };

  const handleOrgSubmit = (e) => {
    e.preventDefault();
    const sum = Number(orgForm.scoreWeights.environmental) + Number(orgForm.scoreWeights.social) + Number(orgForm.scoreWeights.governance);
    if (Math.abs(sum - 1.0) > 0.001) {
      return toast.error('ESG Score Weights must sum to exactly 1.0');
    }
    updateConfigMutation.mutate(orgForm);
  };

  const handleConfirmLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Settings</h1>
          <p className="page-subtitle">Configure personal profile, notification options, and system parameters</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-ghost"
            style={{ color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}
            onClick={() => setShowLogoutModal(true)}
          >
            👋 Log Out
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          My Profile
        </button>
        <button className={`tab ${tab === 'notifications' ? 'active' : ''}`} onClick={() => setTab('notifications')}>
          Notifications
        </button>
        <button className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>
          Security & Password
        </button>
        {isAdmin && (
          <button className={`tab ${tab === 'organization' ? 'active' : ''}`} onClick={() => setTab('organization')}>
            Organization ESG
          </button>
        )}
      </div>

      {/* Profile Settings Tab */}
      {tab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="card" style={{ maxWidth: 650, padding: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Profile Details</h3>
          <p style={{ color: 'var(--color-stone-500)', fontSize: 13, marginBottom: 24 }}>
            Update your public profile information and description bio
          </p>

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
              placeholder="Write a brief introduction about your focus on sustainability..."
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              maxLength={250}
            />
            <div style={{ fontSize: 11, color: 'var(--color-stone-400)', marginTop: 4, textAlign: 'right' }}>
              {profileForm.bio.length}/250 characters
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <div className="card" style={{ maxWidth: 650, padding: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Notification Preferences</h3>
          <p style={{ color: 'var(--color-stone-500)', fontSize: 13, marginBottom: 24 }}>
            Choose how you would like to receive updates from EcoSphere
          </p>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, marginBottom: 2 }}>In-App Notifications</label>
              <div style={{ fontSize: 12, color: 'var(--color-stone-500)' }}>Receive updates in the application dashboard header</div>
            </div>
            <input
              type="checkbox"
              style={{ width: 20, height: 20, accentColor: 'var(--color-forest)', cursor: 'pointer' }}
              checked={user?.notificationPreferences?.inApp ?? true}
              onChange={(e) => updatePreferencesMutation.mutate({
                ...user?.notificationPreferences,
                inApp: e.target.checked
              })}
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, marginBottom: 2 }}>Email Notifications</label>
              <div style={{ fontSize: 12, color: 'var(--color-stone-500)' }}>Receive notification alerts directly to your registered email</div>
            </div>
            <input
              type="checkbox"
              style={{ width: 20, height: 20, accentColor: 'var(--color-forest)', cursor: 'pointer' }}
              checked={user?.notificationPreferences?.email ?? true}
              onChange={(e) => updatePreferencesMutation.mutate({
                ...user?.notificationPreferences,
                email: e.target.checked
              })}
            />
          </div>
        </div>
      )}

      {/* Security & Password Tab */}
      {tab === 'security' && (
        <form onSubmit={handlePasswordSubmit} className="card" style={{ maxWidth: 650, padding: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Change Password</h3>
          <p style={{ color: 'var(--color-stone-500)', fontSize: 13, marginBottom: 24 }}>
            Ensure your account is using a secure and robust password
          </p>

          <div className="form-group">
            <label className="form-label required">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">New Password</label>
            <input
              type="password"
              className="form-input"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? 'Updating Password...' : 'Change Password'}
          </button>
        </form>
      )}

      {/* Organization Settings Tab (Admin only) */}
      {tab === 'organization' && isAdmin && (
        <form onSubmit={handleOrgSubmit} className="card" style={{ maxWidth: 650, padding: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Organization Parameters</h3>
          <p style={{ color: 'var(--color-stone-500)', fontSize: 13, marginBottom: 24 }}>
            Global sustainability toggles and weighting configurations
          </p>

          <div className="form-group">
            <label className="form-label required">Organization Name</label>
            <input
              type="text"
              className="form-input"
              value={orgForm.organizationName}
              onChange={(e) => setOrgForm({ ...orgForm, organizationName: e.target.value })}
              required
            />
          </div>

          <div className="divider" />

          <h4 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>Feature Toggles</h4>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <label className="form-label" style={{ fontWeight: 500, marginBottom: 2 }}>Require evidence for CSR activity completion</label>
              <div style={{ fontSize: 12, color: 'var(--color-stone-500)' }}>Employees must upload proof/evidence for validation</div>
            </div>
            <input
              type="checkbox"
              style={{ width: 18, height: 18, accentColor: 'var(--color-forest)', cursor: 'pointer' }}
              checked={orgForm.evidenceRequiredForCSR}
              onChange={(e) => setOrgForm({ ...orgForm, evidenceRequiredForCSR: e.target.checked })}
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <label className="form-label" style={{ fontWeight: 500, marginBottom: 2 }}>Auto-award gamification badges</label>
              <div style={{ fontSize: 12, color: 'var(--color-stone-500)' }}>Automatically run rules to award badges on score milestones</div>
            </div>
            <input
              type="checkbox"
              style={{ width: 18, height: 18, accentColor: 'var(--color-forest)', cursor: 'pointer' }}
              checked={orgForm.badgeAutoAward}
              onChange={(e) => setOrgForm({ ...orgForm, badgeAutoAward: e.target.checked })}
            />
          </div>

          <div className="divider" />

          <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>ESG Score Weights (Sum must equal 1.0)</h4>
          
          <div className="grid-3col" style={{ marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label">Environmental (E)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                className="form-input"
                value={orgForm.scoreWeights.environmental}
                onChange={(e) => setOrgForm({
                  ...orgForm,
                  scoreWeights: { ...orgForm.scoreWeights, environmental: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Social (S)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                className="form-input"
                value={orgForm.scoreWeights.social}
                onChange={(e) => setOrgForm({
                  ...orgForm,
                  scoreWeights: { ...orgForm.scoreWeights, social: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Governance (G)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                className="form-input"
                value={orgForm.scoreWeights.governance}
                onChange={(e) => setOrgForm({
                  ...orgForm,
                  scoreWeights: { ...orgForm.scoreWeights, governance: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={updateConfigMutation.isPending}>
            {updateConfigMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}

      {/* Logout Confirmation Modal Dialog */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
          padding: 16,
        }}>
          <div className="card" style={{
            maxWidth: 400, width: '100%', padding: '32px 24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--color-danger-pale)', color: 'var(--color-danger)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, margin: '0 auto 16px'
            }}>
              👋
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-stone-900)', marginBottom: 8 }}>
              Log Out of EcoSphere?
            </h3>
            <p style={{ color: 'var(--color-stone-500)', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to end your session? You will need to enter your email and password to log in again.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-secondary w-full"
                style={{ justifyContent: 'center' }}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary w-full"
                style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)', justifyContent: 'center' }}
                onClick={handleConfirmLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
