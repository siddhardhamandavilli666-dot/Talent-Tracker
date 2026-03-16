import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Briefcase, Users, LayoutDashboard, Search, CheckCircle, X, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { opportunityService } from '../../services/opportunityService';
import { applicationService } from '../../services/applicationService';
import { messageService } from '../../services/messageService';
import toast from 'react-hot-toast';

const STATUS_CLASS = { pending: 'status-pending', accepted: 'status-accepted', rejected: 'status-rejected', shortlisted: 'status-shortlisted' };
const CATEGORIES = ['internship', 'competition', 'scholarship', 'volunteering', 'job', 'other'];

const OrgDashboard = () => {
  const { userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setTab = (tab) => setSearchParams({ tab });

  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);


  const [postForm, setPostForm] = useState({ title: '', description: '', category: '', deadline: '', location: '', eligibility: '' });
  const [posting, setPosting] = useState(false);

  const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  useEffect(() => {
    setOpportunities([]);
  }, [userProfile]);

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const opp = await opportunityService.create(postForm);
      toast.success('Opportunity posted!');
      setOpportunities((prev) => [opp, ...prev]);
      setPostForm({ title: '', description: '', category: '', deadline: '', location: '', eligibility: '' });
      setTab('opportunities');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleViewApplicants = async (opp) => {
    setSelectedOpp(opp);
    setLoadingApplicants(true);
    setTab('applicants');
    try {
      setApplicants([]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateStatus = async (appId, status, studentId) => {
    try {
      await applicationService.updateStatus(appId, status);
      
      if (status === 'accepted') {
        await messageService.sendMessage({
          receiverId: studentId,
          content: `Congratulations! You are hired.\nWe were very impressed by your profile and achievements.\nCheck your email for the next steps!`,
          type: 'hire'
        });
      } else if (status === 'rejected') {
        await messageService.sendMessage({
          receiverId: studentId,
          content: `Sorry, your application is rejected.\nKeep exploring more opportunities on the platform.\nBest of luck with your future endeavors!`,
          type: 'reject'
        });
      }

      setApplicants((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
      toast.success(status === 'accepted' ? 'Student Hired!' : `Application ${status}!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const TABS = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { key: 'post', label: 'Post Opportunity', icon: <Plus size={16} /> },
    { key: 'opportunities', label: 'My Opportunities', icon: <Briefcase size={16} /> },
    { key: 'applicants', label: 'Applicants', icon: <Users size={16} /> },
    { key: 'discover', label: 'Discover Talent', icon: <Search size={16} /> },
  ];

  return (
    <div className="page">
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div style={{ marginBottom: 20, padding: '0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className="avatar avatar-md" style={{ background: 'var(--gradient-primary)' }}>
                {getInitials(userProfile?.displayName)}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{userProfile?.displayName}</p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Organization</p>
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
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>
                Welcome, {userProfile?.displayName}! 🏢
              </h2>
              <div className="grid grid-3" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                  <div><div className="stat-value">0</div><div className="stat-label">Active Posts</div></div>
                  <div className="stat-icon"><Briefcase size={22} /></div>
                </div>
                <div className="stat-card">
                  <div><div className="stat-value">0</div><div className="stat-label">Total Applications</div></div>
                  <div className="stat-icon"><Users size={22} /></div>
                </div>
              </div>
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 600, marginBottom: 14 }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => setTab('post')}><Plus size={16} /> Post Opportunity</button>
                  <Link to="/discover" className="btn btn-secondary"><Search size={16} /> Discover Students</Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'post' && (
            <div style={{ maxWidth: 640 }}>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>Post an Opportunity</h2>
              <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" placeholder="e.g., Summer Tech Internship 2024" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} required>
                      <option value="">Select...</option>
                      {CATEGORIES.map((c) => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deadline *</label>
                    <input type="date" className="form-input" value={postForm.deadline} onChange={(e) => setPostForm({ ...postForm, deadline: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-input" placeholder="e.g., Mumbai / Remote" value={postForm.location} onChange={(e) => setPostForm({ ...postForm, location: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea className="form-textarea" rows={5} placeholder="Describe the opportunity..." value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Eligibility *</label>
                  <textarea className="form-textarea" rows={2} placeholder="Who can apply?" value={postForm.eligibility} onChange={(e) => setPostForm({ ...postForm, eligibility: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={posting}>{posting ? 'Posting...' : '🚀 Post Opportunity'}</button>
              </form>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>My Opportunities</h2>
              {opportunities.length === 0 ? (
                <div className="empty-state">
                  <Briefcase size={48} />
                  <h3>No opportunities posted yet</h3>
                  <button className="btn btn-primary" onClick={() => setTab('post')}>Post Your First Opportunity</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="glass-card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <h3 style={{ fontWeight: 700 }}>{opp.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: 4 }}>
                          {opp.applicationsCount || 0} application{opp.applicationsCount !== 1 ? 's' : ''} · Deadline: {new Date(opp.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleViewApplicants(opp)}>
                        <Users size={14} /> View Applicants
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'applicants' && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 8 }}>
                {selectedOpp ? `Applicants — ${selectedOpp.title}` : 'Select an opportunity to view applicants'}
              </h2>
              {selectedOpp && (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 24 }}>{applicants.length} application{applicants.length !== 1 ? 's' : ''} received</p>
              )}
              {loadingApplicants ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
              ) : applicants.length === 0 && selectedOpp ? (
                <div className="empty-state"><Users size={48} /><h3>No applicants yet</h3></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {applicants.map((app) => (
                    <div key={app.id} className="glass-card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="avatar avatar-sm" style={{ background: 'var(--gradient-primary)' }}>
                            {app.studentPhotoURL ? <img src={app.studentPhotoURL} alt="" className="avatar avatar-sm" /> : getInitials(app.studentName)}
                          </div>
                          <div>
                            <Link to={`/profile/${app.studentId}`} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{app.studentName}</Link>
                            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{app.studentEmail}</p>
                          </div>
                        </div>
                        <span className={`badge ${STATUS_CLASS[app.status]}`} style={{ textTransform: 'capitalize' }}>{app.status}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 12 }}>{app.message?.slice(0, 200)}...</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {app.status !== 'accepted' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(app.id, 'accepted', app.studentId)} style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
                            <CheckCircle size={13} /> Hire
                          </button>
                        )}
                        {app.status !== 'shortlisted' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(app.id, 'shortlisted', app.studentId)} style={{ color: 'var(--color-info)', borderColor: 'var(--color-info)' }}>
                            <Clock size={13} /> Shortlist
                          </button>
                        )}
                        {app.status !== 'rejected' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(app.id, 'rejected', app.studentId)}>
                            <X size={13} /> Reject
                          </button>
                        )}
                        {app.resumeURL && (
                          <a href={app.resumeURL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                            📄 Resume
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'discover' && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>Discover Talent</h2>
              <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
                <Users size={48} style={{ color: 'var(--color-primary-light)', marginBottom: 16 }} />
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Search and discover talented students on the Talent Discovery page.</p>
                <Link to="/discover" className="btn btn-primary btn-lg"><Search size={18} /> Browse All Students</Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrgDashboard;
