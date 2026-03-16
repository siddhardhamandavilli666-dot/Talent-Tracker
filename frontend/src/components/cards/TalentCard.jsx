import { Link } from 'react-router-dom';
import { MapPin, Award, Star, CheckCircle } from 'lucide-react';

const CATEGORY_COLORS = {
  sports: 'badge-secondary',
  music: 'badge-info',
  design: 'badge-primary',
  leadership: 'badge-warning',
  volunteering: 'badge-success',
  technical: 'badge-primary',
  academic: 'badge-success',
  other: 'badge-secondary',
};

const TalentCard = ({ student }) => {
  const {
    uid, displayName, photoURL, college, location: loc,
    skills = [], achievementsCount = 0, bio, verified,
  } = student;

  const getInitials = (name) =>
    name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <Link to={`/profile/${uid}`} className="talent-card glass-card animate-fadeInUp" style={{ textDecoration: 'none', display: 'block', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        <div
          className="avatar avatar-md"
          style={{ flexShrink: 0, fontSize: '20px', background: 'var(--gradient-primary)' }}
        >
          {photoURL ? (
            <img src={photoURL} alt={displayName} className="avatar avatar-md" />
          ) : (
            getInitials(displayName)
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, truncate: true, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </h3>
            {verified && (
              <CheckCircle size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            )}
          </div>
          {college && (
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {college}
            </p>
          )}
        </div>
      </div>

      {bio && (
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {bio}
        </p>
      )}

      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {skills.slice(0, 4).map((skill, i) => (
            <span key={i} className="badge badge-primary" style={{ fontSize: '11px' }}>{skill}</span>
          ))}
          {skills.length > 4 && (
            <span className="badge" style={{ fontSize: '11px', background: 'var(--bg-glass)', color: 'var(--text-muted)' }}>
              +{skills.length - 4}
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--bg-glass-border)' }}>
        {loc ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
            <MapPin size={12} />
            {loc}
          </div>
        ) : <div />}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
          <Award size={13} />
          {achievementsCount} achievement{achievementsCount !== 1 ? 's' : ''}
        </div>
      </div>
    </Link>
  );
};

export default TalentCard;
