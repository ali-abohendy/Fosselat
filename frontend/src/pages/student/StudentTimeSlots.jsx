import { useState, useEffect } from 'react';
import Button from '../../components/Button';

import API from '../../config.js';
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

      {DAYS.map(day => (
        <div className="dash-form-container" key={day} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>{day}</h3>
            <button className="dash-filter-btn" onClick={() => addSlot(day)}>+ Add Slot</button>
          </div>
          {slots[day].length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No slots — click + Add Slot</p>}
          {slots[day].map((slot, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
              <input type="time" value={slot.start_time} onChange={e => updateSlot(day, idx, 'start_time', e.target.value)} />
              <span style={{ color: 'var(--color-text-muted)' }}>to</span>
              <input type="time" value={slot.end_time} onChange={e => updateSlot(day, idx, 'end_time', e.target.value)} />
              <button className="dash-filter-btn" onClick={() => removeSlot(day, idx)} style={{ color: '#E74C3C', borderColor: '#E74C3C' }}>Remove</button>
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: '16px' }}>
        <Button variant="primary" onClick={handleSave}>Save All Slots</Button>
      </div>
    </>
  );
}
