import { Link } from 'react-router-dom';
import { MapPin, Calendar, Building2, ArrowRight } from 'lucide-react';

const CATEGORY_STYLES = {
  internship:   { class: 'badge-primary', label: 'Internship' },
  competition:  { class: 'badge-secondary', label: 'Competition' },
  scholarship:  { class: 'badge-success', label: 'Scholarship' },
  volunteering: { class: 'badge-info', label: 'Volunteering' },
  job:          { class: 'badge-warning', label: 'Job' },
  other:        { class: 'badge-secondary', label: 'Other' },
};

const OpportunityCard = ({ opportunity, isApplied }) => {
  const { id, title, orgName, category, deadline, location: loc, description, eligibility } = opportunity;
  const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.other;

  const isDeadlineSoon = () => {
    const d = new Date(deadline);
    const diff = (d - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="glass-card animate-fadeInUp" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <span className={`badge ${catStyle.class}`} style={{ marginBottom: '8px' }}>{catStyle.label}</span>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, lineHeight: 1.3 }}>{title}</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {isApplied && (
            <span className="badge badge-success" style={{ flexShrink: 0 }}>✅ Applied</span>
          )}
          {isDeadlineSoon() && (
            <span className="badge badge-error" style={{ flexShrink: 0 }}>Closing Soon</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
        <Building2 size={14} />
        <span>{orgName}</span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {description}
      </p>

      {eligibility && (
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Eligibility: {eligibility}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--bg-glass-border)' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          {loc && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
              <MapPin size={12} />{loc}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isDeadlineSoon() ? 'var(--color-error)' : 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
            <Calendar size={12} />Deadline: {formatDate(deadline)}
          </span>
        </div>
        <Link to={`/opportunities/${id}`} className={`btn ${isApplied ? 'btn-secondary' : 'btn-primary'} btn-sm`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isApplied ? 'View Status' : 'View'} <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

export default OpportunityCard;
