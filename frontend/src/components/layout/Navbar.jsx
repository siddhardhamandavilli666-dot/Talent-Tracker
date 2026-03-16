import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Zap, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  const getDashboardPath = () => {
    if (!userProfile) return '/';
    switch (userProfile.role) {
      case 'student': return '/dashboard/student';
      case 'organization': return '/dashboard/organization';
      case 'admin': return '/dashboard/admin';
      default: return '/';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getNavLinks = () => {
    if (!userProfile) return [];
    
    if (userProfile.role === 'organization') {
      return [{ label: 'Discover Talents', path: '/discover' }];
    }
    
    if (userProfile.role === 'student') {
      return [{ label: 'Opportunities', path: '/opportunities' }];
    }

    if (userProfile.role === 'admin') {
      return [
        { label: 'Discover Talents', path: '/discover' },
        { label: 'Opportunities', path: '/opportunities' },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Zap size={18} fill="white" />
          </div>
          <span className="navbar-logo-text">TalentTrack</span>
        </Link>

        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-auth">
          {currentUser ? (
            <div className="navbar-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="avatar avatar-sm">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="avatar" className="avatar avatar-sm" />
                ) : (
                  getInitials(userProfile?.displayName)
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="navbar-username" style={{ lineHeight: 1 }}>{userProfile?.displayName?.split(' ')[0]}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{userProfile?.role}</span>
              </div>
              <ChevronDown size={14} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />

              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <Link to={getDashboardPath()} className="dropdown-item">
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  {userProfile.role === 'student' && (
                    <Link to={`/profile/${currentUser.uid}`} className="dropdown-item">
                      <User size={15} /> My Profile
                    </Link>
                  )}
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item dropdown-logout">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        <button className="navbar-hamburger" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div className="navbar-mobile">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className="mobile-link">
              {link.label}
            </Link>
          ))}
          {currentUser ? (
            <>
              <Link to={getDashboardPath()} className="mobile-link">Dashboard</Link>
              <button onClick={handleLogout} className="mobile-link mobile-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link">Log In</Link>
              <Link to="/signup" className="btn btn-primary w-full">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
