import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Github, Linkedin, Globe, MapPin, GraduationCap, CheckCircle, Save, X } from 'lucide-react';
import { userService } from '../../services/userService';
import { achievementService } from '../../services/achievementService';
import AchievementGallery from '../../components/gallery/AchievementGallery';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const isOwner = currentUser?.uid === id;

  useEffect(() => {
    setLoading(true);
    setError(null);

    userService.getProfile(id)
      .then((profileData) => {
        setProfile(profileData);
        setEditForm({
          displayName: profileData.displayName || '',
          college: profileData.college || '',
          location: profileData.location || '',
          bio: profileData.bio || '',
          skills: profileData.skills || [],
          portfolioLinks: profileData.portfolioLinks || { github: '', linkedin: '', website: '' },
        });
      })
      .catch((err) => {
        const msg = err.message || 'Failed to load profile';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));

    achievementService.getByUser(id)
      .then((achData) => setAchievements(achData))
      .catch(() => {
        setAchievements([]);
      });
  }, [id, currentUser, userProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile(id, editForm);
      setProfile(updated);
      await refreshProfile();
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !editForm.skills.includes(s)) {
      setEditForm({ ...editForm, skills: [...editForm.skills, s] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setEditForm({ ...editForm, skills: editForm.skills.filter((s) => s !== skill) });
  };

  const handleDeleteAchievement = async (achId) => {
    if (!window.confirm('Remove this achievement?')) return;
    try {
      await achievementService.delete(achId);
      setAchievements(achievements.filter((a) => a.id !== achId));
      toast.success('Achievement removed');
    } catch (err) {
      toast.error(err.message);
    }
  };



  const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (error || !profile) return (
    <div className="page">
      <div className="container empty-state">
        <span style={{ fontSize: 48 }}>😕</span>
        <h3>Profile not found</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'This profile does not exist.'}</p>
        <a href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Go Home</a>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="avatar avatar-xl" style={{ background: 'var(--gradient-primary)', fontSize: 40, flexShrink: 0 }}>
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="avatar avatar-xl" />
              ) : getInitials(profile.displayName)}
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                {editing ? (
                  <input
                    className="form-input" value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}
                  />
                ) : (
                  <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{profile.displayName}</h1>
                )}
                {profile.verified && <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />}
                <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{profile.role}</span>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                {editing ? (
                  <>
                    <input className="form-input" placeholder="College" value={editForm.college} onChange={(e) => setEditForm({ ...editForm, college: e.target.value })} style={{ maxWidth: 200 }} />
                    <input className="form-input" placeholder="Location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} style={{ maxWidth: 200 }} />
                  </>
                ) : (
                  <>
                    {profile.college && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><GraduationCap size={14} />{profile.college}</span>}
                    {profile.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} />{profile.location}</span>}
                  </>
                )}
              </div>

              {editing ? (
                <textarea className="form-textarea" placeholder="Write your bio..." value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} />
              ) : (
                profile.bio && <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{profile.bio}</p>
              )}

              {editing ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  {['github', 'linkedin', 'website'].map((key) => (
                    <input key={key} className="form-input" placeholder={`${key} URL`} value={editForm.portfolioLinks[key]}
                      onChange={(e) => setEditForm({ ...editForm, portfolioLinks: { ...editForm.portfolioLinks, [key]: e.target.value } })}
                      style={{ maxWidth: 220 }} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                  {profile.portfolioLinks?.github && <a href={profile.portfolioLinks.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Github size={14} />GitHub</a>}
                  {profile.portfolioLinks?.linkedin && <a href={profile.portfolioLinks.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Linkedin size={14} />LinkedIn</a>}
                  {profile.portfolioLinks?.website && <a href={profile.portfolioLinks.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={14} />Website</a>}
                </div>
              )}
            </div>

            {isOwner ? (
              <div style={{ display: 'flex', gap: 8 }}>
                {editing ? (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Save size={14} />{saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <X size={14} />Cancel
                    </button>
                  </>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Edit2 size={14} />Edit Profile
                  </button>
                )}
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(editing ? editForm.skills : profile.skills || []).map((skill, i) => (
                <span key={i} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {skill}
                  {editing && <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }}>×</button>}
                </span>
              ))}
              {editing && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="form-input" placeholder="Add skill..." value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} style={{ width: 140 }} />
                  <button className="btn btn-secondary btn-sm" onClick={addSkill}>Add</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
              Achievements <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-lg)', fontWeight: 400 }}>({achievements.length})</span>
            </h2>
            {isOwner && (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/student?tab=upload')}>
                + Upload Achievement
              </button>
            )}
          </div>
          <AchievementGallery achievements={achievements} onDelete={handleDeleteAchievement} canDelete={isOwner} />
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
