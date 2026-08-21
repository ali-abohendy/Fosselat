import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, Facebook, Instagram, Tiktok, ArrowRight, ArrowLeft } from './Icons';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = ['/admin', '/teacher', '/student'].some(p => location.pathname.startsWith(p));

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
      <div className="navbar-inner">
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
          <div className="navbar-mobile-logo">
            <Link to="/" className="navbar-logo" onClick={closeMenu}>
              <div className="navbar-logo-icon">
                <img src="/logo.png" alt="Fosselat Academy" />
              </div>
              <div className="navbar-logo-text">
                <span className="navbar-logo-name">Fosselat</span>
                <span className="navbar-logo-tagline">Islamic Qur'an School</span>
              </div>
            </Link>
          </div>
          <ul className="navbar-links">
            <li>
              <NavLink to="/" onClick={closeMenu} end>
                {user && isDashboard ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowLeft size={14} /> Main Site
                  </span>
                ) : 'Home'}
              </NavLink>
            </li>
            {user && <li><NavLink to={getDashboardLink()} onClick={closeMenu}>Dashboard</NavLink></li>}
            <li><NavLink to="/curriculum" onClick={closeMenu}>Curriculum</NavLink></li>
            {(!user || user.role === 'student') && (
              <li><NavLink to="/placement-tests" onClick={closeMenu}>{user ? 'Tests' : 'Placement Tests'}</NavLink></li>
            )}
            {user?.role !== 'teacher' && <li><NavLink to="/pricing" onClick={closeMenu}>Pricing</NavLink></li>}
            <li><NavLink to="/about" onClick={closeMenu}>About Us</NavLink></li>
            {user?.role !== 'admin' && (
              <li><NavLink to="/contact" onClick={closeMenu}>{user ? 'Support' : 'Contact'}</NavLink></li>
            )}
          </ul>

          <div className="navbar-mobile-footer">
            {!user && (
              <a 
                href="https://wa.me/966595796177?text=Assalam%20alikom%20warahmatuallah%20wabarakatu.%20I%20want%20to%20book%20a%20Free%20trial%20lesson,%20please." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="navbar-mobile-cta"
                onClick={closeMenu}
              >
                Book a Free Trial
              </a>
            )}
            <div className="navbar-mobile-contact">
              <a href="https://wa.me/966595796177" target="_blank" rel="noopener noreferrer">
                <Phone size={16} />
                +966 59 579 6177
              </a>
              <a href="mailto:info@fosselatacademy.com">
                <Mail size={16} />
                info@fosselatacademy.com
              </a>
            </div>
            <div className="navbar-mobile-socials">
              <a href="https://www.facebook.com/profile.php?id=61590983983531" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={22} />
              </a>
              <a href="https://www.instagram.com/fosselatacademy2001/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={22} />
              </a>
              <a href="https://www.tiktok.com/@user4744086184577?lang=en" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <Tiktok size={22} />
              </a>
            </div>
          </div>
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
