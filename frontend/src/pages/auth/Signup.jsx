import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Zap, GraduationCap, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') || 'student');
  const [form, setForm] = useState({ displayName: '', email: '', password: '', college: '', location: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await signup(form.email, form.password, form.displayName, role, {
        college: form.college, location: form.location,
      });
      toast.success('Account created! Welcome to TalentTrack 🎉');
      navigate(role === 'student' ? '/dashboard/student' : '/dashboard/organization');
    } catch (err) {
      setError(err.message.includes('email-already-in-use') ? 'Email already in use.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle(role);
      toast.success('Welcome to TalentTrack! 🎉');
      navigate(role === 'student' ? '/dashboard/student' : '/dashboard/organization');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-up failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', icon, placeholder) => (
    <div className="form-group" key={name}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</span>
        <input
          type={name === 'password' ? (showPass ? 'text' : 'password') : type}
          name={name} value={form[name]} onChange={handleChange}
          className="form-input" placeholder={placeholder} required={['displayName','email','password'].includes(name)}
          style={{ paddingLeft: 36 }}
        />
        {name === 'password' && (
          <button type="button" onClick={() => setShowPass(!showPass)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="glow-orb" style={{ width: 500, height: 500, background: '#6C63FF', top: '-10%', right: '-10%' }} />
      <div className="glow-orb" style={{ width: 300, height: 300, background: '#00D4AA', bottom: '5%', left: '-5%' }} />

      <div className="auth-card glass-card animate-fadeInUp" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div style={{ width: 44, height: 44, background: 'var(--gradient-primary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: 'var(--shadow-glow)' }}>
            <Zap size={22} fill="white" color="white" />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 4 }}>Create account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Join TalentTrack for free</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { value: 'student', label: 'Student', icon: <GraduationCap size={18} />, sub: 'Showcase your talents' },
            { value: 'organization', label: 'Organization', icon: <Building2 size={18} />, sub: 'Discover talent' },
          ].map((r) => (
            <button key={r.value} type="button" onClick={() => setRole(r.value)}
              style={{
                padding: '14px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${role === r.value ? 'var(--color-primary)' : 'var(--bg-glass-border)'}`,
                background: role === r.value ? 'rgba(108,99,255,0.15)' : 'var(--bg-glass)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}>
              <span style={{ color: role === r.value ? 'var(--color-primary-light)' : 'var(--text-muted)' }}>{r.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: role === r.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{r.label}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.sub}</span>
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {field('displayName', role === 'student' ? 'Full Name' : 'Organization Name', 'text', <User size={16} />, role === 'student' ? 'Your full name' : 'Organization name')}
          {field('email', 'Email Address', 'email', <Mail size={16} />, 'you@example.com')}
          {field('password', 'Password', 'password', <Lock size={16} />, '••••••••')}
          {role === 'student' && field('college', 'College / University', 'text', <GraduationCap size={16} />, 'e.g. IIT Bombay')}
          {field('location', 'Location', 'text', <span style={{ fontSize: 14 }}>📍</span>, 'e.g. Mumbai, India')}

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or sign up with</span>
        </div>

        <button
          type="button"
          className="btn-google"
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google as {role === 'student' ? 'Student' : 'Organization'}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 20 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
