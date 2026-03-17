import { Link } from 'react-router-dom';
import { Zap, Search, Trophy, Users, ArrowRight, Star, Shield, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const STATS = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Organizations' },
  { value: '25K+', label: 'Achievements' },
  { value: '3K+', label: 'Opportunities' },
];

const FEATURES = [
  {
    icon: <Trophy size={28} />,
    title: 'Showcase Achievements',
    desc: 'Upload certificates, photos, videos, and competition results. Build a stunning talent portfolio.',
    gradient: 'linear-gradient(135deg, #6C63FF, #FF6B9D)',
  },
  {
    icon: <Search size={28} />,
    title: 'Talent Discovery',
    desc: 'Organizations find exceptional students by skill, college, and location. Advanced search filters.',
    gradient: 'linear-gradient(135deg, #00D4AA, #6C63FF)',
  },
  {
    icon: <Globe size={28} />,
    title: 'Opportunity Board',
    desc: 'Internships, scholarships, competitions — all in one place. Apply with one click.',
    gradient: 'linear-gradient(135deg, #FF6B9D, #FFB547)',
  },
  {
    icon: <Shield size={28} />,
    title: 'Verified Profiles',
    desc: 'Admin-verified student profiles build trust with organizations and recruiters.',
    gradient: 'linear-gradient(135deg, #57C7FF, #00D4AA)',
  },
];

const CATEGORIES = [
  { emoji: '🏆', name: 'Sports' },
  { emoji: '🎵', name: 'Music' },
  { emoji: '🎨', name: 'Design' },
  { emoji: '👑', name: 'Leadership' },
  { emoji: '🤝', name: 'Volunteering' },
  { emoji: '💻', name: 'Technical' },
  { emoji: '📚', name: 'Academic' },
  { emoji: '⭐', name: 'More' },
];

const Home = () => {
  const { currentUser, userProfile } = useAuth();

  const getDashboardPath = () => {
    if (!userProfile) return '/'; // Removed /discover redirect
    const map = { student: '/dashboard/student', organization: '/dashboard/organization', admin: '/dashboard/admin' };
    return map[userProfile.role] || '/';
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-bg">
          <div className="glow-orb" style={{ width: 500, height: 500, background: '#6C63FF', top: -100, left: '20%' }} />
          <div className="glow-orb" style={{ width: 400, height: 400, background: '#FF6B9D', top: 200, right: '10%' }} />
          <div className="glow-orb" style={{ width: 300, height: 300, background: '#00D4AA', bottom: 0, left: '5%' }} />
        </div>

        <div className="container hero-content">
          <div className="hero-badge animate-fadeInUp">
            <Zap size={14} />
            <span>Discover Extraordinary Talent</span>
          </div>

          <h1 className="hero-title animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Where <span className="text-gradient">Talent</span> Meets<br />
            <span className="text-gradient">Opportunity</span>
          </h1>

          <p className="hero-subtitle animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Students showcase sports, music, design, and more. Organizations discover
            and hire exceptional young talent — beyond just academics.
          </p>

          <div className="hero-actions animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            {currentUser ? (
              userProfile?.role === 'organization' ? (
                <>
                  <Link to={getDashboardPath()} className="btn btn-primary btn-lg">
                    Manage Recruitment <ArrowRight size={18} />
                  </Link>
                  <button className="btn btn-secondary btn-lg" disabled title="Coming Soon">
                    Discover Talent
                  </button>
                </>
              ) : (
                <>
                  <Link to={getDashboardPath()} className="btn btn-primary btn-lg">
                    My Student Profile <ArrowRight size={18} />
                  </Link>
                  <button className="btn btn-secondary btn-lg" disabled title="Coming Soon">
                    Browse Opportunities
                  </button>
                </>
              )
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Log In to Explore
                </Link>
              </>
            )}
          </div>

          <div className="hero-stats animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            {STATS.map((s) => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--bg-glass-border)', borderBottom: '1px solid var(--bg-glass-border)' }}>
        <div className="container">
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Talent Categories
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="category-pill" style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 800, textAlign: 'center', marginBottom: '16px' }}>
              Everything you need to <span className="text-gradient">shine</span>
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)', maxWidth: '600px', margin: '0 auto 60px' }}>
              A complete platform for students to showcase talent and for organizations to find their next star.
            </p>
          </div>

          <div className="grid grid-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card glass-card">
                <div className="feature-icon" style={{ background: f.gradient }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="cta-card">
            <div className="glow-orb" style={{ width: 300, height: 300, background: '#6C63FF', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <h2 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 800, marginBottom: '16px' }}>
                Ready to showcase your talent?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)', marginBottom: '32px' }}>
                Join thousands of students already building their talent profiles.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Join as Student <ArrowRight size={18} />
                </Link>
                <Link to="/signup?role=organization" className="btn btn-secondary btn-lg">
                  Join as Organization
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '32px 0', borderTop: '1px solid var(--bg-glass-border)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
          © 2024 TalentTrack Platform. Empowering talent, connecting opportunities.
        </p>
      </footer>
    </div>
  );
};

export default Home;
