import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';

function EmptyState({ icon, title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      <p className="empty-state-description">{description}</p>
    </div>
  );
}

function LogModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ sourceType: 'Electricity', quantity: '', unit: 'kWh', notes: '', department: '', scope: 'Scope 2' });
  const qc = useQueryClient();

  const { data: depts } = useQuery({ queryKey: ['departments'], queryFn: () => api.get('/departments').then(r => r.data.data) });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/environmental/carbon-transactions', data),
    onSuccess: () => {
      toast.success('Emission logged');
      qc.invalidateQueries({ queryKey: ['carbon-transactions'] });
      qc.invalidateQueries({ queryKey: ['esg-summary'] });
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to log'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.quantity || !form.department) return toast.error('Fill required fields');
    mutation.mutate(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Log Carbon Emission</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label required">Source Type</label>
                <select className="form-select" value={form.sourceType} onChange={e => setForm({...form, sourceType: e.target.value})}>
                  {['Electricity','Natural Gas','Fuel','Travel','Water','Waste','Other'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label required">Scope</label>
                <select className="form-select" value={form.scope} onChange={e => setForm({...form, scope: e.target.value})}>
                  <option>Scope 1</option><option>Scope 2</option><option>Scope 3</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label required">Quantity</label>
                <input type="number" className="form-input" placeholder="0.00" value={form.quantity}
                  onChange={e => setForm({...form, quantity: e.target.value})} min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input type="text" className="form-input" value={form.unit}
                  onChange={e => setForm({...form, unit: e.target.value})} placeholder="kWh" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label required">Department</label>
              <select className="form-select" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                <option value="">Select department…</option>
                {depts?.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" rows={2} value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})} placeholder="Optional notes…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Logging…' : 'Log Emission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EnvironmentalPage() {
  const { user } = useAuthStore();
  const isManager = ['admin','manager'].includes(user?.role);
  const [tab, setTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);

  const { data: dashboard } = useQuery({
    queryKey: ['env-dashboard'],
    queryFn: () => api.get('/environmental/dashboard').then(r => r.data.data),
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['carbon-transactions'],
    queryFn: () => api.get('/environmental/carbon-transactions?limit=50').then(r => r.data),
    enabled: tab === 'transactions',
  });

  const { data: goals } = useQuery({
    queryKey: ['env-goals'],
    queryFn: () => api.get('/environmental/goals').then(r => r.data.data),
    enabled: tab === 'goals',
  });

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = MONTHS.map((m, i) => {
    const found = dashboard?.monthlyEmissions?.find(x => x._id === i + 1);
    return { month: m, value: found?.total ? +(found.total.toFixed(1)) : 0 };
  });

  const scopeData = dashboard?.scopeBreakdown?.map(s => ({
    name: s._id, value: +(s.total?.toFixed(1) || 0),
  })) || [];

  const scopeColors = { 'Scope 1': '#2D5016', 'Scope 2': '#4A7A28', 'Scope 3': '#8ABF5C' };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🌿 Environmental</h1>
          <p className="page-subtitle">Carbon tracking, emission goals, and environmental metrics</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Log Emission</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-card-label">Total CO₂e</div>
          <div className="kpi-card-value">{((dashboard?.scopeBreakdown?.reduce((a,s)=>a+s.total,0)||0)/1000).toFixed(1)}</div>
          <div className="kpi-card-sub">tonnes CO₂ equivalent</div>
          <div className="kpi-card-icon">♻️</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Goals On Track</div>
          <div className="kpi-card-value">
            {dashboard?.goalsStats?.find(g=>g._id==='On Track')?.count || 0}
          </div>
          <div className="kpi-card-sub">of {dashboard?.goalsStats?.reduce((a,g)=>a+g.count,0)||0} active goals</div>
          <div className="kpi-card-icon">🎯</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Top Emitting Dept</div>
          <div className="kpi-card-value" style={{ fontSize: 18 }}>
            {dashboard?.topDeptEmissions?.[0]?.deptName || '—'}
          </div>
          <div className="kpi-card-sub">{(dashboard?.topDeptEmissions?.[0]?.total/1000||0).toFixed(1)} tonnes</div>
          <div className="kpi-card-icon">🏭</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview','transactions','goals'].map(t => (
          <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
            {{overview:'Overview',transactions:'Transactions',goals:'Goals'}[t]}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid-chart-pie">
          <div className="card">
            <div className="card-header"><div className="card-title">Monthly Emissions (CO₂e kg)</div></div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stone-100)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-stone-400)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-stone-400)' }} />
                <Tooltip />
                <Bar dataKey="value" name="CO₂e (kg)" fill="var(--color-forest)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Scope Breakdown</div></div>
            {scopeData.length ? scopeData.map(s => (
              <div key={s.name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--color-stone-700)', fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontWeight: 600 }}>{s.value} kg</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{
                    width: `${Math.min((s.value / (scopeData.reduce((a,x)=>a+x.value,0)||1)) * 100, 100)}%`,
                    background: scopeColors[s.name],
                  }} />
                </div>
              </div>
            )) : <EmptyState icon="📊" title="No data" description="Log emissions to see scope breakdown." />}
          </div>

          {/* Top departments */}
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="card-header"><div className="card-title">Top Emitting Departments</div></div>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead><tr><th>#</th><th>Department</th><th>Total CO₂e (kg)</th></tr></thead>
                <tbody>
                  {dashboard?.topDeptEmissions?.length ? dashboard.topDeptEmissions.map((d,i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{i+1}</td>
                      <td>{d.deptName}</td>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                        {d.total?.toFixed(1)}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-stone-400)', padding: 32 }}>No data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'transactions' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container" style={{ borderRadius: 'var(--radius-md)' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th><th>Source</th><th>Scope</th>
                  <th>Quantity</th><th>CO₂e (kg)</th><th>Department</th>
                </tr>
              </thead>
              <tbody>
                {txLoading && (
                  <tr><td colSpan={6}><div style={{padding:32,textAlign:'center'}}><span className="spinner" /></div></td></tr>
                )}
                {transactions?.data?.map(tx => (
                  <tr key={tx._id}>
                    <td style={{ fontSize: 12 }}>{new Date(tx.transactionDate||tx.createdAt).toLocaleDateString()}</td>
                    <td>{tx.sourceType}</td>
                    <td><span className={`badge ${tx.scope==='Scope 1'?'badge-danger':tx.scope==='Scope 2'?'badge-warning':'badge-info'}`}>{tx.scope}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{tx.quantity} {tx.unit}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{tx.co2Equivalent?.toFixed(2)}</td>
                    <td>{tx.department?.name || '—'}</td>
                  </tr>
                ))}
                {!txLoading && !transactions?.data?.length && (
                  <tr><td colSpan={6}><EmptyState icon="🌿" title="No transactions" description="Log your first emission to get started." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'goals' && (
        <div className="grid-auto">
          {goals?.map(goal => (
            <div key={goal._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{goal.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-stone-500)' }}>{goal.department?.name}</div>
                </div>
                <span className={`badge ${goal.status==='Completed'?'badge-success':goal.status==='On Track'?'badge-forest':goal.status==='At Risk'?'badge-warning':'badge-neutral'}`}>
                  {goal.status}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-stone-600)', marginBottom: 12 }}>{goal.description}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-stone-500)', marginBottom: 6 }}>
                <span>Progress</span>
                <span>{goal.currentValue || 0} / {goal.targetValue} {goal.unit}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{
                  width: `${Math.min(((goal.currentValue||0)/goal.targetValue)*100,100)}%`,
                }} />
              </div>
            </div>
          ))}
          {!goals?.length && (
            <div style={{ gridColumn: '1/-1' }}>
              <EmptyState icon="🎯" title="No goals set" description="Create environmental goals to track your sustainability targets." />
            </div>
          )}
        </div>
      )}

      {showModal && <LogModal onClose={() => setShowModal(false)} onSuccess={() => setShowModal(false)} />}
    </div>
  );
}
