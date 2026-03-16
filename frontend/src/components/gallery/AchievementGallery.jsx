import { Trash2, FileText, Video, Image as ImageIcon } from 'lucide-react';

const CATEGORY_LABELS = {
  sports: '🏆 Sports', music: '🎵 Music', design: '🎨 Design',
  leadership: '👑 Leadership', volunteering: '🤝 Volunteering',
  technical: '💻 Technical', academic: '📚 Academic', other: '⭐ Other',
};

const AchievementCard = ({ achievement, onDelete, canDelete }) => {
  const { id, title, description, category, mediaURL, mediaType, date } = achievement;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '';

  const MediaIcon = mediaType === 'video' ? Video : mediaType === 'document' ? FileText : ImageIcon;

  return (
    <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {mediaURL && (
        <div style={{ aspectRatio: '16/9', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
          {mediaType === 'image' ? (
            <img src={mediaURL} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : mediaType === 'video' ? (
            <video src={mediaURL} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: 'var(--text-muted)' }}>
              <FileText size={40} />
              <a href={mediaURL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">View Document</a>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className="badge badge-primary" style={{ fontSize: '11px' }}>{CATEGORY_LABELS[category] || category}</span>
          {formatDate(date) && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{formatDate(date)}</span>
          )}
        </div>

        <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>{title}</h4>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {description}
        </p>

        {canDelete && (
          <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => onDelete(id)} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trash2 size={13} /> Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AchievementGallery = ({ achievements = [], onDelete, canDelete = false }) => {
  if (achievements.length === 0) {
    return (
      <div className="empty-state">
        <ImageIcon size={60} />
        <h3>No achievements yet</h3>
        <p>Upload your first achievement to start showcasing your talents!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-3">
      {achievements.map((a) => (
        <AchievementCard key={a.id} achievement={a} onDelete={onDelete} canDelete={canDelete} />
      ))}
    </div>
  );
};

export default AchievementGallery;
