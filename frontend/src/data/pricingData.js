// Authoritative Fosselat Academy 4-week monthly pricing table (USD)

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    classes: 2,
    desc: 'Steady weekly rhythm ideal for busy schedules and beginners.',
    discount: 0,
    discountNote: 'Standard rate',
  },
  {
    id: 'growth',
    name: 'Growth',
    classes: 3,
    desc: 'Our most balanced pace for consistent reading & Tajweed progress.',
    popular: true,
    discount: 0.05,
    discountNote: 'Includes 5% multi-class discount',
  },
  {
    id: 'excellence',
    name: 'Excellence',
    classes: 4,
    desc: 'Accelerated mastery with frequent guided practice.',
    discount: 0.07,
    discountNote: 'Includes 7% multi-class discount',
  },
  {
    id: 'elite',
    name: 'Elite',
    classes: 5,
    desc: 'Intensive daily-style learning for rapid fluency or Hifz.',
    discount: 0.10,
    discountNote: 'Includes 10% multi-class discount',
  },
];

export const DURATIONS = [
  { minutes: 30, rate: 4 },
  { minutes: 40, rate: 5.33 },
  { minutes: 45, rate: 6 },
  { minutes: 60, rate: 8 },
  { minutes: 90, rate: 12 },
  { minutes: 120, rate: 16 },
];

export function calculateMonthlyPlan(planId, durationMinutes) {
  const plan = PLANS.find((p) => p.id === planId);
  const dur = DURATIONS.find((d) => d.minutes === Number(durationMinutes));
  if (!plan || !dur) return null;

  const monthlyClasses = plan.classes * 4;
  const base = monthlyClasses * dur.rate;
  const discount = plan.discount ? base * plan.discount : 0;
  const total = base - discount;

  return {
    planId: plan.id,
    planName: plan.name,
    classesPerWeek: plan.classes,
    monthlyClasses,
    duration: dur.minutes,
    ratePerClass: dur.rate.toFixed(2),
    base: base.toFixed(2),
    discount: discount.toFixed(2),
    total: total.toFixed(2),
    hasDiscount: plan.discount > 0,
    discountPct: Math.round(plan.discount * 100),
    discountNote: plan.discountNote,
  };
}
