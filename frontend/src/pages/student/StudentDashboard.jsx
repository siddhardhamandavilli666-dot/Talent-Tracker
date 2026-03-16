import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Award, Briefcase, Upload, ExternalLink, CheckCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { achievementService } from '../../services/achievementService';
import { applicationService } from '../../services/applicationService';
import { messageService } from '../../services/messageService';
import AchievementUpload from './AchievementUpload';
import toast from 'react-hot-toast';

const STATUS_CLASS = { pending: 'status-pending', accepted: 'status-accepted', rejected: 'status-rejected', shortlisted: 'status-shortlisted' };

const StudentDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [achievements, setAchievements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const setTab = (tab) => setSearchParams({ tab });

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    try {
      const d = dateValue?.toDate?.() || new Date(dateValue);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    
    achievementService.getByUser(currentUser.uid)
      .then(setAchievements)
      .catch(err => console.error('Achievements fetch error:', err));

    setApplications([]);

    setMessages([]);

    setTimeout(() => setLoading(false), 800);
  }, [currentUser]);

  const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const TABS = [
    { key: 'overview', label: 'Overview', icon: <User size={16} /> },
    { key: 'upload', label: 'Upload Achievement', icon: <Upload size={16} /> },
    { key: 'applications', label: 'My Applications', icon: <Briefcase size={16} /> },
    { key: 'messages', label: 'Messages', icon: <MessageCircle size={16} /> },
  ];

  return (
    <div className="page">
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div style={{ marginBottom: 20, padding: '0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div className="avatar avatar-md" style={{ background: 'var(--gradient-primary)' }}>
                {userProfile?.photoURL ? <img src={userProfile.photoURL} alt="" className="avatar avatar-md" /> : getInitials(userProfile?.displayName)}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{userProfile?.displayName}</p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Student</p>
              </div>
            </div>
            {userProfile?.verified && (
              <div className="badge badge-success" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
                <CheckCircle size={12} /> Verified Profile
              </div>
            )}
            <Link to={`/profile/${currentUser?.uid}`} className="btn btn-secondary btn-sm w-full" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <ExternalLink size={13} /> View Public Profile
            </Link>
          </div>
          <hr className="divider" />
          {TABS.map((tab) => (
            <div key={tab.key} className={`sidebar-item ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setTab(tab.key)}>
              {tab.icon} {tab.label}
            </div>
          ))}
        </aside>

        <main className="dashboard-content">
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>
                Welcome back, {userProfile?.displayName?.split(' ')[0]}! 👋
              </h2>

              <div className="grid grid-3" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                  <div>
                    <div className="stat-value">{achievements.length}</div>
                    <div className="stat-label">Achievements</div>
                  </div>
                  <div className="stat-icon"><Award size={22} /></div>
                </div>
                <div className="stat-card">
                  <div>
                    <div className="stat-value">0</div>
                    <div className="stat-label">Applications</div>
                  </div>
                  <div className="stat-icon"><Briefcase size={22} /></div>
                </div>
                <div className="stat-card">
                  <div>
                    <div className="stat-value">0</div>
                    <div className="stat-label">Accepted</div>
                  </div>
                  <div className="stat-icon" style={{ background: 'var(--gradient-accent)' }}><CheckCircle size={22} /></div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setTab('upload')}>
                    <Upload size={14} /> Upload Achievement
                  </button>
                  <Link to="/opportunities" className="btn btn-secondary btn-sm">
                    <Briefcase size={14} /> Browse Opportunities
                  </Link>
                  <Link to={`/profile/${currentUser?.uid}`} className="btn btn-secondary btn-sm">
                    <User size={14} /> Edit Profile
                  </Link>
                </div>
              </div>


            </div>
          )}

          {activeTab === 'upload' && (
            <AchievementUpload onUploaded={(ach) => setAchievements((prev) => [ach, ...prev])} />
          )}

          {activeTab === 'applications' && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>My Applications</h2>
              {applications.length === 0 ? (
                <div className="empty-state">
                  <Briefcase size={48} />
                  <h3>No applications yet</h3>
                  <p>Browse the opportunity board and apply to get started!</p>
                  <Link to="/opportunities" className="btn btn-primary">Browse Opportunities</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {applications.map((app) => (
                    <div key={app.id} className="glass-card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>{app.opportunityTitle}</h3>
                        <span className={`badge ${STATUS_CLASS[app.status]}`} style={{ textTransform: 'capitalize' }}>{app.status}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 8 }}>{app.message?.slice(0, 120)}...</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        Applied: {formatDate(app.createdAt)}
                      </p>
                      {app.resumeURL && (
                        <a href={app.resumeURL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ExternalLink size={12} /> View Resume
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>Messages</h2>
              {messages.length === 0 ? (
                <div className="empty-state">
                  <MessageCircle size={48} />
                  <h3>No messages yet</h3>
                  <p>When organizations reach out to you, their messages will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {messages.map((msg) => (
                    <div key={msg.id} className="glass-card" style={{ padding: 20, borderLeft: msg.type === 'hire' ? '4px solid var(--color-success)' : msg.type === 'reject' ? '4px solid var(--color-danger)' : '4px solid var(--color-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--gradient-primary)' }}>
                          {msg.senderPhoto ? <img src={msg.senderPhoto} alt="" className="avatar avatar-sm" /> : getInitials(msg.senderName)}
                        </div>
                        <div>
                          <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>{msg.senderName}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
