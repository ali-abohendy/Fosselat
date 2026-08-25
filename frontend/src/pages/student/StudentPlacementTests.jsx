import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { Trash, CheckCircle, BarChart, BookOpen, Clock } from '../../components/Icons';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

export default function StudentPlacementTests() {
  const [tests, setTests] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Tests — Student';
    fetch(`${API}/student/placement_tests`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setTests(d.data); })
      .catch(() => {});
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this test record?")) return;
    try {
      const r = await fetch(`${API}/student/placement_tests/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const d = await r.json();
      if (d.success) {
        setTests(tests.filter(t => t._id !== id));
      } else {
        alert(d.message || "Failed to delete test");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // --- STATS CALCULATION ---
  const totalTests = tests.length;
  const avgScore = totalTests > 0 ? Math.round(tests.reduce((acc, t) => {
    if (t.score) return acc + t.score;
    if (t.level_scores && t.level_scores.length > 0) {
      return acc + Math.round((t.level_scores.reduce((sum, ls) => sum + (ls.pct || 0), 0) / t.level_scores.length) * 100);
    }
    return acc;
  }, 0) / totalTests) : 0;
  
  // Calculate top program by tracking how many times they tested in each
  const programCounts = tests.reduce((acc, t) => {
    const p = t.program || 'Unknown';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  let topProgram = '-';
  let maxCount = 0;
  for (const [prog, count] of Object.entries(programCounts)) {
    if (count > maxCount) { maxCount = count; topProgram = prog; }
  }

  // --- LATEST PROGRESS (Best/Latest score per unique program) ---
  // The tests are sorted created_at desc from backend. We just take the first occurrence of each program.
  const latestProgress = [];
  const seenPrograms = new Set();
  for (const t of tests) {
    if (!seenPrograms.has(t.program)) {
      seenPrograms.add(t.program);
      latestProgress.push(t);
    }
  }

  return (
    <>
      <div className="dash-page-header">
        <h2>My Tests & Progress</h2>
        <p>Track your overall assessment results and history</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'var(--color-bg-light)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(200,167,99,0.15)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(200,167,99,0.1)', padding: '16px', borderRadius: '12px', color: 'var(--color-gold)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '4px' }}>Tests Completed</div>
              <div style={{ color: 'var(--color-cream)', fontSize: '24px', fontWeight: 'bold' }}>{totalTests}</div>
            </div>
          </div>
          
          <div style={{ background: 'var(--color-bg-light)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(200,167,99,0.15)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(200,167,99,0.1)', padding: '16px', borderRadius: '12px', color: 'var(--color-gold)' }}>
              <BarChart size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '4px' }}>Average Score</div>
              <div style={{ color: 'var(--color-cream)', fontSize: '24px', fontWeight: 'bold' }}>{avgScore}%</div>
            </div>
          </div>
          
          <div style={{ background: 'var(--color-bg-light)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(200,167,99,0.15)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(200,167,99,0.1)', padding: '16px', borderRadius: '12px', color: 'var(--color-gold)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '4px' }}>Top Program</div>
              <div style={{ color: 'var(--color-cream)', fontSize: '18px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }} title={topProgram}>{topProgram}</div>
            </div>
          </div>
        </div>

        {/* LATEST PROGRESS */}
        {latestProgress.length > 0 && (
          <div>
            <h3 style={{ color: 'var(--color-gold)', fontSize: '20px', marginBottom: '16px' }}>Current Progress Overview</h3>
            <div style={{ background: 'var(--color-bg-light)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(200,167,99,0.15)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {latestProgress.map(t => {
                const completed = t.highest_mastered_id || 0;
                const total = t.total_levels || 5;
                
                let progress = 0;
                if (t.level_scores && t.level_scores.length > 0) {
                  // Calculate progress explicitly from v4.1 level_scores
                  const masteredCount = t.level_scores.filter(ls => ls.mastered).length;
                  const unmastered = t.level_scores.find(ls => !ls.mastered);
                  const partial = unmastered ? (unmastered.pct || 0) : 0;
                  progress = Math.round(((masteredCount / total) * 100) + (partial * (1 / total) * 100));
                } else {
                  // Fallback for older tests
                  const completed = t.highest_mastered_id || 0;
                  const score = t.score || 0;
                  progress = Math.round(((completed / total) * 100) + ((score / 100) * (1 / total) * 100));
                }
                
                if (progress > 100) progress = 100;

                return (
                  <div key={`prog-${t._id}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '16px' }}>
                      <span style={{ color: 'var(--color-cream)', fontWeight: 600 }}>{t.track} — {t.program}</span>
                      <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>{progress}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-gold)', borderRadius: '4px', transition: 'width 1s ease-in-out' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TEST HISTORY */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--color-gold)', fontSize: '20px', margin: 0 }}>Test History</h3>
            <Button variant="primary" onClick={() => navigate('/placement-tests')} style={{ padding: '8px 16px', fontSize: '14px' }}>
              Take a Test
            </Button>
          </div>
          
          {tests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tests.map(t => (
                <div key={`hist-${t._id}`} style={{ background: 'var(--color-bg-light)', borderRadius: '10px', border: '1px solid rgba(200,167,99,0.1)', overflow: 'hidden' }}>
                  
                  {/* Row Header (Clickable) */}
                  <div 
                    onClick={() => toggleExpand(t._id)}
                    className="test-history-row"
                  >
                    <div className="test-history-info">
                      <div className="test-history-date">
                        <Clock size={16} color="var(--color-text-muted)" />
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>{new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ color: 'var(--color-gold)', fontSize: '14px', marginRight: '8px' }}>{t.track}</span>
                        <span style={{ color: 'var(--color-cream)', fontWeight: 500 }}>{t.program}</span>
                      </div>
                    </div>
                    
                      <div className="test-history-actions">
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-cream)' }}>
                          {t.score || (t.level_scores && t.level_scores.length > 0 ? Math.round((t.level_scores.reduce((sum, ls) => sum + (ls.pct || 0), 0) / t.level_scores.length) * 100) : 0)}%
                        </div>
                        <button 
                        onClick={(e) => handleDelete(t._id, e)}
                        style={{ background: 'transparent', border: 'none', color: 'rgba(255,50,50,0.6)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                        title="Delete Test"
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,50,50,1)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,50,50,0.6)'}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detailed Scores */}
                  {expandedId === t._id && t.level_scores && t.level_scores.length > 0 && (
                    <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Detailed Scores</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                        {t.level_scores.map((ls, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '10px 16px', borderRadius: '8px', fontSize: '14px' }}>
                            <span style={{ color: 'var(--color-cream)' }}>{ls.name || `Level ${ls.level}`}</span>
                            <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{Math.round(ls.pct * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* If expanded but no detailed scores */}
                  {expandedId === t._id && (!t.level_scores || t.level_scores.length === 0) && (
                    <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                      No detailed level breakdown available for this test.
                    </div>
                  )}

                </div>
              ))}
            </div>
          ) : (
            <div className="dash-alert dash-alert-info" style={{ background: 'rgba(200,167,99,0.06)', border: '1px solid rgba(200,167,99,0.15)', color: 'var(--color-text-muted)' }}>
              You haven't taken any tests yet. Take a placement test to see your history and progress here!
            </div>
          )}
        </div>
        
      </div>
    </>
  );
}
