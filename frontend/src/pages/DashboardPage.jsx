import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';
import { formatNumber, formatCO2 } from '@shared/utils/number';
import { formatDate } from '@shared/utils/date';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
import { Leaf, Target, Heart, Trophy, AlertTriangle, Users } from 'lucide-react';

const SCORE_COLORS = { Environmental: '#2D5016', Social: '#B45309', Governance: '#1D4ED8' };

function KPICard({ label, value, unit = '', icon: Icon, trend, trendLabel }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value">
        {value ?? <span className="skeleton" style={{ display:'inline-block', width:80, height:36 }} />}
        {unit && <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--color-stone-400)', marginLeft: 4 }}>{unit}</span>}
      </div>
      {trend !== undefined && (
        <div className={`kpi-card-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
        </div>
      )}
      <div className="kpi-card-icon">
        {Icon && <Icon size={22} strokeWidth={2} style={{ color: 'var(--color-stone-400)' }} />}
      </div>
    </div>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)',
      padding: '10px 14px', fontSize: 13, boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--color-stone-700)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value?.toFixed ? p.value.toFixed(1) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['esg-summary'],
    queryFn: () => api.get('/reports/summary').then(r => r.data.data),
  });

  // Format monthly emissions for chart
  const monthlyData = MONTHS.map((month, i) => {
    const found = summary?.monthlyEmissions?.find(m => m._id?.month === i + 1);
    return { month, co2: found?.co2 ? +(found.co2.toFixed(1)) : 0 };
  });

  // ESG Score breakdown for pie chart
  const scoreData = summary ? [
    { name: 'Environmental', value: +(summary.scores?.avgEnv?.toFixed(1) || 0) },
    { name: 'Social',        value: +(summary.scores?.avgSoc?.toFixed(1) || 0) },
    { name: 'Governance',    value: +(summary.scores?.avgGov?.toFixed(1) || 0) },
  ] : [];

  const handleExportReport = () => {
    if (!summary) {
      toast.error('No report data available to export');
      return;
    }

    const csvContent = [
      ['EcoSphere ESG Performance Report'],
      ['Generated On', new Date().toLocaleString()],
      [],
      ['KPI Metric', 'Value'],
      ['Total CO2 Emissions', summary.kpi?.totalCO2e ? `${(summary.kpi.totalCO2e / 1000).toFixed(1)} t` : '—'],
      ['Active Goals', summary.kpi?.activeGoals || 0],
      ['CSR Participations', summary.kpi?.csrParticipations || 0],
      ['Challenges Completed', summary.kpi?.challengeCompletions || 0],
      ['Open Compliance Issues', summary.kpi?.openComplianceIssues || 0],
      ['Active Employees', summary.kpi?.activeEmployees || 0],
      [],
      ['Monthly Carbon Emissions Trend (Last 12 Months)'],
      ['Month', 'CO2 Equivalent (kg)'],
      ...(summary.monthlyEmissions || []).map(item => [item.month, item.co2Equivalent])
    ]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ecosphere_esg_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('ESG Report CSV downloaded successfully');
  };

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your organization's ESG performance at a glance</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExportReport}>Export Report</button>
          <button className="btn btn-primary btn-sm">+ Log Activity</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <KPICard
          label="Total CO₂ Emissions"
          value={summary?.kpi?.totalCO2e ? formatCO2(summary.kpi.totalCO2e) : '—'}
          icon={Leaf}
        />
        <KPICard label="Active Goals"      value={formatNumber(summary?.kpi?.activeGoals)}       icon={Target} />
        <KPICard label="CSR Participations" value={formatNumber(summary?.kpi?.csrParticipations)} icon={Heart} />
        <KPICard label="Challenges Completed" value={formatNumber(summary?.kpi?.challengeCompletions)} icon={Trophy} />
        <KPICard
          label="Open Issues"
          value={formatNumber(summary?.kpi?.openComplianceIssues)}
          icon={AlertTriangle}
        />
        <KPICard label="Active Employees" value={formatNumber(summary?.kpi?.activeEmployees)} icon={Users} />
      </div>

      {/* Charts row */}
      <div className="grid-chart-pie" style={{ marginBottom: 24 }}>
        {/* Monthly emissions */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Carbon Emissions</div>
              <div className="card-subtitle">CO₂ equivalent (tonnes) over 12 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stone-100)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-stone-400)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-stone-400)' }} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Line
                type="monotone" dataKey="co2" name="CO₂ (t)"
                stroke="var(--color-forest)" strokeWidth={2}
                dot={{ r: 3, fill: 'var(--color-forest)' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ESG Score breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">ESG Score</div>
              <div className="card-subtitle">Org-wide average</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-forest)', lineHeight: 1 }}>
                {summary?.scores?.avgTotal ? summary.scores.avgTotal.toFixed(0) : '—'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-stone-400)' }}>/ 100</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={scoreData} cx="50%" cy="50%"
                innerRadius={50} outerRadius={75}
                paddingAngle={3} dataKey="value"
              >
                {scoreData.map((entry) => (
                  <Cell key={entry.name} fill={SCORE_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}/100`]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {scoreData.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: SCORE_COLORS[s.name] }} />
                <span style={{ fontSize: 11, color: 'var(--color-stone-500)' }}>{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department rankings */}
      <div className="grid-2col">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Department ESG Rankings</div>
          </div>
          {summary?.deptRanking?.length ? (
            <div>
              {summary.deptRanking.slice(0, 6).map((dept, i) => (
                <div key={dept._id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 0', borderBottom: i < 5 ? '1px solid var(--color-stone-100)' : 'none',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: i === 0 ? 'var(--color-forest-pale)' : 'var(--color-stone-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    color: i === 0 ? 'var(--color-forest)' : 'var(--color-stone-500)',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-stone-800)' }}>
                      {dept.department?.name || 'Unknown Dept'}
                    </div>
                    <div className="progress-bar" style={{ marginTop: 4 }}>
                      <div className="progress-bar-fill" style={{ width: `${dept.totalScore || 0}%` }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-stone-700)', minWidth: 36, textAlign: 'right' }}>
                    {dept.totalScore || 0}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 32 }}>
              <div className="empty-state-icon" style={{ fontSize: 24 }}>📊</div>
              <p className="empty-state-description">No score data yet. Calculate scores from Reports.</p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Quick Actions</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Log Emission', icon: '♻️', path: '/environmental' },
              { label: 'Join CSR Activity', icon: '🤝', path: '/social' },
              { label: 'View Challenges', icon: '🎯', path: '/gamification' },
              { label: 'Check Policies', icon: '📋', path: '/governance' },
              { label: 'Ask EcoBot', icon: '💬', path: '/chatbot' },
              { label: 'View Reports', icon: '📊', path: '/reports' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 'var(--radius)',
                  border: 'var(--border)', textDecoration: 'none',
                  color: 'var(--color-stone-700)', fontSize: 13, fontWeight: 500,
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-stone-50)'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                <span style={{ fontSize: 18 }}>{action.icon}</span>
                {action.label}
              </a>
            ))}
          </div>

          {/* User XP display */}
          {user && (
            <div style={{
              marginTop: 16, padding: 14, background: 'var(--color-forest-pale)',
              borderRadius: 'var(--radius)', border: '1px solid rgba(45,80,22,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-forest)' }}>Your XP</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-forest)' }}>{user.xp || 0}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${Math.min(((user.xp || 0) % 1000) / 10, 100)}%` }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-stone-500)', marginTop: 4 }}>
                {1000 - ((user.xp || 0) % 1000)} XP to next level
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
