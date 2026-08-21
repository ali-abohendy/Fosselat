/* Fosselat Academy — adaptive placement engine (one Student Division).
 *
 * Concept: the self-report answer sets ONLY the starting point (one level
 * below the claim). Each level is tested with QUESTIONS_PER_LEVEL questions
 * scored independently. >= 60% masters the level and moves the student UP;
 * below 60% moves the student DOWN to the previous level if it is not yet
 * proven, otherwise the test ends. The final recommendation is the first
 * level the student did NOT master (highest mastered + 1, capped at the top).
 *
 * Pure module — no React, no DOM. Used by the UI and by the test harness.
 */

export const EPS = 1e-9;

export function configOf(data) {
  const c = (data && data.meta && data.meta.config) || {};
  return {
    masteryThreshold: c.masteryThreshold ?? 0.6,
    questionsPerLevel: c.questionsPerLevel ?? 10,
    difficultyMix: c.difficultyMix ?? { easy: 0.3, medium: 0.45, hard: 0.25 },
    prerequisiteLookback: c.prerequisiteLookback ?? 1,
    placementMode: c.placementMode ?? "firstUnmastered",
  };
}

/* ------------------------------------------------------------ rng helpers */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------ selection */
const BANDS = ["easy", "medium", "hard"];

function quotaFor(n, mix) {
  const q = {
    easy: Math.round(n * (mix.easy ?? 0)),
    medium: Math.round(n * (mix.medium ?? 0)),
    hard: Math.round(n * (mix.hard ?? 0)),
  };
  let sum = q.easy + q.medium + q.hard;
  const order = ["medium", "easy", "hard"];
  let i = 0;
  while (sum < n) { q[order[i % 3]] += 1; sum += 1; i += 1; }
  while (sum > n) {
    const k = order[i % 3]; i += 1;
    if (q[k] > 0) { q[k] -= 1; sum -= 1; }
  }
  return q;
}

function roundRobinBySkill(pool, count, rng) {
  const bySkill = new Map();
  for (const q of shuffled(pool, rng)) {
    if (!bySkill.has(q.skill)) bySkill.set(q.skill, []);
    bySkill.get(q.skill).push(q);
  }
  const skills = shuffled([...bySkill.keys()], rng);
  const out = [];
  let idx = 0, empty = 0;
  while (out.length < count && empty < skills.length) {
    const s = skills[idx % skills.length];
    idx += 1;
    const bucket = bySkill.get(s);
    if (bucket.length === 0) { empty += 1; continue; }
    empty = 0;
    out.push(bucket.shift());
  }
  return out;
}

/** Picks the served set for one level: difficulty quotas, skill round-robin,
 *  easiest first, per-student option shuffle. Deterministic under `rng`. */
export function selectLevelQuestions(bank, n, mix, rng) {
  const pools = { easy: [], medium: [], hard: [] };
  for (const q of bank.questions) (pools[q.difficulty] || pools.medium).push(q);
  const quota = quotaFor(Math.min(n, bank.questions.length), mix);
  const picked = [];
  const taken = new Set();
  for (const band of BANDS) {
    const got = roundRobinBySkill(pools[band].filter(q => !taken.has(q.id)), quota[band], rng);
    got.forEach(q => taken.add(q.id));
    picked.push(...got);
  }
  let need = Math.min(n, bank.questions.length) - picked.length;
  if (need > 0) {
    const rest = bank.questions.filter(q => !taken.has(q.id));
    const extra = roundRobinBySkill(rest, need, rng);
    extra.forEach(q => taken.add(q.id));
    picked.push(...extra);
  }
  const rank = { easy: 0, medium: 1, hard: 2 };
  picked.sort((a, b) => (rank[a.difficulty] - rank[b.difficulty]));
  return picked.map(q => ({
    id: q.id,
    order: shuffled(q.options.map((_, i) => i), rng),
  }));
}

/* ------------------------------------------------------------ session */
export function levelsOf(program) {
  return [...program.levels].sort((a, b) => a.id - b.id);
}

export function bankOf(program, levelId) {
  return program.levelBanks.find(b => b.level === levelId);
}

export function questionById(program, levelId, qid) {
  const bank = bankOf(program, levelId);
  return bank && bank.questions.find(q => q.id === qid);
}

export function startSession(data, trackId, programId, claimLevel, seed) {
  const cfg = configOf(data);
  const track = data.tracks.find(t => t.id === trackId);
  const program = track.programs.find(p => p.id === programId);
  const lvls = levelsOf(program).map(l => l.id);
  const minL = lvls[0], maxL = lvls[lvls.length - 1];
  const start = Math.max(minL, Math.min(maxL, claimLevel - cfg.prerequisiteLookback));
  const session = {
    v: 2,
    seed: seed >>> 0,
    trackId, programId,
    claimLevel,
    currentLevel: start,
    perLevel: {},
    visited: [],
    finished: false,
    age: null,
  };
  openLevel(data, session);
  return session;
}

export function openLevel(data, session) {
  const { program } = resolve(data, session);
  const cfg = configOf(data);
  const lv = session.currentLevel;
  if (!session.perLevel[lv]) {
    const rng = mulberry32((session.seed ^ (lv * 0x9E3779B9)) >>> 0);
    const bank = bankOf(program, lv);
    session.perLevel[lv] = {
      slots: selectLevelQuestions(bank, cfg.questionsPerLevel, cfg.difficultyMix, rng),
      answers: [],
      done: false, correct: 0, pct: 0, mastered: false,
    };
  }
  if (!session.visited.includes(lv)) session.visited.push(lv);
  return session.perLevel[lv];
}

export function resolve(data, session) {
  const track = data.tracks.find(t => t.id === session.trackId);
  const program = track.programs.find(p => p.id === session.programId);
  return { track, program };
}

/** Presents slot i of the current level: question + shuffled options. */
export function presentSlot(data, session, i) {
  const { program } = resolve(data, session);
  const st = session.perLevel[session.currentLevel];
  const slot = st.slots[i];
  const q = questionById(program, session.currentLevel, slot.id);
  return {
    ...q,
    options: slot.order.map(k => q.options[k]),
    _slotOrder: slot.order,
  };
}

export function answerSlot(data, session, i, pickedIndex) {
  const st = session.perLevel[session.currentLevel];
  st.answers[i] = pickedIndex === undefined ? null : pickedIndex;
}

export function gradeLevel(data, session) {
  const { program } = resolve(data, session);
  const cfg = configOf(data);
  const st = session.perLevel[session.currentLevel];
  let correct = 0;
  st.slots.forEach((slot, i) => {
    const q = questionById(program, session.currentLevel, slot.id);
    const picked = st.answers[i];
    if (picked !== null && picked !== undefined && slot.order[picked] === q.correct) correct += 1;
  });
  st.correct = correct;
  st.pct = st.slots.length ? correct / st.slots.length : 0;
  st.mastered = st.pct >= cfg.masteryThreshold - EPS;
  st.done = true;
  return st;
}

/** After a level is graded: decides up / down / finish. Mutates session. */
export function advance(data, session) {
  const { program } = resolve(data, session);
  const lvls = levelsOf(program).map(l => l.id);
  const minL = lvls[0], maxL = lvls[lvls.length - 1];
  const lv = session.currentLevel;
  const st = session.perLevel[lv];
  const attempted = id => session.perLevel[id] && session.perLevel[id].done;

  if (st.mastered) {
    if (lv === maxL || attempted(lv + 1)) {
      session.finished = true;
      return { move: "finish" };
    }
    session.currentLevel = lv + 1;
    openLevel(data, session);
    return { move: "up", to: lv + 1 };
  }
  if (lv > minL && !attempted(lv - 1)) {
    session.currentLevel = lv - 1;
    openLevel(data, session);
    return { move: "down", to: lv - 1 };
  }
  session.finished = true;
  return { move: "finish" };
}

/* ------------------------------------------------------------ result */
export function finalizeResult(data, session) {
  const { track, program } = resolve(data, session);
  const cfg = configOf(data);
  const lvls = levelsOf(program);
  const ids = lvls.map(l => l.id);
  const maxL = ids[ids.length - 1];

  const attempted = ids.filter(id => session.perLevel[id] && session.perLevel[id].done);
  const mastered = attempted.filter(id => session.perLevel[id].mastered);
  const highestMastered = mastered.length ? Math.max(...mastered) : null;

  let placement;
  if (cfg.placementMode === "highestMastered" && highestMastered !== null) {
    placement = highestMastered;
  } else {
    placement = highestMastered === null ? ids[0] : Math.min(highestMastered + 1, maxL);
  }
  const level = lvls.find(l => l.id === placement);

  const skillMap = {};
  for (const id of attempted) {
    const st = session.perLevel[id];
    st.slots.forEach((slot, i) => {
      const q = questionById(program, id, slot.id);
      const picked = st.answers[i];
      const ok = picked !== null && picked !== undefined && slot.order[picked] === q.correct;
      if (!skillMap[q.skill]) skillMap[q.skill] = { skill: q.skill, correct: 0, total: 0 };
      skillMap[q.skill].total += 1;
      if (ok) skillMap[q.skill].correct += 1;
    });
  }
  const skills = Object.values(skillMap).map(s => ({ ...s, pct: s.total ? s.correct / s.total : 0 }));
  const desc = [...skills].sort((a, b) => b.pct - a.pct);
  const asc = [...skills].sort((a, b) => a.pct - b.pct);
  let strengths = desc.filter(s => s.pct >= 0.65 && s.total >= 2).slice(0, 3);
  if (!strengths.length && desc.length && desc[0].pct >= 0.5) strengths = desc.slice(0, 2);
  const strong = new Set(strengths.map(s => s.skill));
  let weaknesses = asc.filter(s => s.pct < 0.5 && !strong.has(s.skill)).slice(0, 3);
  if (!weaknesses.length) {
    const lowest = asc.find(s => !strong.has(s.skill) && s.pct < 0.65);
    if (lowest) weaknesses = [lowest];
  }

  const levelScores = attempted
    .sort((a, b) => a - b)
    .map(id => ({
      level: id,
      name: lvls.find(l => l.id === id).name,
      correct: session.perLevel[id].correct,
      of: session.perLevel[id].slots.length,
      pct: session.perLevel[id].pct,
      mastered: session.perLevel[id].mastered,
    }));

  const duration = estimateDuration(level, program);

  return {
    trackId: track.id, trackLabel: track.label,
    programId: program.id, programLabel: program.label,
    level, levelPosition: ids.indexOf(placement) + 1, totalLevels: ids.length,
    highestMastered,
    levelScores,
    skills, strengths, weaknesses,
    duration,
    age: session.age,
    claimLevel: session.claimLevel,
  };
}

export function estimateDuration(level, program) {
  const fastPace = program.fastPaceNote;
  if (!level.weeks) {
    return {
      label: "Individualized pace",
      note: "Paced with your teacher based on personal progress",
      lessonsPerWeek: fastPace || "2x / week (standard pace)",
    };
  }
  const label = level.weeks < 14
    ? `${level.weeks} weeks`
    : `${Math.round(level.weeks / 4.345)} months`;
  return {
    label,
    note: `${level.lessons || Math.round(level.weeks * 2)} lessons to complete this level`,
    lessonsPerWeek: fastPace || "2x / week (standard pace)",
  };
}

/* ------------------------------------------------------------ persistence */
export function snapshotOf(session) {
  return {
    v: 2,
    seed: session.seed,
    trackId: session.trackId,
    programId: session.programId,
    claimLevel: session.claimLevel,
    currentLevel: session.currentLevel,
    visited: session.visited,
    finished: session.finished,
    age: session.age,
    perLevel: Object.fromEntries(Object.entries(session.perLevel).map(([lv, st]) => [lv, {
      slots: st.slots, answers: st.answers, done: st.done,
      correct: st.correct, pct: st.pct, mastered: st.mastered,
    }])),
    savedAt: Date.now(),
  };
}

export function rehydrate(data, snap) {
  if (!snap || snap.v !== 2) return null;
  const track = data.tracks.find(t => t.id === snap.trackId);
  const program = track && track.programs.find(p => p.id === snap.programId);
  if (!track || !program) return null;
  for (const [lv, st] of Object.entries(snap.perLevel)) {
    for (const slot of st.slots) {
      if (!questionById(program, Number(lv), slot.id)) return null;
    }
  }
  const session = {
    v: 2, seed: snap.seed, trackId: snap.trackId, programId: snap.programId,
    claimLevel: snap.claimLevel, currentLevel: snap.currentLevel,
    perLevel: {}, visited: snap.visited.slice(), finished: !!snap.finished,
    age: snap.age ?? null,
  };
  for (const [lv, st] of Object.entries(snap.perLevel)) {
    session.perLevel[Number(lv)] = {
      slots: st.slots, answers: st.answers.slice(), done: !!st.done,
      correct: st.correct || 0, pct: st.pct || 0, mastered: !!st.mastered,
    };
  }
  return session;
}

/* progress across the whole run (levels are dynamic, so estimate) */
export function progressFraction(session, questionIndex, perLevelCount) {
  const done = session.visited.filter(lv => session.perLevel[lv] && session.perLevel[lv].done).length;
  const within = perLevelCount ? questionIndex / perLevelCount : 0;
  return Math.min(0.97, (done + within) / (done + 2));
}
