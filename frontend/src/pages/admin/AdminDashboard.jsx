import { useState, useEffect } from 'react';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    active_students: 0, total_sessions: 0, total_due: 0,
    active_teachers: 0, inactive_teachers: 0, total_paid: 0,
    teaching_hours: 0, absent_times: 0, present_times: 0,
    balance: 0, total_payroll_le: 0, revenue: 0, remaining: 0
  });
  
  const [period, setPeriod] = useState('all_time');

  useEffect(() => {
    document.title = 'Admin Dashboard — Fosselat';
    fetch(`${API}/admin/dashboard?period=${period}`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, [period]);

  const cards = [
    { icon: 'Students', label: 'Active Students', value: stats.active_students },
    { icon: 'Sessions', label: 'Total Sessions', value: stats.total_sessions },
    { icon: 'Due', label: 'Total Due', value: `$${stats.total_due}` },
    { icon: 'Teachers', label: 'Active Teachers', value: stats.active_teachers },
    { icon: 'Inactive', label: 'Inactive Teachers', value: stats.inactive_teachers },
    { icon: 'Paid', label: 'Total Paid', value: `$${stats.total_paid}` },
    { icon: 'Time', label: 'Teaching Hours', value: stats.teaching_hours },
    { icon: 'Absent', label: 'Absent Times', value: stats.absent_times },
    { icon: 'Present', label: 'Present Times', value: stats.present_times },
    { icon: 'Revenue', label: 'Revenue', value: `$${stats.revenue !== undefined ? stats.revenue : stats.balance}` },
    { icon: 'Payroll', label: 'Total Payroll', value: `$${stats.total_payroll_le}` },
    { icon: 'Remaining', label: 'Remaining', value: `$${stats.remaining || 0}` },
  ];

  return (
    <>
      <div className="dash-page-header">
        <h2>Admin Dashboard</h2>
        <p>Overview of Fosselat Academy</p>
      </div>
      
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap'}}>
        {['this_month', 'last_month', 'this_year', 'all_time'].map(p => (
          <button 
            key={p}
            className={`dash-filter-btn ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `1px solid ${period === p ? 'var(--color-gold)' : 'rgba(200,167,99,0.3)'}`,
              background: period === p ? 'var(--color-gold)' : 'transparent',
              color: period === p ? '#000' : 'var(--color-gold)',
              cursor: 'pointer'
            }}
          >
            {p.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      <div className="dash-stats-grid">
        {cards.map((c, i) => (
          <div className="dash-stat-card" key={i}>
            <div className="stat-icon" style={{fontSize: '14px', fontWeight: 'bold'}}>{c.icon}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
