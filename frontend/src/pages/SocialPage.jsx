import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';

const STATUS_BADGE = {
  Open: 'badge-success', Pending: 'badge-warning', Approved: 'badge-forest',
  Rejected: 'badge-danger', Cancelled: 'badge-neutral', Completed: 'badge-info',
};

export default function SocialPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isManager = ['admin','manager'].includes(user?.role);
  const [tab, setTab] = useState('activities');

  const { data: activities, isLoading } = useQuery({
    queryKey: ['csr-activities'],
    queryFn: () => api.get('/social/activities?limit=50').then(r => r.data),
  });

  const { data: participation } = useQuery({
    queryKey: ['my-participation'],
    queryFn: () => api.get('/social/participation?limit=50').then(r => r.data),
    enabled: tab === 'my-participation',
  });

  const { data: approvalQueue } = useQuery({
    queryKey: ['participation-queue'],
    queryFn: () => api.get('/social/participation?approvalStatus=Pending&limit=50').then(r => r.data),
    enabled: tab === 'approvals' && isManager,
  });

  const { data: diversity } = useQuery({
    queryKey: ['diversity'],
    queryFn: () => api.get('/social/diversity').then(r => r.data.data),
    enabled: tab === 'diversity',
  });

  const joinMutation = useMutation({
    mutationFn: (id) => api.post(`/social/activities/${id}/join`),
    onSuccess: () => { toast.success('Joined activity!'); qc.invalidateQueries({ queryKey: ['csr-activities'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to join'),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action, rejectionReason }) =>
      api.put(`/social/participation/${id}/approve`, { action, rejectionReason }),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['participation-queue'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🤝 Social</h1>
          <p className="page-subtitle">CSR activities, employee participation and diversity metrics</p>
        </div>
      </div>

      <div className="tabs">
        {[
          { key: 'activities', label: 'Activities' },
          { key: 'my-participation', label: 'My Participation' },
          ...(isManager ? [{ key: 'approvals', label: `Approvals${approvalQueue?.total > 0 ? ` (${approvalQueue.total})` : ''}` }] : []),
          { key: 'diversity', label: 'Diversity' },
        ].map(t => (
          <button key={t.key} className={`tab ${tab===t.key?'active':''}`} onClick={()=>setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Activities */}
      {tab === 'activities' && (
        <div className="grid-auto">
          {isLoading && [1,2,3].map(i => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '70%' }} />
            </div>
          ))}
          {activities?.data?.map(activity => (
            <div key={activity._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{activity.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-stone-500)' }}>
                    {activity.organizer?.name} · {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
                <span className={`badge ${STATUS_BADGE[activity.status]||'badge-neutral'}`}>{activity.status}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-stone-600)', flex: 1, marginBottom: 12, lineHeight: 1.5 }}>
                {activity.description?.slice(0, 120)}{activity.description?.length > 120 ? '…' : ''}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--color-stone-500)', marginBottom: 12 }}>
                <span>👥 {activity.participantCount || 0} participants</span>
                {activity.pointsAwarded && <span>🏆 {activity.pointsAwarded} pts</span>}
              </div>
              {activity.userParticipationStatus ? (
                <span className={`badge ${STATUS_BADGE[activity.userParticipationStatus]||'badge-neutral'}`} style={{ alignSelf: 'flex-start' }}>
                  {activity.userParticipationStatus}
                </span>
              ) : activity.status === 'Open' && (
                <button className="btn btn-primary btn-sm"
                  onClick={() => joinMutation.mutate(activity._id)}
                  disabled={joinMutation.isPending}
                >
                  Join Activity
                </button>
              )}
            </div>
          ))}
          {!isLoading && !activities?.data?.length && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: 'var(--color-stone-500)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
              <p>No CSR activities available</p>
            </div>
          )}
        </div>
      )}

      {/* My Participation */}
      {tab === 'my-participation' && (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Activity</th><th>Joined</th><th>Status</th><th>XP Earned</th><th>Points</th></tr></thead>
            <tbody>
              {participation?.data?.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 500 }}>{p.activity?.title || '—'}</td>
                  <td style={{ fontSize: 12 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td><span className={`badge ${STATUS_BADGE[p.approvalStatus]||'badge-neutral'}`}>{p.approvalStatus}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{p.xpEarned || 0}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{p.pointsEarned || 0}</td>
                </tr>
              ))}
              {!participation?.data?.length && (
                <tr><td colSpan={5} style={{ textAlign:'center', padding:48, color:'var(--color-stone-400)' }}>
                  You haven't joined any activities yet
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Approval Queue (Managers only) */}
      {tab === 'approvals' && isManager && (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Employee</th><th>Activity</th><th>Submitted</th><th>Proof</th><th>Actions</th></tr></thead>
            <tbody>
              {approvalQueue?.data?.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{p.employee?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-stone-400)' }}>{p.employee?.email}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{p.activity?.title}</td>
                  <td style={{ fontSize: 12 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    {p.proof?.url ? (
                      <a href={p.proof.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View</a>
                    ) : <span style={{ color: 'var(--color-stone-400)', fontSize: 12 }}>No proof</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => approveMutation.mutate({ id: p._id, action: 'approve' })}>
                        Approve
                      </button>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => approveMutation.mutate({ id: p._id, action: 'reject', rejectionReason: 'Insufficient evidence' })}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!approvalQueue?.data?.length && (
                <tr><td colSpan={5} style={{ textAlign:'center', padding:48, color:'var(--color-stone-400)' }}>
                  No pending approvals
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Diversity */}
      {tab === 'diversity' && (
        <div className="grid-auto">
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Gender Distribution</div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {diversity?.genderDistribution?.map(g => (
                <div key={g._id} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-forest)' }}>{g.count}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-stone-500)', textTransform: 'capitalize' }}>{g._id || 'Not specified'}</div>
                </div>
              ))}
            </div>
          </div>
          {diversity?.deptDistribution?.map(d => (
            <div key={d._id} className="kpi-card">
              <div className="kpi-card-label">{d.deptName}</div>
              <div className="kpi-card-value">{d.count}</div>
              <div className="kpi-card-sub">employees</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
