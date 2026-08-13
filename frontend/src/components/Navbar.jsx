import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'teacher': return '/teacher/dashboard';
      default: return '/student/dashboard';
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        {/* Left: Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="navbar-logo-icon">
            <img src="/logo.png" alt="Fosselat Academy" />
          </div>
          <div className="navbar-logo-text">
            <span className="navbar-logo-name">Fosselat</span>
            <span className="navbar-logo-tagline">Islamic Qur'an School</span>
          </div>
        </Link>

        {/* Center: Nav Links */}
        <button 
          className={`navbar-toggle ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          <ul className="navbar-links">
            <li><NavLink to="/" onClick={closeMenu} end>Home</NavLink></li>
            <li><NavLink to="/curriculum" onClick={closeMenu}>Curriculum</NavLink></li>
            <li><NavLink to="/placement-tests" onClick={closeMenu}>Placement Tests</NavLink></li>
            {user?.role !== 'teacher' && <li><NavLink to="/pricing" onClick={closeMenu}>Pricing</NavLink></li>}
            <li><NavLink to="/about" onClick={closeMenu}>About Us</NavLink></li>
            <li><NavLink to="/contact" onClick={closeMenu}>Contact</NavLink></li>
          </ul>
        </div>

        {/* Right: Auth (always visible, outside menu) */}
        <div className="navbar-auth">
          {user ? (
            <div className="navbar-user-menu">
              <Link to={getDashboardLink()} className="navbar-user-btn" onClick={closeMenu}>
                <span className="navbar-user-avatar">
                  {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <span className="navbar-user-name">{user.full_name}</span>
              </Link>
              <button className="navbar-logout-btn" onClick={() => { logout(); closeMenu(); }}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn" onClick={closeMenu}>
              Login
            </Link>
          )}
        </div>

        <div 
          className={`navbar-overlay ${isOpen ? 'visible' : ''}`}
          onClick={closeMenu}
        />
      </div>
    </nav>
  );
}
