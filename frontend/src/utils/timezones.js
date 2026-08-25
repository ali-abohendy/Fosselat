export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getNextDateForDay(dayName) {
  const target = DAYS.indexOf(dayName);
  const d = new Date();
  const current = d.getDay();
  let diff = target - current;
  if (diff < 0) diff += 7;
  d.setDate(d.getDate() + diff);
  return d;
}

export function localToUTC(day, timeStr) {
  if (!day || !timeStr) return { utcDay: day, utcTime: timeStr };
  
  const [h, m] = timeStr.split(':').map(Number);
  const d = getNextDateForDay(day);
  d.setHours(h, m, 0, 0);
  
  return {
    utcDay: DAYS[d.getUTCDay()],
    utcTime: `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
  };
}

export function utcToLocal(utcDay, utcTimeStr) {
  if (!utcDay || !utcTimeStr) return { localDay: utcDay, localTime: utcTimeStr };

  const [h, m] = utcTimeStr.split(':').map(Number);
  
  const d = new Date();
  const currentUtcDay = d.getUTCDay();
  const targetUtcDay = DAYS.indexOf(utcDay);
  
  let diff = targetUtcDay - currentUtcDay;
  if (diff < 0) diff += 7;
  
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(h, m, 0, 0);
  
  return {
    localDay: DAYS[d.getDay()],
    localTime: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  };
}
