import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';

const CHART_COLORS = ['#2D5016', '#B45309', '#1D4ED8', '#15803D', '#7C3AED'];

export default function ReportsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isManager = ['admin','manager'].includes(user?.role);
  const [tab, setTab] = useState('overview');

  const { data: summary } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: () => api.get('/reports/summary').then(r => r.data.data),
  });

  const { data: envReport } = useQuery({
    queryKey: ['env-report'],
    queryFn: () => api.get('/reports/environmental').then(r => r.data.data),
    enabled: tab === 'environmental',
  });

  const { data: socialReport } = useQuery({
    queryKey: ['social-report'],
    queryFn: () => api.get('/reports/social').then(r => r.data.data),
    enabled: tab === 'social',
  });

  const { data: govReport } = useQuery({
    queryKey: ['gov-report'],
    queryFn: () => api.get('/reports/governance').then(r => r.data.data),
    enabled: tab === 'governance',
  });

  const calcScoresMutation = useMutation({
    mutationFn: () => api.post('/reports/calculate-scores', {}),
    onSuccess: () => {
      toast.success('ESG scores calculated!');
      qc.invalidateQueries({ queryKey: ['reports-summary'] });
    },
    onError: () => toast.error('Score calculation failed'),
  });

  // Format monthly CO2 data
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData = MONTHS.map((m, i) => {
    const found = summary?.monthlyEmissions?.find(x => x._id?.month === i + 1);
    return { month: m, co2: found?.co2 ? +(found.co2.toFixed(1)) : 0 };
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Reports & Analytics</h1>
          <p className="page-subtitle">ESG performance data, trends and downloadable reports</p>
        </div>
        <div className="page-actions">
          {isManager && (
            <button className="btn btn-secondary" onClick={() => calcScoresMutation.mutate()}
              disabled={calcScoresMutation.isPending}>
              {calcScoresMutation.isPending ? 'Calculating…' : '⟳ Recalculate Scores'}
            </button>
          )}
        </div>
      </div>

      <div className="tabs">
        {['overview','environmental','social','governance'].map(t => (
          <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
            {{overview:'Overview',environmental:'Environmental',social:'Social',governance:'Governance'}[t]}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          {/* KPI summary */}
          <div className="kpi-grid" style={{ marginBottom: 24 }}>
            <div className="kpi-card">
              <div className="kpi-card-label">Overall ESG Score</div>
              <div className="kpi-card-value">{summary?.scores?.avgTotal?.toFixed(0) || '—'}</div>
              <div className="kpi-card-sub">/ 100</div>
              <div className="kpi-card-icon">⭐</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card-label">Environmental Score</div>
              <div className="kpi-card-value" style={{ color: 'var(--color-forest)' }}>{summary?.scores?.avgEnv?.toFixed(0) || '—'}</div>
              <div className="kpi-card-icon">🌿</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card-label">Social Score</div>
              <div className="kpi-card-value" style={{ color: 'var(--color-copper)' }}>{summary?.scores?.avgSoc?.toFixed(0) || '—'}</div>
              <div className="kpi-card-icon">🤝</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card-label">Governance Score</div>
              <div className="kpi-card-value" style={{ color: 'var(--color-info)' }}>{summary?.scores?.avgGov?.toFixed(0) || '—'}</div>
              <div className="kpi-card-icon">🏛️</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">CO₂ Emissions Trend (Last 12 Months)</div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stone-100)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-stone-400)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-stone-400)' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="co2" stroke="var(--color-forest)"
                    strokeWidth={2} dot={{ r: 3 }} name="CO₂e (tonnes)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Department Rankings</div></div>
              {summary?.deptRanking?.slice(0,5).map((d, i) => (
                <div key={d._id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{d.department?.name}</span>
                    <span style={{ fontWeight: 600 }}>{d.totalScore || 0}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${d.totalScore || 0}%` }} />
                  </div>
                </div>
              ))}
              {!summary?.deptRanking?.length && (
                <p style={{ color: 'var(--color-stone-400)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  No scores yet. Click Recalculate.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Environmental */}
      {tab === 'environmental' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">Emissions by Scope</div></div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={envReport?.scopeBreakdown?.map(s => ({ name: s._id, value: +(s.total?.toFixed(1)||0), count: s.count }))||[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stone-100)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--color-forest)" radius={[3,3,0,0]} name="CO₂e (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Dept Breakdown</div></div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={envReport?.deptBreakdown?.slice(0,5)||[]} dataKey="total" nameKey="deptName"
                    cx="50%" cy="50%" outerRadius={80}>
                    {(envReport?.deptBreakdown||[]).map((_,i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v?.toFixed(1)} kg`]} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Goals Status</div></div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {envReport?.goals?.reduce((acc, g) => {
                const found = acc.find(x => x.status === g.status);
                if (found) found.count++; else acc.push({ status: g.status, count: 1 });
                return acc;
              }, [])?.map(({ status, count }) => (
                <div key={status} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-forest)' }}>{count}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-stone-500)' }}>{status}</div>
                </div>
              )) || <p style={{ color: 'var(--color-stone-400)', fontSize: 13 }}>No goal data</p>}
            </div>
          </div>
        </div>
      )}

      {/* Social Report */}
      {tab === 'social' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Gender Distribution</div></div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={socialReport?.genderDistrib?.map(g => ({ name: g._id||'Not specified', value: g.count }))||[]}
                  dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                  {(socialReport?.genderDistrib||[]).map((_,i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Participation by Department</div></div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={socialReport?.deptParticipation?.map(d => ({ name: d.deptName, count: d.count }))||[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stone-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-copper)" radius={[3,3,0,0]} name="Participations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Governance Report */}
      {tab === 'governance' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
            <div className="kpi-card">
              <div className="kpi-card-label">Total Policies</div>
              <div className="kpi-card-value">{govReport?.policies?.length || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card-label">Acknowledgements</div>
              <div className="kpi-card-value">{govReport?.acknowledgements?.length || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card-label">Total Audits</div>
              <div className="kpi-card-value">{govReport?.audits?.length || 0}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Issues by Severity</div></div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={govReport?.issuesBySeverity?.map(x => ({ name: `${x._id.severity} - ${x._id.status}`, count: x.count }))||[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stone-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-danger)" radius={[3,3,0,0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
