import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, LogOutIcon } from './Icons';
import './DashboardLayout.css';

export default function DashboardLayout({ role, menuItems }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="dashboard-layout">
      {/* Mobile Header (visible only on mobile) */}
      <div className="mobile-dashboard-header">
        <NavLink to="/" className="sidebar-brand">
          <img src="/logo.png" alt="Fosselat Academy" />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Fosselat</span>
            <span className="sidebar-brand-tagline">Islamic Qur'an School</span>
          </div>
        </NavLink>
        <div className="mobile-header-actions">
          <NavLink to="/" className="mobile-action-btn" title="Back to Home">
            <HomeIcon size={20} />
          </NavLink>
          <button className="mobile-action-btn" onClick={handleLogout} title="Logout">
            <LogOutIcon size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo-container">
          <NavLink to="/" className="sidebar-brand">
            <img src="/logo.png" alt="Fosselat Academy" />
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Fosselat</span>
              <span className="sidebar-brand-tagline">Islamic Qur'an School</span>
            </div>
          </NavLink>
        </div>
        <div className="sidebar-header">
          <div className="sidebar-avatar">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <h4>{user?.full_name}</h4>
            <span className="sidebar-role-badge">{roleLabel}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              end={item.end}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/" className="sidebar-link sidebar-home-link">
            <span className="sidebar-icon" style={{ display: 'flex' }}><HomeIcon size={18} /></span>
            <span>Back to Home</span>
          </NavLink>
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-icon" style={{ display: 'flex' }}><LogOutIcon size={18} /></span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
