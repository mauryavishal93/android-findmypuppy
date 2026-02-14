/**
 * Admin Panel root. Renders login or layout+outlet based on auth.
 * Uses hash routing: #dashboard, #users, #gameplay, #security, #shop, #maintenance
 */

import React, { useState, useEffect, useCallback } from 'react';
import { adminJson, adminFetch, setAdminToken, clearAdminToken, hasAdminToken } from './api/client';

type AdminUser = { _id: string; email: string; name: string; role: string; permissions: string[] };
type AdminPage = 'dashboard' | 'users' | 'gameplay' | 'security' | 'shop' | 'maintenance';

export function AdminApp() {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('findMyPuppy_adminToken'));
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<AdminPage>(() => {
    const hash = typeof window !== 'undefined' ? (window.location.hash?.slice(1) || '') : '';
    const allowed: AdminPage[] = ['dashboard', 'users', 'gameplay', 'security', 'shop', 'maintenance'];
    return (allowed.includes(hash as AdminPage) ? hash : 'dashboard') as AdminPage;
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadMe = useCallback(async () => {
    if (!hasAdminToken()) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    try {
      const data = await adminJson<{ admin: AdminUser }>('/auth/me');
      setAdmin(data.admin);
    } catch {
      clearAdminToken();
      setTokenState(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    const h = () => {
      const hash = window.location.hash?.slice(1) || '';
      const allowed: AdminPage[] = ['dashboard', 'users', 'gameplay', 'security', 'shop', 'maintenance'];
      setPage((allowed.includes(hash as AdminPage) ? hash : 'dashboard') as AdminPage);
    };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const data = await adminJson<{ token: string; admin: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAdminToken(data.token);
    setTokenState(data.token);
    setAdmin(data.admin);
    setPage('dashboard');
    window.location.hash = 'dashboard';
  };

  const handleLogout = () => {
    clearAdminToken();
    setTokenState(null);
    setAdmin(null);
    setPage('login');
    window.location.hash = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!admin && page !== 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <AdminLogin onLogin={handleLogin} />
      </div>
    );
  }

  if (page === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <AdminLogin onLogin={handleLogin} />
      </div>
    );
  }

  const navItems: { id: AdminPage; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'gameplay', label: 'Gameplay' },
    { id: 'shop', label: 'Shop' },
    { id: 'security', label: 'Security' },
    { id: 'maintenance', label: 'Maintenance' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg ${
            toast.type === 'success' ? 'bg-green-800' : toast.type === 'error' ? 'bg-red-800' : 'bg-slate-700'
          } text-white`}
        >
          {toast.message}
        </div>
      )}
      <aside className="w-56 bg-slate-800 border-r border-slate-700 p-4 flex flex-col">
        <h1 className="font-bold text-lg text-white mb-4">Find My Puppy Admin</h1>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`px-3 py-2 rounded ${page === id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700'}`}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-700">
          <span className="text-xs text-slate-400">{admin?.email} ({admin?.role})</span>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 block text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {page === 'dashboard' && <AdminDashboard />}
        {page === 'users' && <AdminUsers showToast={showToast} />}
        {page === 'gameplay' && <AdminGameplay showToast={showToast} />}
        {page === 'security' && <AdminSecurity showToast={showToast} />}
        {page === 'shop' && <AdminShop showToast={showToast} />}
        {page === 'maintenance' && <AdminMaintenance showToast={showToast} />}
      </main>
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-4">Admin Login</h2>
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-white mb-3"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-white mb-4"
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50"
      >
        {submitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

type UserListItem = {
  username: string;
  email: string;
  lastLogin?: string;
  points?: number;
  hints?: number;
  levelPassedEasy?: number;
  levelPassedMedium?: number;
  levelPassedHard?: number;
};

function AdminDashboard() {
  const [stats, setStats] = useState<{
    dau?: number;
    mau?: number;
    totalUsers?: number;
    revenueToday?: number;
    revenueYesterday?: number;
    revenueMonth?: number;
    revenueLastMonth?: number;
    revenueTotal?: number;
    hintsSold?: number;
    sparkline?: { date: string; dau: number; revenue: number }[];
  } | null>(null);
  const [err, setErr] = useState('');
  const [showDAUList, setShowDAUList] = useState(false);
  const [showMAUList, setShowMAUList] = useState(false);
  const [dauUsers, setDauUsers] = useState<UserListItem[]>([]);
  const [mauUsers, setMauUsers] = useState<UserListItem[]>([]);
  const [loadingDAU, setLoadingDAU] = useState(false);
  const [loadingMAU, setLoadingMAU] = useState(false);

  useEffect(() => {
    adminJson<{ stats: typeof stats }>('/dashboard/stats')
      .then((d) => setStats(d.stats || null))
      .catch((e) => setErr(e.message));
  }, []);

  const loadDAUUsers = async () => {
    setLoadingDAU(true);
    try {
      const data = await adminJson<{ users: UserListItem[]; count: number }>('/dashboard/dau-users');
      setDauUsers(data.users || []);
      setShowDAUList(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load DAU users');
    } finally {
      setLoadingDAU(false);
    }
  };

  const loadMAUUsers = async () => {
    setLoadingMAU(true);
    try {
      const data = await adminJson<{ users: UserListItem[]; count: number }>('/dashboard/mau-users');
      setMauUsers(data.users || []);
      setShowMAUList(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load MAU users');
    } finally {
      setLoadingMAU(false);
    }
  };

  if (err) return <p className="text-red-400">{err}</p>;
  if (!stats) return <p className="text-slate-400">Loading stats...</p>;

  const maxDau = Math.max(1, ...(stats.sparkline?.map((s) => s.dau) ?? []));

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="DAU" 
          value={stats.dau ?? 0} 
          onClick={loadDAUUsers}
          loading={loadingDAU}
          clickable
        />
        <StatCard 
          label="MAU" 
          value={stats.mau ?? 0} 
          onClick={loadMAUUsers}
          loading={loadingMAU}
          clickable
        />
        <StatCard label="Total users" value={stats.totalUsers ?? 0} />
        <StatCard label="Hints sold" value={stats.hintsSold ?? 0} />
        <StatCard label="Revenue today (₹)" value={stats.revenueToday ?? 0} />
        <StatCard label="Revenue yesterday (₹)" value={stats.revenueYesterday ?? 0} />
        <StatCard label="Revenue month (₹)" value={stats.revenueMonth ?? 0} />
        <StatCard label="Revenue last month (₹)" value={stats.revenueLastMonth ?? 0} />
        <StatCard label="Revenue total (₹)" value={stats.revenueTotal ?? 0} />
      </div>
      {stats.sparkline && stats.sparkline.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-white mb-3">Last 7 days (DAU)</h3>
          <div className="flex items-end gap-1 h-32">
            {stats.sparkline.map((s) => (
              <div key={s.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t min-h-[2px] transition-all hover:opacity-80"
                  style={{ 
                    height: `${Math.max(4, (s.dau / maxDau) * 100)}px`,
                    background: `linear-gradient(to top, #f97316, #fb923c, #fdba74)`
                  }}
                  title={`${s.date}: DAU ${s.dau}, ₹${s.revenue}`}
                />
                <span className="text-xs text-slate-400 truncate w-full text-center">{s.date.slice(5)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Bar = DAU; hover for revenue</p>
        </div>
      )}

      {showDAUList && (
        <UserListModal
          title="Daily Active Users (DAU)"
          users={dauUsers}
          onClose={() => setShowDAUList(false)}
        />
      )}

      {showMAUList && (
        <UserListModal
          title="Monthly Active Users (MAU)"
          users={mauUsers}
          onClose={() => setShowMAUList(false)}
        />
      )}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  onClick, 
  loading, 
  clickable 
}: { 
  label: string; 
  value: number;
  onClick?: () => void;
  loading?: boolean;
  clickable?: boolean;
}) {
  return (
    <div 
      className={`bg-slate-800 border border-slate-700 rounded-lg p-4 ${clickable ? 'cursor-pointer hover:bg-slate-750 hover:border-orange-500/50 transition-all' : ''}`}
      onClick={clickable && !loading ? onClick : undefined}
    >
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-xl font-bold text-white">
        {loading ? 'Loading...' : value}
      </p>
      {clickable && (
        <p className="text-xs text-orange-400 mt-1">Click to view list</p>
      )}
    </div>
  );
}

function UserListModal({ 
  title, 
  users, 
  onClose 
}: { 
  title: string; 
  users: UserListItem[]; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800">
          <h3 className="text-lg font-bold text-white">{title} ({users.length})</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="p-4">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-slate-300">Username</th>
                  <th className="px-4 py-2 text-slate-300">Email</th>
                  <th className="px-4 py-2 text-slate-300">Last Login</th>
                  <th className="px-4 py-2 text-slate-300">Points</th>
                  <th className="px-4 py-2 text-slate-300">Hints</th>
                  <th className="px-4 py-2 text-slate-300">Levels (E/M/H)</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No users found</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.username} className="border-t border-slate-700 hover:bg-slate-800/50">
                      <td className="px-4 py-2">{u.username}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2 text-slate-300">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-2">{u.points ?? 0}</td>
                      <td className="px-4 py-2">{u.hints ?? 0}</td>
                      <td className="px-4 py-2">
                        {u.levelPassedEasy ?? 0} / {u.levelPassedMedium ?? 0} / {u.levelPassedHard ?? 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

type AdminUserRow = {
  username: string;
  email: string;
  points?: number;
  hints?: number;
  levelPassedEasy?: number;
  levelPassedMedium?: number;
  levelPassedHard?: number;
  banned?: boolean;
  lastLogin?: string;
};

function AdminUsers({ showToast }: { showToast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<string>('lastLogin');
  const [bannedFilter, setBannedFilter] = useState<string>('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailUser, setDetailUser] = useState<AdminUserRow | null>(null);
  const limit = 100;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) params.set('q', q);
    if (sort) params.set('sort', sort);
    if (bannedFilter === 'yes') params.set('banned', 'true');
    if (bannedFilter === 'no') params.set('banned', 'false');
    adminJson<{ users: AdminUserRow[]; total: number }>(`/users?${params}`)
      .then((d) => {
        setUsers(d.users || []);
        setTotal(d.total || 0);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [page, q, sort, bannedFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Users</h2>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="search"
          placeholder="Search username or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white w-64"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white"
        >
          <option value="lastLogin">Sort: Last login</option>
          <option value="totalCleared">Sort: Total cleared</option>
          <option value="points">Sort: Points</option>
          <option value="hints">Sort: Hints</option>
        </select>
        <select
          value={bannedFilter}
          onChange={(e) => setBannedFilter(e.target.value)}
          className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white"
        >
          <option value="">All users</option>
          <option value="yes">Banned only</option>
          <option value="no">Not banned</option>
        </select>
      </div>
      {err && <p className="text-red-400 mb-2">{err}</p>}
      {loading && <p className="text-slate-400 mb-2">Loading users…</p>}
      <div className="max-h-[70vh] overflow-auto rounded-lg border border-slate-700">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-slate-300">Username</th>
              <th className="px-4 py-2 text-slate-300">Email</th>
              <th className="px-4 py-2 text-slate-300">Points</th>
              <th className="px-4 py-2 text-slate-300">Hints</th>
              <th className="px-4 py-2 text-slate-300">Easy</th>
              <th className="px-4 py-2 text-slate-300">Medium</th>
              <th className="px-4 py-2 text-slate-300">Hard</th>
              <th className="px-4 py-2 text-slate-300">Total cleared</th>
              <th className="px-4 py-2 text-slate-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const easy = u.levelPassedEasy ?? 0;
              const medium = u.levelPassedMedium ?? 0;
              const hard = u.levelPassedHard ?? 0;
              const totalCleared = easy + medium + hard;
              return (
                <tr
                  key={u.username}
                  className="border-t border-slate-700 hover:bg-slate-800/50 cursor-pointer"
                  onClick={() => setDetailUser(u)}
                >
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.points ?? 0}</td>
                  <td className="px-4 py-2">{u.hints ?? 0}</td>
                  <td className="px-4 py-2">{easy}</td>
                  <td className="px-4 py-2">{medium}</td>
                  <td className="px-4 py-2">{hard}</td>
                  <td className="px-4 py-2 font-medium text-white">{totalCleared}</td>
                  <td className="px-4 py-2">{u.banned ? <span className="text-red-400 font-medium">Banned</span> : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center gap-4">
        <p className="text-slate-400 text-sm">Total: {total}</p>
        {page > 1 && (
          <button type="button" onClick={() => setPage((p) => p - 1)} className="text-indigo-400 hover:underline text-sm">
            Previous
          </button>
        )}
        {page * limit < total && (
          <button type="button" onClick={() => setPage((p) => p + 1)} className="text-indigo-400 hover:underline text-sm">
            Next
          </button>
        )}
      </div>
      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onUpdated={() => { load(); setDetailUser(null); }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function UserDetailModal({
  user,
  onClose,
  onUpdated,
  showToast,
}: {
  user: AdminUserRow;
  onClose: () => void;
  onUpdated: () => void;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}) {
  const [profile, setProfile] = useState<AdminUserRow | null>(null);
  const [referrals, setReferrals] = useState<{ username: string; email?: string }[]>([]);
  const [purchases, setPurchases] = useState<{ purchaseId: string; amount: number; pack: string; purchaseDate: string }[]>([]);
  const [editPoints, setEditPoints] = useState<string>('');
  const [editHints, setEditHints] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminJson<{ user: AdminUserRow }>(`/users/${user.username}`)
      .then((d) => { setProfile(d.user); setEditPoints(String(d.user.points ?? 0)); setEditHints(String(d.user.hints ?? 0)); })
      .catch(() => showToast('Failed to load user', 'error'));
    adminJson<{ referrals: { username: string; email?: string }[] }>(`/users/${user.username}/referrals`)
      .then((d) => setReferrals(d.referrals || []))
      .catch(() => {});
    adminJson<{ purchases: { purchaseId: string; amount: number; pack: string; purchaseDate: string }[] }>(`/users/${user.username}/purchases`)
      .then((d) => setPurchases(d.purchases || []))
      .catch(() => {});
  }, [user.username]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminJson(`/users/${user.username}`, {
        method: 'PUT',
        body: JSON.stringify({
          points: editPoints === '' ? undefined : Math.max(0, Number(editPoints)),
          hints: editHints === '' ? undefined : Math.max(0, Number(editHints)),
        }),
      });
      showToast('Saved', 'success');
      onUpdated();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetProgress = async () => {
    if (!confirm('Reset all level progress for this user?')) return;
    setSaving(true);
    try {
      await adminJson(`/users/${user.username}`, { method: 'PUT', body: JSON.stringify({ resetProgress: true }) });
      showToast('Progress reset', 'success');
      onUpdated();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDailyCheckIn = async () => {
    if (!confirm('Reset daily check-in streak?')) return;
    setSaving(true);
    try {
      await adminJson(`/users/${user.username}`, { method: 'PUT', body: JSON.stringify({ resetDailyCheckIn: true }) });
      showToast('Daily check-in reset', 'success');
      onUpdated();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBan = async () => {
    const reason = prompt('Ban reason (optional):') || 'Banned by admin';
    setSaving(true);
    try {
      await adminJson(`/users/${user.username}/ban`, { method: 'POST', body: JSON.stringify({ reason }) });
      showToast('User banned', 'success');
      onUpdated();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUnban = async () => {
    setSaving(true);
    try {
      await adminJson(`/users/${user.username}/ban`, { method: 'DELETE' });
      showToast('User unbanned', 'success');
      onUpdated();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const p = profile || user;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">User: {p.username}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-slate-300"><strong>Email:</strong> {p.email}</p>
          <p className="text-slate-300"><strong>Points:</strong> <input type="number" min={0} value={editPoints} onChange={(e) => setEditPoints(e.target.value)} className="w-20 px-2 py-1 rounded bg-slate-700 text-white border border-slate-600" /></p>
          <p className="text-slate-300"><strong>Hints:</strong> <input type="number" min={0} value={editHints} onChange={(e) => setEditHints(e.target.value)} className="w-20 px-2 py-1 rounded bg-slate-700 text-white border border-slate-600" /></p>
          <p className="text-slate-300"><strong>Levels:</strong> E {(p.levelPassedEasy ?? 0)} / M {(p.levelPassedMedium ?? 0)} / H {(p.levelPassedHard ?? 0)}</p>
          {p.banned && <p className="text-red-400 font-medium">Banned</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleSave} disabled={saving} className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm disabled:opacity-50">Save points/hints</button>
            <button type="button" onClick={handleResetProgress} disabled={saving} className="px-3 py-1.5 rounded bg-slate-600 text-white text-sm disabled:opacity-50">Reset progress</button>
            <button type="button" onClick={handleResetDailyCheckIn} disabled={saving} className="px-3 py-1.5 rounded bg-slate-600 text-white text-sm disabled:opacity-50">Reset daily check-in</button>
            {p.banned ? (
              <button type="button" onClick={handleUnban} disabled={saving} className="px-3 py-1.5 rounded bg-green-600 text-white text-sm disabled:opacity-50">Unban</button>
            ) : (
              <button type="button" onClick={handleBan} disabled={saving} className="px-3 py-1.5 rounded bg-red-600 text-white text-sm disabled:opacity-50">Ban</button>
            )}
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Referrals ({referrals.length})</h4>
            <ul className="text-slate-400 text-sm list-disc pl-4">{referrals.slice(0, 10).map((r) => <li key={r.username}>{r.username}</li>)}{referrals.length > 10 && <li>…and {referrals.length - 10} more</li>}</ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Purchases (recent)</h4>
            <ul className="text-slate-400 text-sm space-y-1">{purchases.slice(0, 10).map((pur) => <li key={pur.purchaseId}>{pur.pack} — ₹{pur.amount} — {pur.purchaseDate?.slice(0, 10)}</li>)}{purchases.length > 10 && <li>…and {purchases.length - 10} more</li>}</ul>
          </div>
        </div>
      </div>
    </div>
  );
}

type GameConfig = {
  puppyCountEasy?: number;
  puppyCountMedium?: number;
  puppyCountHard?: number;
  timerMediumSeconds?: number;
  timerHardSeconds?: number;
  wrongTapLimit?: number;
  pointsPerLevelEasy?: number;
  pointsPerLevelMedium?: number;
  pointsPerLevelHard?: number;
  levelsEnabled?: boolean;
  timerEnabled?: boolean;
};
type OfferPrices = {
  hintPack?: string;
  marketPrice?: number;
  offerPrice?: number;
  hintCount?: number;
  offerReason?: string;
};

const DEFAULT_GAMEPLAY: GameConfig = {
  puppyCountEasy: 15,
  puppyCountMedium: 25,
  puppyCountHard: 40,
  timerMediumSeconds: 150,
  timerHardSeconds: 180,
  wrongTapLimit: 3,
  pointsPerLevelEasy: 5,
  pointsPerLevelMedium: 10,
  pointsPerLevelHard: 15,
  levelsEnabled: true,
  timerEnabled: true,
};

function AdminGameplay({ showToast }: { showToast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [offerPrices, setOfferPrices] = useState<OfferPrices | null>(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = () => {
    adminJson<{ config: GameConfig; offerPrices: OfferPrices }>('/gameplay/config')
      .then((d) => {
        setConfig(d.config || null);
        setOfferPrices(d.offerPrices || null);
      })
      .catch((e) => setErr(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const validate = (): string | null => {
    if (!config) return 'No config';
    if (config.puppyCountEasy != null && (config.puppyCountEasy < 1 || config.puppyCountEasy > 100)) return 'Puppy count Easy must be 1–100';
    if (config.puppyCountMedium != null && (config.puppyCountMedium < 1 || config.puppyCountMedium > 100)) return 'Puppy count Medium must be 1–100';
    if (config.puppyCountHard != null && (config.puppyCountHard < 1 || config.puppyCountHard > 100)) return 'Puppy count Hard must be 1–100';
    if (config.timerMediumSeconds != null && (config.timerMediumSeconds < 1 || config.timerMediumSeconds > 600)) return 'Timer Medium must be 1–600';
    if (config.timerHardSeconds != null && (config.timerHardSeconds < 1 || config.timerHardSeconds > 600)) return 'Timer Hard must be 1–600';
    if (config.wrongTapLimit != null && (config.wrongTapLimit < 0 || config.wrongTapLimit > 20)) return 'Wrong tap limit must be 0–20';
    if (config.pointsPerLevelEasy != null && config.pointsPerLevelEasy < 0) return 'Points Easy must be ≥ 0';
    if (config.pointsPerLevelMedium != null && config.pointsPerLevelMedium < 0) return 'Points Medium must be ≥ 0';
    if (config.pointsPerLevelHard != null && config.pointsPerLevelHard < 0) return 'Points Hard must be ≥ 0';
    return null;
  };

  const handleSave = async () => {
    if (!config) return;
    const v = validate();
    if (v) {
      setErr(v);
      showToast(v, 'error');
      return;
    }
    setSaving(true);
    setErr('');
    setSaved(false);
    try {
      await adminJson('/gameplay/config', {
        method: 'PUT',
        body: JSON.stringify({ ...config, offerPrices: offerPrices || undefined }),
      });
      setSaved(true);
      setEditing(false);
      load();
      showToast('Saved', 'success');
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      setErr(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (!confirm('Reset all gameplay settings to defaults?')) return;
    setConfig({ ...DEFAULT_GAMEPLAY });
    setEditing(true);
    showToast('Reset to defaults (click Save to apply)', 'info');
  };

  const updateConfig = (key: keyof GameConfig, value: number | boolean) => {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
  };
  const updateOffer = (key: keyof OfferPrices, value: string | number) => {
    setOfferPrices((o) => (o ? { ...o, [key]: value } : o));
  };

  if (err && !config) return <p className="text-red-400">{err}</p>;
  if (!config) return <p className="text-slate-400">Loading config...</p>;

  const rows: { label: string; key: keyof GameConfig; type: 'number' | 'boolean' }[] = [
    { label: 'Puppy count (Easy)', key: 'puppyCountEasy', type: 'number' },
    { label: 'Puppy count (Medium)', key: 'puppyCountMedium', type: 'number' },
    { label: 'Puppy count (Hard)', key: 'puppyCountHard', type: 'number' },
    { label: 'Timer Medium (sec)', key: 'timerMediumSeconds', type: 'number' },
    { label: 'Timer Hard (sec)', key: 'timerHardSeconds', type: 'number' },
    { label: 'Wrong tap limit', key: 'wrongTapLimit', type: 'number' },
    { label: 'Points per level (Easy)', key: 'pointsPerLevelEasy', type: 'number' },
    { label: 'Points per level (Medium)', key: 'pointsPerLevelMedium', type: 'number' },
    { label: 'Points per level (Hard)', key: 'pointsPerLevelHard', type: 'number' },
    { label: 'Levels enabled', key: 'levelsEnabled', type: 'boolean' },
    { label: 'Timer enabled', key: 'timerEnabled', type: 'boolean' },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between shrink-0 mb-4">
        <h2 className="text-2xl font-bold text-white">Gameplay config</h2>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded bg-slate-600 text-white font-medium hover:bg-slate-500"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded bg-slate-700 text-slate-200 font-medium hover:bg-slate-600"
              >
                Reset to defaults
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setEditing(false); load(); }}
                disabled={saving}
                className="px-4 py-2 rounded bg-slate-600 text-white font-medium hover:bg-slate-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>
      {err && <p className="text-red-400 shrink-0 mb-2">{err}</p>}

      <div className="max-h-[70vh] overflow-auto space-y-6 pr-2">
        <div className="rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-4 py-2 text-slate-300">Setting</th>
                <th className="px-4 py-2 text-slate-300">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ label, key, type }) => (
                <tr key={key} className="border-t border-slate-700">
                  <td className="px-4 py-2 text-slate-300">{label}</td>
                  <td className="px-4 py-2">
                    {editing ? (
                      type === 'number' ? (
                        <input
                          type="number"
                          value={config[key] as number ?? ''}
                          onChange={(e) => updateConfig(key, Number(e.target.value))}
                          className="w-32 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={!!(config[key] as boolean)}
                          onChange={(e) => updateConfig(key, e.target.checked)}
                          className="rounded"
                        />
                      )
                    ) : (
                      <span className="text-white">
                        {type === 'boolean' ? (config[key] ? 'Yes' : 'No') : String(config[key] ?? '—')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-3">Offer prices (hint pack)</h3>
          <p className="text-slate-400 text-sm mb-2">Changes here apply to the game for all users.</p>
          <div className="rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-slate-300">Field</th>
                  <th className="px-4 py-2 text-slate-300">Value</th>
                </tr>
              </thead>
              <tbody>
                {offerPrices && (
                  <>
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-300">Hint pack name</td>
                      <td className="px-4 py-2">
                        {editing ? (
                          <input
                            type="text"
                            value={offerPrices.hintPack ?? ''}
                            onChange={(e) => updateOffer('hintPack', e.target.value)}
                            className="w-48 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white"
                          />
                        ) : (
                          <span className="text-white">{offerPrices.hintPack ?? '—'}</span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-300">Market price (₹)</td>
                      <td className="px-4 py-2">
                        {editing ? (
                          <input
                            type="number"
                            value={offerPrices.marketPrice ?? ''}
                            onChange={(e) => updateOffer('marketPrice', Number(e.target.value))}
                            className="w-32 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white"
                          />
                        ) : (
                          <span className="text-white">{offerPrices.marketPrice ?? '—'}</span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-300">Offer price (₹)</td>
                      <td className="px-4 py-2">
                        {editing ? (
                          <input
                            type="number"
                            value={offerPrices.offerPrice ?? ''}
                            onChange={(e) => updateOffer('offerPrice', Number(e.target.value))}
                            className="w-32 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white"
                          />
                        ) : (
                          <span className="text-white">{offerPrices.offerPrice ?? '—'}</span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-300">Hint count</td>
                      <td className="px-4 py-2">
                        {editing ? (
                          <input
                            type="number"
                            value={offerPrices.hintCount ?? ''}
                            onChange={(e) => updateOffer('hintCount', Number(e.target.value))}
                            className="w-32 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white"
                          />
                        ) : (
                          <span className="text-white">{offerPrices.hintCount ?? '—'}</span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-300">Offer reason</td>
                      <td className="px-4 py-2">
                        {editing ? (
                          <input
                            type="text"
                            value={offerPrices.offerReason ?? ''}
                            onChange={(e) => updateOffer('offerReason', e.target.value)}
                            className="w-48 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white"
                          />
                        ) : (
                          <span className="text-white">{offerPrices.offerReason ?? '—'}</span>
                        )}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSecurity({ showToast }: { showToast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [logs, setLogs] = useState<{ adminEmail?: string; action: string; resource?: string; details?: unknown; ip?: string; createdAt: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [adminEmail, setAdminEmail] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 100;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (adminEmail) params.set('adminEmail', adminEmail);
    if (action) params.set('action', action);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    adminJson<{ logs: typeof logs; total: number }>(`/security/audit?${params}`)
      .then((d) => {
        setLogs(d.logs || []);
        setTotal(d.total || 0);
      })
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [page, adminEmail, action, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    const params = new URLSearchParams({ max: '2000' });
    if (adminEmail) params.set('adminEmail', adminEmail);
    if (action) params.set('action', action);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    try {
      const res = await adminFetch(`/security/audit/export?${params}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-logs.csv';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export downloaded', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Export failed', 'error');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Audit log</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <input placeholder="Admin email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white w-40" />
        <input placeholder="Action" value={action} onChange={(e) => setAction(e.target.value)} className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white w-40" />
        <input type="date" placeholder="From" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white" />
        <input type="date" placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white" />
        <button type="button" onClick={load} className="px-3 py-2 rounded bg-slate-600 text-white">Search</button>
        <button type="button" onClick={exportCsv} className="px-3 py-2 rounded bg-indigo-600 text-white">Export CSV</button>
      </div>
      {loading && <p className="text-slate-400 mb-2">Loading…</p>}
      <div className="max-h-[60vh] overflow-auto rounded-lg border border-slate-700">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-slate-300">Date</th>
              <th className="px-4 py-2 text-slate-300">Admin</th>
              <th className="px-4 py-2 text-slate-300">Action</th>
              <th className="px-4 py-2 text-slate-300">Resource</th>
              <th className="px-4 py-2 text-slate-300">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-t border-slate-700">
                <td className="px-4 py-2 text-slate-300">{log.createdAt ? new Date(log.createdAt).toISOString().slice(0, 19) : '—'}</td>
                <td className="px-4 py-2">{log.adminEmail ?? '—'}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{log.resource ?? '—'}</td>
                <td className="px-4 py-2 text-slate-400">{log.ip ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-slate-400 text-sm">Total: {total}</p>
      {page > 1 && <button type="button" onClick={() => setPage((p) => p - 1)} className="mr-2 text-indigo-400 text-sm">Previous</button>}
      {page * limit < total && <button type="button" onClick={() => setPage((p) => p + 1)} className="text-indigo-400 text-sm">Next</button>}
    </div>
  );
}

function AdminShop({ showToast }: { showToast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [transactions, setTransactions] = useState<{ username: string; purchaseId: string; amount: number; pack: string; purchaseType: string; purchaseDate: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [username, setUsername] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 50;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (username) params.set('username', username);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    adminJson<{ transactions: typeof transactions; total: number }>(`/shop/transactions?${params}`)
      .then((d) => {
        setTransactions(d.transactions || []);
        setTotal(d.total || 0);
      })
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [page, username, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    const params = new URLSearchParams({ max: '5000' });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    try {
      const res = await adminFetch(`/shop/transactions/export?${params}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export downloaded', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Export failed', 'error');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Transactions</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white w-40" />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white" />
        <button type="button" onClick={load} className="px-3 py-2 rounded bg-slate-600 text-white">Search</button>
        <button type="button" onClick={exportCsv} className="px-3 py-2 rounded bg-indigo-600 text-white">Export CSV</button>
      </div>
      {loading && <p className="text-slate-400 mb-2">Loading…</p>}
      <div className="max-h-[60vh] overflow-auto rounded-lg border border-slate-700">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-slate-300">Date</th>
              <th className="px-4 py-2 text-slate-300">Username</th>
              <th className="px-4 py-2 text-slate-300">Amount (₹)</th>
              <th className="px-4 py-2 text-slate-300">Pack</th>
              <th className="px-4 py-2 text-slate-300">Purchase ID</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.purchaseId} className="border-t border-slate-700">
                <td className="px-4 py-2 text-slate-300">{t.purchaseDate ? new Date(t.purchaseDate).toISOString().slice(0, 10) : '—'}</td>
                <td className="px-4 py-2">{t.username}</td>
                <td className="px-4 py-2">{t.amount}</td>
                <td className="px-4 py-2">{t.pack}</td>
                <td className="px-4 py-2 text-slate-400 truncate max-w-[120px]">{t.purchaseId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-slate-400 text-sm">Total: {total}</p>
      {page > 1 && <button type="button" onClick={() => setPage((p) => p - 1)} className="mr-2 text-indigo-400 text-sm">Previous</button>}
      {page * limit < total && <button type="button" onClick={() => setPage((p) => p + 1)} className="text-indigo-400 text-sm">Next</button>}
    </div>
  );
}

function AdminMaintenance({ showToast }: { showToast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('Under maintenance. Please try again later.');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminJson<{ maintenance: { enabled: boolean; message: string } }>('/maintenance')
      .then((d) => {
        setEnabled(d.maintenance?.enabled ?? false);
        setMessage(d.maintenance?.message || 'Under maintenance. Please try again later.');
      })
      .catch(() => showToast('Failed to load maintenance status', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminJson('/maintenance', { method: 'PUT', body: JSON.stringify({ enabled, message }) });
      showToast(enabled ? 'Maintenance mode ON' : 'Maintenance mode OFF', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-400">Loading…</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Maintenance mode</h2>
      <p className="text-slate-400 mb-4">When enabled, the game shows a full-screen maintenance message and does not load config.</p>
      <div className="flex flex-col gap-4 max-w-md">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="rounded" />
          <span className="text-white">Maintenance enabled</span>
        </label>
        <div>
          <label className="block text-slate-300 mb-1">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-600 text-white" />
        </div>
        <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-indigo-600 text-white font-medium w-fit disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
