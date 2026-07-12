import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';

const SEV_BADGE = { Critical:'badge-danger', High:'badge-warning', Medium:'badge-info', Low:'badge-neutral' };
const STATUS_BADGE = { Open:'badge-warning', 'In Progress':'badge-info', Resolved:'badge-success', Overdue:'badge-danger' };
const AUDIT_BADGE = { Scheduled:'badge-info', 'In Progress':'badge-warning', Completed:'badge-success', Cancelled:'badge-neutral' };

export default function GovernancePage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isManager = ['admin','manager'].includes(user?.role);
  const [tab, setTab] = useState('policies');

  const { data: policies } = useQuery({
    queryKey: ['policies'],
    queryFn: () => api.get('/governance/policies').then(r => r.data.data),
    enabled: tab === 'policies',
  });

  const { data: audits } = useQuery({
    queryKey: ['audits'],
    queryFn: () => api.get('/governance/audits').then(r => r.data.data),
    enabled: tab === 'audits',
  });

  const { data: issues } = useQuery({
    queryKey: ['compliance-issues'],
    queryFn: () => api.get('/governance/compliance-issues').then(r => r.data.data),
    enabled: tab === 'compliance',
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id) => api.post(`/governance/policies/${id}/acknowledge`),
    onSuccess: () => { toast.success('Policy acknowledged'); qc.invalidateQueries({ queryKey: ['policies'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution }) => api.put(`/governance/compliance-issues/${id}`, { action: 'resolve', resolution }),
    onSuccess: () => { toast.success('Issue resolved'); qc.invalidateQueries({ queryKey: ['compliance-issues'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const overdueIssues = issues?.filter(i => i.status === 'Overdue')?.length || 0;
  const openIssues = issues?.filter(i => ['Open','In Progress','Overdue'].includes(i.status))?.length || 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏛️ Governance</h1>
          <p className="page-subtitle">Policies, compliance tracking, audits and issue management</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-card-label">Total Policies</div>
          <div className="kpi-card-value">{policies?.length || '—'}</div>
          <div className="kpi-card-icon">📋</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Open Issues</div>
          <div className="kpi-card-value" style={{ color: openIssues > 0 ? 'var(--color-warning)' : undefined }}>{openIssues}</div>
          <div className="kpi-card-icon">⚠️</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Overdue Issues</div>
          <div className="kpi-card-value" style={{ color: overdueIssues > 0 ? 'var(--color-danger)' : undefined }}>{overdueIssues}</div>
          <div className="kpi-card-icon">🔴</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Audits Completed</div>
          <div className="kpi-card-value">{audits?.filter(a => a.status === 'Completed')?.length || '—'}</div>
          <div className="kpi-card-icon">✅</div>
        </div>
      </div>

      <div className="tabs">
        {[
          { key: 'policies', label: 'Policies' },
          { key: 'compliance', label: `Issues${openIssues > 0 ? ` (${openIssues})` : ''}` },
          { key: 'audits', label: 'Audits' },
        ].map(t => (
          <button key={t.key} className={`tab ${tab===t.key?'active':''}`} onClick={()=>setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Policies */}
      {tab === 'policies' && (
        <div className="grid-auto">
          {policies?.map(p => (
            <div key={p._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-stone-400)' }}>
                    v{p.version} · {p.category}
                  </div>
                </div>
                <span className={`badge ${p.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{p.status}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-stone-600)', marginBottom: 12, lineHeight: 1.5 }}>
                {p.description?.slice(0, 120)}{p.description?.length > 120 ? '…' : ''}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--color-stone-400)' }}>
                  {p.acknowledgedCount || 0} acknowledged
                </span>
                {p.isAcknowledged ? (
                  <span className="badge badge-success">✓ Acknowledged</span>
                ) : (
                  <button className="btn btn-primary btn-sm"
                    onClick={() => acknowledgeMutation.mutate(p._id)}
                    disabled={acknowledgeMutation.isPending}>
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
          {!policies?.length && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: 'var(--color-stone-500)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p>No policies published yet</p>
            </div>
          )}
        </div>
      )}

      {/* Compliance Issues */}
      {tab === 'compliance' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Issue</th><th>Department</th><th>Severity</th>
                <th>Status</th><th>Due Date</th><th>Owner</th>
                {isManager && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {issues?.map(issue => (
                <tr key={issue._id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{issue.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-stone-400)' }}>{issue.description?.slice(0,60)}…</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{issue.department?.name || '—'}</td>
                  <td><span className={`badge ${SEV_BADGE[issue.severity]||'badge-neutral'}`}>{issue.severity}</span></td>
                  <td><span className={`badge ${STATUS_BADGE[issue.status]||'badge-neutral'}`}>{issue.status}</span></td>
                  <td style={{ fontSize: 12, color: issue.isOverdue ? 'var(--color-danger)' : undefined }}>
                    {new Date(issue.dueDate).toLocaleDateString()}
                    {issue.isOverdue && ' ⚠️'}
                  </td>
                  <td style={{ fontSize: 13 }}>{issue.owner?.name || '—'}</td>
                  {isManager && (
                    <td>
                      {issue.status !== 'Resolved' && (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => resolveMutation.mutate({ id: issue._id, resolution: 'Resolved by management' })}>
                          Resolve
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {!issues?.length && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--color-stone-400)' }}>
                  No compliance issues found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Audits */}
      {tab === 'audits' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Audit</th><th>Department</th><th>Type</th><th>Scope</th><th>Status</th><th>Date</th><th>Auditor</th></tr>
            </thead>
            <tbody>
              {audits?.map(a => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{a.title}</td>
                  <td style={{ fontSize: 13 }}>{a.department?.name || '—'}</td>
                  <td><span className="badge badge-neutral">{a.type}</span></td>
                  <td style={{ fontSize: 13 }}>{a.scope}</td>
                  <td><span className={`badge ${AUDIT_BADGE[a.status]||'badge-neutral'}`}>{a.status}</span></td>
                  <td style={{ fontSize: 12 }}>{new Date(a.auditDate).toLocaleDateString()}</td>
                  <td style={{ fontSize: 13 }}>{a.auditor?.name || a.auditorName || '—'}</td>
                </tr>
              ))}
              {!audits?.length && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--color-stone-400)' }}>
                  No audits scheduled
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
