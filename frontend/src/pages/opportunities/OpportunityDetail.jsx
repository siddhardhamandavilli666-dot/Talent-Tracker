import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Building2, FileText, ArrowLeft, Send } from 'lucide-react';
import { opportunityService } from '../../services/opportunityService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_STYLES = {
  internship: 'badge-primary', competition: 'badge-secondary',
  scholarship: 'badge-success', volunteering: 'badge-info',
  job: 'badge-warning', other: 'badge-secondary',
};

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [message, setMessage] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    opportunityService.getById(id)
      .then(setOpp)
      .catch(() => toast.error('Opportunity not found'))
      .finally(() => setLoading(false));

    if (currentUser?.uid) {
      applicationService.getByStudent(currentUser.uid)
        .then((apps) => {
          const hasApplied = apps.some(a => {
            const match = String(a.opportunityId).trim() === String(id).trim();
            return match;
          });
          if (hasApplied) setApplied(true);
        })
    }
  }, [id, currentUser]);

  const handleApply = async () => {
    if (!message.trim() || message.length < 10) {
      toast.error('Please write a message (min 10 characters).');
      return;
    }
    setApplying(true);
    try {
      await applicationService.apply({ opportunityId: id, message }, resumeFile);
      toast.success('Application submitted successfully!');
      setApplied(true);
      setShowApplyModal(false);
      
      setTimeout(() => {
        navigate('/dashboard/student?tab=applications');
      }, 3000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!opp) return <div className="page"><div className="container empty-state"><h3>Opportunity not found</h3></div></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={15} /> Back
        </button>

        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ marginBottom: 8 }}>
            <span className={`badge ${CATEGORY_STYLES[opp.category] || 'badge-secondary'}`} style={{ textTransform: 'capitalize' }}>{opp.category}</span>
          </div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 12 }}>{opp.title}</h1>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24, color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Building2 size={14} />{opp.orgName}</span>
            {opp.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={14} />{opp.location}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={14} />Deadline: {formatDate(opp.deadline)}</span>
          </div>

          <hr className="divider" />

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 10 }}>About this opportunity</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{opp.description}</p>
          </div>

          {opp.eligibility && (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 24 }}>
              <h4 style={{ marginBottom: 6, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eligibility</h4>
              <p style={{ color: 'var(--text-primary)' }}>{opp.eligibility}</p>
            </div>
          )}

          {userProfile?.role === 'student' && (
            applied ? (
              <div className="glass-card" style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.3)', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: 10 }}>✅</div>
                <h3 style={{ color: 'var(--color-success)', marginBottom: 8 }}>You have already applied!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  You can track your application status in your <Link to="/dashboard/student?tab=applications" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Student Dashboard</Link>.
                </p>
              </div>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={() => setShowApplyModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}>
                <Send size={18} /> Apply Now
              </button>
            )
          )}
        </div>
      </div>

      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 'var(--font-size-xl)' }}>Apply for {opp.title}</h2>
              <button onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Cover Message *</label>
                <textarea
                  className="form-textarea" rows={5}
                  placeholder="Tell the organization why you're a great fit..."
                  value={message} onChange={(e) => setMessage(e.target.value)}
                />
                <span className="text-xs text-muted">{message.length}/1000 chars</span>
              </div>

              <div className="form-group">
                <label className="form-label">Resume (PDF, optional)</label>
                <input type="file" accept=".pdf" className="form-input"
                  onChange={(e) => setResumeFile(e.target.files[0])} style={{ cursor: 'pointer' }} />
                {resumeFile && <span className="text-xs" style={{ color: 'var(--color-success)' }}>✓ {resumeFile.name}</span>}
              </div>

              <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetail;
