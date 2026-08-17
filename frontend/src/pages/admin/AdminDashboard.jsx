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
  
  const getMonths = () => {
    const months = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      months.push(new Date(d.getFullYear(), d.getMonth() - i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }
    return months;
  };
  const monthOptions = getMonths();
  const [period, setPeriod] = useState(monthOptions[0]);

  useEffect(() => {
    document.title = 'Admin Dashboard — Fosselat';
    fetch(`${API}/admin/dashboard?period=${period}`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, [period]);

  const cards = [
    { icon: 'Students', label: 'Active Students', value: stats.active_students },
    { icon: 'Teachers', label: 'Active Teachers', value: stats.active_teachers },
    { icon: 'Time', label: 'Teaching Hours', value: stats.teaching_hours },
    { icon: 'Sessions', label: 'Total Sessions', value: stats.total_sessions },
    { icon: 'Present', label: 'Present Times', value: stats.present_times },
    { icon: 'Absent', label: 'Absent Times', value: stats.absent_times },
    { icon: 'Due', label: 'Total Due', value: `$${stats.total_due}` },
    { icon: 'Paid', label: 'Total Paid', value: `$${stats.total_paid}` },
    { icon: 'Payroll', label: 'Total Payroll', value: `$${stats.total_payroll}` },
    { icon: 'Remaining', label: 'Remaining', value: `$${stats.remaining || 0}` },
    { icon: 'Revenue', label: 'Revenue', value: `$${stats.revenue !== undefined ? stats.revenue : stats.balance}` },
  ];

  return (
    <>
      <div className="dash-page-header">
        <h2>Admin Dashboard</h2>
        <p>Overview of Fosselat Academy</p>
      </div>
      
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap'}}>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ width: '100%', maxWidth: '200px', padding: '8px 12px', background: 'transparent', border: '1px solid rgba(200,167,99,0.3)', color: 'var(--color-cream)', borderRadius: '6px' }}
        >
          {monthOptions.map(m => <option key={m} value={m} style={{ color: '#000' }}>{m}</option>)}
        </select>
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
