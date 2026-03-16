import { useState } from 'react';
import { Upload, X, Image, Video, FileText } from 'lucide-react';
import { achievementService } from '../../services/achievementService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../pages/auth/Auth.css';

const CATEGORIES = ['sports', 'music', 'design', 'leadership', 'volunteering', 'technical', 'academic', 'other'];

const AchievementUpload = ({ onUploaded }) => {
  const { userProfile } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', category: '', date: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.date) {
      toast.error('Fill all required fields.'); return;
    }
    setUploading(true);
    try {
      const achievement = await achievementService.upload(form, file);
      toast.success('Achievement uploaded successfully! 🎉');
      setForm({ title: '', description: '', category: '', date: '' });
      setFile(null); setPreview(null);
      if (onUploaded) onUploaded(achievement);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const FileIcon = file?.type?.startsWith('video/') ? Video : file?.type === 'application/pdf' ? FileText : Image;

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>Upload Achievement</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input name="title" className="form-input" placeholder="e.g. District Cricket Champion" value={form.title} onChange={handleChange} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="category" className="form-select" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input name="date" type="date" className="form-input" value={form.date} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea name="description" className="form-textarea" rows={3} placeholder="Describe your achievement..." value={form.description} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Media File (Image / Video / PDF)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('ach-file-input').click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--bg-glass-border)'}`,
              borderRadius: 'var(--radius-md)', padding: '32px 20px',
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
              background: dragOver ? 'rgba(108,99,255,0.08)' : 'var(--bg-glass)',
            }}>
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                {preview ? (
                  <img src={preview} alt="preview" style={{ maxHeight: 120, borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <FileIcon size={36} style={{ color: 'var(--color-primary-light)' }} />
                )}
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{file.name}</p>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <X size={13} /> Remove
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Drag & drop or click to upload</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>Images, videos, PDFs up to 50MB</p>
              </div>
            )}
          </div>
          <input id="ach-file-input" type="file" accept="image/*,video/*,.pdf" style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={uploading}>
          {uploading ? <><span className="spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Uploading...</> : <><Upload size={18} /> Upload Achievement</>}
        </button>
      </form>
    </div>
  );
};

export default AchievementUpload;
