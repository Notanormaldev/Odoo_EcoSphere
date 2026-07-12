import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';

const RARITY_COLORS = { Common:'badge-neutral', Uncommon:'badge-info', Rare:'badge-forest', Epic:'badge-warning', Legendary:'badge-danger' };
const DIFFICULTY_COLORS = { Easy:'badge-success', Medium:'badge-warning', Hard:'badge-danger', Expert:'badge-neutral' };

export default function GamificationPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isManager = ['admin','manager'].includes(user?.role);
  const [tab, setTab] = useState('challenges');

  const { data: challenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => api.get('/gamification/challenges?status=Active').then(r => r.data),
    enabled: tab === 'challenges',
  });

  const { data: badges } = useQuery({
    queryKey: ['badges'],
    queryFn: () => api.get('/gamification/badges').then(r => r.data.data),
    enabled: tab === 'badges',
  });

  const { data: rewards } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => api.get('/gamification/rewards?status=Active').then(r => r.data.data),
    enabled: tab === 'rewards',
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/gamification/leaderboard?limit=10').then(r => r.data),
    enabled: tab === 'leaderboard',
  });

  const joinMutation = useMutation({
    mutationFn: (id) => api.post(`/gamification/challenges/${id}/join`),
    onSuccess: () => { toast.success('Joined challenge!'); qc.invalidateQueries({ queryKey: ['challenges'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not join'),
  });

  const redeemMutation = useMutation({
    mutationFn: (id) => api.post(`/gamification/rewards/${id}/redeem`),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Reward redeemed!');
      qc.invalidateQueries({ queryKey: ['rewards'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to redeem'),
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎯 Gamification</h1>
          <p className="page-subtitle">Challenges, badges, rewards and leaderboard</p>
        </div>
        {/* User stats */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="kpi-card" style={{ minWidth: 120, padding: 'var(--space-3) var(--space-4)' }}>
            <div className="kpi-card-label" style={{ marginBottom: 4 }}>XP</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-forest)' }}>{user?.xp || 0}</div>
          </div>
          <div className="kpi-card" style={{ minWidth: 120, padding: 'var(--space-3) var(--space-4)' }}>
            <div className="kpi-card-label" style={{ marginBottom: 4 }}>Points</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-copper)' }}>{user?.points || 0}</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {['challenges','badges','rewards','leaderboard'].map(t => (
          <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
            {{ challenges:'Challenges', badges:'Badges', rewards:'Rewards', leaderboard:'Leaderboard' }[t]}
          </button>
        ))}
      </div>

      {/* Challenges */}
      {tab === 'challenges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {challenges?.data?.map(c => (
            <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className={`badge ${DIFFICULTY_COLORS[c.difficulty]||'badge-neutral'}`}>{c.difficulty}</span>
                    {c.category?.name && <span className="badge badge-neutral">{c.category.name}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flex: 'none' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-forest)' }}>+{c.xpReward} XP</div>
                  {c.pointsReward > 0 && <div style={{ fontSize: 11, color: 'var(--color-copper)' }}>+{c.pointsReward} pts</div>}
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--color-stone-600)', flex: 1, marginBottom: 12, lineHeight: 1.5 }}>
                {c.description?.slice(0,120)}{c.description?.length > 120 ? '…' : ''}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-stone-500)', marginBottom: 12 }}>
                <span>👥 {c.participantCount || 0} joined</span>
                {c.deadline && <span>📅 {new Date(c.deadline).toLocaleDateString()}</span>}
              </div>

              {c.userParticipation ? (
                <span className={`badge ${c.userParticipation.approvalStatus==='Approved'?'badge-success':'badge-warning'}`} style={{ alignSelf:'flex-start' }}>
                  {c.userParticipation.approvalStatus === 'Approved' ? '✓ Completed' : '⏳ In Progress'}
                </span>
              ) : (
                <button className="btn btn-primary btn-sm"
                  onClick={() => joinMutation.mutate(c._id)}
                  disabled={joinMutation.isPending}>
                  Take Challenge
                </button>
              )}
            </div>
          ))}
          {!challenges?.data?.length && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'var(--color-stone-500)' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
              <p>No active challenges</p>
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      {tab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
          {badges?.map(b => (
            <div key={b._id} className="card card-sm" style={{
              textAlign: 'center',
              opacity: b.isEarned ? 1 : 0.55,
              position: 'relative',
            }}>
              {!b.isEarned && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(250,250,249,0.6)', zIndex: 1, fontSize: 20,
                }}>🔒</div>
              )}
              <div style={{ fontSize: 36, marginBottom: 8 }}>{b.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{b.name}</div>
              <span className={`badge ${RARITY_COLORS[b.rarity]||'badge-neutral'}`}>{b.rarity}</span>
              <div style={{ fontSize: 11, color: 'var(--color-stone-500)', marginTop: 8 }}>
                {b.unlockRule?.description || b.description}
              </div>
            </div>
          ))}
          {!badges?.length && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'var(--color-stone-500)' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🏅</div>
              <p>No badges configured yet</p>
            </div>
          )}
        </div>
      )}

      {/* Rewards */}
      {tab === 'rewards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {rewards?.map(r => {
            const canAfford = (user?.points || 0) >= r.pointsRequired;
            return (
              <div key={r._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                  <span className="badge badge-neutral">{r.category}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-stone-600)', marginBottom: 12, lineHeight: 1.5 }}>
                  {r.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-copper)' }}>
                      {r.pointsRequired} pts
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-stone-400)' }}>
                      {r.stock} left in stock
                    </div>
                  </div>
                  <button
                    className={`btn btn-sm ${canAfford ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => redeemMutation.mutate(r._id)}
                    disabled={!canAfford || redeemMutation.isPending || r.stock <= 0}
                    title={!canAfford ? `Need ${r.pointsRequired - (user?.points||0)} more points` : ''}
                  >
                    {r.stock <= 0 ? 'Out of Stock' : canAfford ? 'Redeem' : `Need ${r.pointsRequired} pts`}
                  </button>
                </div>
              </div>
            );
          })}
          {!rewards?.length && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'var(--color-stone-500)' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🎁</div>
              <p>No rewards available</p>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container" style={{ borderRadius: 'var(--radius-md)' }}>
            <table className="table">
              <thead>
                <tr><th>#</th><th>Employee</th><th>Department</th><th>XP</th><th>Points</th><th>Challenges</th></tr>
              </thead>
              <tbody>
                {leaderboard?.data?.map((u) => {
                  const isMe = u._id === user?._id;
                  return (
                    <tr key={u._id} style={isMe ? { background: 'var(--color-forest-pale)' } : {}}>
                      <td>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: u.rank <= 3 ? 'var(--color-forest)' : 'var(--color-stone-100)',
                          color: u.rank <= 3 ? '#fff' : 'var(--color-stone-600)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700,
                        }}>
                          {u.rank <= 3 ? ['🥇','🥈','🥉'][u.rank-1] : u.rank}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--color-forest-pale)', color: 'var(--color-forest)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 12,
                          }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}{isMe && ' (You)'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--color-stone-500)' }}>{u.department?.name || '—'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13 }}>{u.xp}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.points}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{u.totalChallengesCompleted || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
