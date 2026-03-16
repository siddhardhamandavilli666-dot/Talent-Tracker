import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, BarChart3, ShieldCheck, Trash2, CheckCircle, Award } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'stats';
  const setTab = (tab) => setSearchParams({ tab });

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    adminService.getStats().then(setStats).catch(console.error);
    adminService.getUsers().then((data) => setUsers(data.users)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleVerify = async (uid) => {
    try {
      await adminService.verifyUser(uid);
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, verified: true } : u));
      toast.success('Profile verified!');
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (uid) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await adminService.deleteUser(uid);
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      toast.success('User deleted');
    } catch (err) { toast.error(err.message); }
  };

  const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;
  const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const TABS = [
    { key: 'stats', label: 'Platform Stats', icon: <BarChart3 size={16} /> },
    { key: 'users', label: 'Manage Users', icon: <Users size={16} /> },
  ];

  return (
    <div className="page">
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div style={{ marginBottom: 20, padding: '0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #FFB547, #FF5757)' }}>👑</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>Admin Panel</p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-warning)' }}>Full Access</p>
              </div>
            </div>
          </div>
          <hr className="divider" />
          {TABS.map((tab) => (
            <div key={tab.key} className={`sidebar-item ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setTab(tab.key)}>
              {tab.icon} {tab.label}
            </div>
          ))}
        </aside>

        <main className="dashboard-content">
          {activeTab === 'stats' && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>Platform Overview</h2>
              {stats ? (
                <div className="grid grid-3" style={{ marginBottom: 32 }}>
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={22} />, gradient: 'var(--gradient-primary)' },
                    { label: 'Students', value: stats.students, icon: '🎓', gradient: 'linear-gradient(135deg, #00D4AA, #6C63FF)' },
                    { label: 'Organizations', value: stats.organizations, icon: '🏢', gradient: 'linear-gradient(135deg, #FF6B9D, #FFB547)' },
                    { label: 'Achievements', value: stats.totalAchievements, icon: <Award size={22} />, gradient: 'linear-gradient(135deg, #57C7FF, #6C63FF)' },
                    { label: 'Opportunities', value: stats.totalOpportunities, icon: '💼', gradient: 'linear-gradient(135deg, #FFB547, #FF5757)' },
                    { label: 'Applications', value: stats.totalApplications, icon: '📋', gradient: 'var(--gradient-accent)' },
                  ].map((s) => (
                    <div key={s.label} className="stat-card">
                      <div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                      </div>
                      <div className="stat-icon" style={{ background: s.gradient }}>{s.icon}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Manage Users</h2>
                <div className="filter-group">
                  {['', 'student', 'organization', 'admin'].map((r) => (
                    <button key={r} className={`filter-pill ${roleFilter === r ? 'active' : ''}`} onClick={() => setRoleFilter(r)}>
                      {r || 'All'}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>College</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((user) => (
                        <tr key={user.uid}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="avatar avatar-sm" style={{ background: 'var(--gradient-primary)', fontSize: 12 }}>
                                {user.photoURL ? <img src={user.photoURL} alt="" className="avatar avatar-sm" /> : getInitials(user.displayName)}
                              </div>
                              <div>
                                <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{user.displayName}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${user.role === 'admin' ? 'badge-warning' : user.role === 'organization' ? 'badge-info' : 'badge-primary'}`} style={{ textTransform: 'capitalize' }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{user.college || '—'}</td>
                          <td>
                            {user.verified ? (
                              <span className="badge badge-success"><CheckCircle size={11} /> Verified</span>
                            ) : (
                              <span className="badge badge-warning">Unverified</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {!user.verified && user.role === 'student' && (
                                <button className="btn btn-accent btn-sm" onClick={() => handleVerify(user.uid)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <ShieldCheck size={13} /> Verify
                                </button>
                              )}
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.uid)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
