import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState('notifications');

  // Fetch ESG settings
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

  const handleOrgSubmit = (e) => {
    e.preventDefault();
    const sum = Number(orgForm.scoreWeights.environmental) + Number(orgForm.scoreWeights.social) + Number(orgForm.scoreWeights.governance);
    if (Math.abs(sum - 1.0) > 0.001) {
      return toast.error('ESG Score Weights must sum to exactly 1.0');
    }
    updateConfigMutation.mutate(orgForm);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Settings</h1>
          <p className="page-subtitle">Configure notification settings and organization-wide parameters</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'notifications' ? 'active' : ''}`} onClick={() => setTab('notifications')}>
          Notifications
        </button>
        {isAdmin && (
          <button className={`tab ${tab === 'organization' ? 'active' : ''}`} onClick={() => setTab('organization')}>
            Organization ESG Settings
          </button>
        )}
      </div>

      {tab === 'notifications' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ marginBottom: 16 }}>My Preferences</h3>
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
              style={{ width: 20, height: 20, accentColor: 'var(--color-forest)' }}
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
              style={{ width: 20, height: 20, accentColor: 'var(--color-forest)' }}
              checked={user?.notificationPreferences?.email ?? true}
              onChange={(e) => updatePreferencesMutation.mutate({
                ...user?.notificationPreferences,
                email: e.target.checked
              })}
            />
          </div>
        </div>
      )}

      {tab === 'organization' && isAdmin && (
        <form onSubmit={handleOrgSubmit} className="card" style={{ maxWidth: 650 }}>
          <h3 style={{ marginBottom: 16 }}>Organization Parameters</h3>
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

          <h4 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>Feature Toggles</h4>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <label className="form-label" style={{ fontWeight: 500, marginBottom: 2 }}>Require evidence for CSR activity completion</label>
              <div style={{ fontSize: 12, color: 'var(--color-stone-500)' }}>Employees must upload proof/evidence for validation</div>
            </div>
            <input
              type="checkbox"
              style={{ width: 18, height: 18, accentColor: 'var(--color-forest)' }}
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
              style={{ width: 18, height: 18, accentColor: 'var(--color-forest)' }}
              checked={orgForm.badgeAutoAward}
              onChange={(e) => setOrgForm({ ...orgForm, badgeAutoAward: e.target.checked })}
            />
          </div>

          <div className="divider" />

          <h4 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>ESG Score Weights (Sum must equal 1.0)</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
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

          <button type="submit" className="btn btn-primary" disabled={updateConfigMutation.isPending}>
            {updateConfigMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
}
