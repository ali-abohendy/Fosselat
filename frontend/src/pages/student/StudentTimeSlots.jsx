import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import { Trash, ArrowRight, Plus } from '../../components/Icons';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StudentTimeSlots() {
  const [slots, setSlots] = useState(
    DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
  );
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    document.title = 'Time Slots — Student';
    fetch(`${API}/student/slots`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          const grouped = DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
          d.data.forEach(s => { if (grouped[s.day]) grouped[s.day].push(s); });
          setSlots(grouped);
        }
      })
      .catch(() => {});
  }, []);

  const addSlot = (day) => {
    setSlots(prev => ({
      ...prev,
      [day]: [...prev[day], { day, start_time: '09:00', end_time: '10:00' }],
    }));
  };

  const removeSlot = (day, idx) => {
    setSlots(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== idx),
    }));
  };

  const updateSlot = (day, idx, field, value) => {
    setSlots(prev => {
      const daySlots = [...prev[day]];
      const slot = { ...daySlots[idx], [field]: value };
      
      if (field === 'start_time') {
        const start = value;
        const end = slot.end_time;
        if (end <= start) {
          const [h, m] = start.split(':').map(Number);
          const nextH = (h + 1).toString().padStart(2, '0');
          slot.end_time = `${nextH}:${m.toString().padStart(2, '0')}`;
        }
      }
      
      daySlots[idx] = slot;
      return { ...prev, [day]: daySlots };
    });
  };

  const handleSave = async () => {
    setAlert(null);
    const allSlots = DAYS.flatMap(day => slots[day].map(s => ({ day, start_time: s.start_time, end_time: s.end_time })));
    try {
      const r = await fetch(`${API}/student/slots`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ slots: allSlots }) });
      const d = await r.json();
      if (d.success) setAlert({ type: 'success', msg: 'Time slots saved!' });
      else setAlert({ type: 'error', msg: d.message || 'Error' });
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
  };

  return (
    <>
      <div className="dash-page-header">
        <h2>Available Time Slots</h2>
        <p>Set your availability for each day of the week</p>
      </div>
      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '16px' }}>
        {DAYS.map(day => {
          const hasSlots = slots[day].length > 0;
          return (
            <div className={`day-slots-container ${hasSlots ? 'active' : ''}`} key={day}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h3 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0, fontSize: '18px', color: hasSlots ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>
                    {day}
                  </h3>
                  {!hasSlots && <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', opacity: 0.6 }}>Unavailable</span>}
                </div>
                
                <button 
                  onClick={() => addSlot(day)}
                  style={{ background: 'transparent', border: '1px solid rgba(200,167,99,0.3)', color: 'var(--color-gold)', borderRadius: '20px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,167,99,0.1)'; e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(200,167,99,0.3)'; }}
                >
                  <Plus size={14} /> Add Slot
                </button>
              </div>

              {hasSlots && (
                <div style={{ marginTop: '20px' }}>
                  {slots[day].map((slot, idx) => (
                    <div className="slot-row" key={idx}>
                      <input 
                        type="time" 
                        className="time-slot-pill"
                        value={slot.start_time} 
                        onChange={e => updateSlot(day, idx, 'start_time', e.target.value)} 
                      />
                      
                      <ArrowRight size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                      
                      <input 
                        type="time" 
                        className="time-slot-pill"
                        value={slot.end_time} 
                        onChange={e => updateSlot(day, idx, 'end_time', e.target.value)} 
                      />
                      
                      <button 
                        className="trash-btn"
                        onClick={() => removeSlot(day, idx)} 
                        style={{ background: 'transparent', border: 'none', color: 'rgba(255,50,50,0.5)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', transition: 'color 0.2s', marginLeft: 'auto' }}
                        title="Remove Slot"
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,50,50,1)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,50,50,0.5)'}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '24px', marginBottom: '40px', display: 'flex', justifyContent: 'flex-start' }}>
        <Button variant="primary" size="sm" onClick={handleSave}>Save All Slots</Button>
      </div>
    </>
  );
}
