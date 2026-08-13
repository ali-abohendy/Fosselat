import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

import API from '../../config.js';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

export default function StudentReview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    document.title = 'Review Session — Fosselat';
    fetch(`${API}/sessions/${sessionId}`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setSession(d.data); })
      .catch(() => {});
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!rating) { setAlert({ type: 'error', msg: 'Please select a rating' }); return; }
    try {
      const r = await fetch(`${API}/reviews`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ session_id: sessionId, rating, comment }),
      });
      const d = await r.json();
      if (d.success) {
        setAlert({ type: 'success', msg: 'Review submitted! Redirecting...' });
        setTimeout(() => navigate('/student/dashboard'), 2000);
      } else setAlert({ type: 'error', msg: d.message || 'Error' });
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
  };

  return (
    <>
      <div className="dash-page-header">
        <h2>Review Session</h2>
        <p>Share your feedback about this session</p>
      </div>
      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      {session && (
        <div className="dash-form-container" style={{ marginBottom: '24px' }}>
          <h3>Session Details</h3>
          <div className="dash-form-grid">
            <div className="dash-form-group">
              <label>Date</label>
              <input value={session.date?.split('T')[0] || ''} readOnly style={{ opacity: 0.7 }} />
            </div>
            <div className="dash-form-group">
              <label>Teacher</label>
              <input value={session.teacher_name || ''} readOnly style={{ opacity: 0.7 }} />
            </div>
            <div className="dash-form-group">
              <label>Subject</label>
              <input value={session.subject || ''} readOnly style={{ opacity: 0.7 }} />
            </div>
            <div className="dash-form-group">
              <label>Duration</label>
              <input value={session.duration || ''} readOnly style={{ opacity: 0.7 }} />
            </div>
          </div>
        </div>
      )}

      <div className="dash-form-container">
        <h3>Your Review</h3>
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }}>How was your experience?</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)}
                style={{
                  fontSize: '36px', background: 'none', border: 'none', cursor: 'pointer',
                  filter: n <= rating ? 'grayscale(0%)' : 'grayscale(100%)',
                  opacity: n <= rating ? 1 : 0.4, transition: 'all 0.2s',
                }}>⭐</button>
            ))}
          </div>
        </div>
        <div className="dash-form-grid">
          <div className="dash-form-group full-width">
            <label>Comment (optional)</label>
            <textarea rows="4" value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts..." />
          </div>
          <div className="dash-form-actions">
            <Button variant="primary" onClick={handleSubmit} disabled={!rating}>Submit Review</Button>
            <Button variant="outline" onClick={() => navigate('/student/dashboard')}>Cancel</Button>
          </div>
        </div>
      </div>
    </>
  );
}
