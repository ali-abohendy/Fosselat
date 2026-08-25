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

export function applyTimezoneDiff(day, timeStr, diffStr) {
  if (!day || !timeStr || !diffStr) return { adjustedDay: day, adjustedTime: timeStr };
  
  const diffHours = parseFloat(diffStr);
  if (isNaN(diffHours)) return { adjustedDay: day, adjustedTime: timeStr };

  const [h, m] = timeStr.split(':').map(Number);
  
  const totalMins = h * 60 + m + (diffHours * 60);
  let adjustedH = Math.floor(totalMins / 60);
  const adjustedM = ((totalMins % 60) + 60) % 60; // handle negative modulo
  
  let dayOffset = 0;
  while (adjustedH < 0) {
    adjustedH += 24;
    dayOffset -= 1;
  }
  while (adjustedH >= 24) {
    adjustedH -= 24;
    dayOffset += 1;
  }

  const currentDayIdx = DAYS.indexOf(day);
  let newDayIdx = (currentDayIdx + dayOffset) % 7;
  if (newDayIdx < 0) newDayIdx += 7;

  return {
    adjustedDay: DAYS[newDayIdx],
    adjustedTime: `${adjustedH.toString().padStart(2, '0')}:${Math.round(adjustedM).toString().padStart(2, '0')}`
  };
}
