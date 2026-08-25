import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PlacementTest.css';

const STORAGE_KEY = "fosselat_placement_v2";
const LEGACY_KEYS = ["fosselat_placement_progress_v1"];
const MAX_SAVE_AGE_MS = 7 * 24 * 3600 * 1000;

const ACCENTS = {
  quran: "var(--emerald)",
  arabic: "var(--indigo)",
  "islamic-studies": "var(--maroon)",
};
const INITIALS = { quran: "Q", arabic: "A", "islamic-studies": "I" };

/* ──────────────────────────────────────────────────────────────────────
   Placement Engine — ported from scoring.js v3.0
   Pure logic, no DOM.  Every function is deterministic given its inputs.
   ────────────────────────────────────────────────────────────────────── */
const Placement = (() => {
  const CONFIG = {
    MASTERY_THRESHOLD: 0.60,
    QUESTIONS_PER_LEVEL: { kids: 10, adults: 12 },
    DIFFICULTY_MIX: { easy: 0.3, medium: 0.45, hard: 0.25 },
    PREREQUISITE_LOOKBACK: 1,
    PLACEMENT_MODE: "firstUnmastered",
    EPSILON: 1e-9,
  };

  function configure(meta) {
    const c = (meta && meta.config) || {};
    if (typeof c.masteryThreshold === "number") CONFIG.MASTERY_THRESHOLD = c.masteryThreshold;
    if (c.questionsPerLevel) CONFIG.QUESTIONS_PER_LEVEL = c.questionsPerLevel;
    if (c.difficultyMix) CONFIG.DIFFICULTY_MIX = c.difficultyMix;
    if (typeof c.prerequisiteLookback === "number") CONFIG.PREREQUISITE_LOOKBACK = c.prerequisiteLookback;
    if (typeof c.placementMode === "string") CONFIG.PLACEMENT_MODE = c.placementMode;
    return CONFIG;
  }

  function pct(earned, max) { return max ? earned / max : 0; }
  function isMastered(levelPct) { return levelPct >= CONFIG.MASTERY_THRESHOLD - CONFIG.EPSILON; }

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function serveCount(audience) {
    const c = CONFIG.QUESTIONS_PER_LEVEL;
    return typeof c === "number" ? c : (c[audience] || c.adults || 10);
  }

  // Data access
  function levelsOf(program, audience) {
    if (!program || !program.levels) return [];
    return program.levels.slice().sort((a, b) => a.id - b.id);
  }
  function levelIdsOf(program, audience) { return levelsOf(program, audience).map(l => l.id); }
  function levelInfo(program, audience, levelId) {
    return levelsOf(program, audience).find(l => l.id === levelId) || null;
  }
  function bankOf(program, audience, levelId) {
    const banks = program.levelBanks || [];
    return banks.find(b => b.level === levelId) || null;
  }
  function questionById(program, audience, qid) {
    const banks = program.levelBanks || [];
    for (const b of banks) {
      const q = b.questions.find(x => x.id === qid);
      if (q) return q;
    }
    return null;
  }
  function selfReportOf(program, audience) {
    return program.selfReport;
  }

  // Question selection
  function skillRoundRobin(items) {
    const bySkill = {};
    shuffled(items).forEach(q => { (bySkill[q.skill] = bySkill[q.skill] || []).push(q); });
    const groups = shuffled(Object.keys(bySkill)).map(k => bySkill[k]);
    const out = [];
    let moved = true;
    while (moved) {
      moved = false;
      for (const g of groups) { if (g.length) { out.push(g.shift()); moved = true; } }
    }
    return out;
  }

  function selectLevelQuestions(program, audience, levelId, excludeIds, count) {
    const bank = bankOf(program, audience, levelId);
    if (!bank) return [];
    const exclude = excludeIds instanceof Set ? excludeIds : new Set(excludeIds || []);
    const pool = bank.questions.filter(q => !exclude.has(q.id));
    const usable = pool.length ? pool : bank.questions.slice();
    const want = Math.min(count || serveCount(audience), usable.length);

    const BANDS = ["easy", "medium", "hard"];
    const byBand = { easy: [], medium: [], hard: [] };
    usable.forEach(q => (byBand[q.difficulty] || byBand.medium).push(q));
    BANDS.forEach(b => { byBand[b] = skillRoundRobin(byBand[b]); });

    const target = {};
    let assigned = 0;
    BANDS.forEach((b, i) => {
      target[b] = i === BANDS.length - 1 ? want - assigned
        : Math.min(byBand[b].length, Math.round(want * (CONFIG.DIFFICULTY_MIX[b] || 0)));
      assigned += target[b];
    });

    const picked = [];
    BANDS.forEach(b => {
      for (let i = 0; i < target[b] && byBand[b].length; i++) picked.push(byBand[b].shift());
    });
    const leftovers = skillRoundRobin(BANDS.reduce((a, b) => a.concat(byBand[b]), []));
    while (picked.length < want && leftovers.length) picked.push(leftovers.shift());

    const rank = { easy: 0, medium: 1, hard: 2 };
    picked.sort((a, b) => (rank[a.difficulty] || 1) - (rank[b.difficulty] || 1));
    return picked.map(q => ({ id: q.id, order: shuffled(q.options.map((_, i) => i)), response: null }));
  }

  function present(program, audience, slot) {
    const q = questionById(program, audience, slot.id);
    if (!q) return null;
    const order = slot.order && slot.order.length === q.options.length ? slot.order : q.options.map((_, i) => i);
    return {
      id: q.id, level: q.level, skill: q.skill, difficulty: q.difficulty,
      prompt: q.prompt, arabic: q.arabic || null,
      options: order.map(i => q.options[i]),
      optionsArabic: !!q.optionsArabic, points: q.points || 1,
    };
  }

  function gradeSlot(program, audience, slot) {
    const q = questionById(program, audience, slot.id);
    if (!q) return { earned: 0, max: 0, correct: false, skill: null };
    const max = q.points || 1;
    if (slot.response === null || slot.response === undefined) {
      return { earned: 0, max, correct: false, skill: q.skill, skipped: true };
    }
    const order = slot.order && slot.order.length === q.options.length ? slot.order : q.options.map((_, i) => i);
    const originalIdx = order[slot.response];
    const correct = originalIdx === q.correct;
    return { earned: correct ? max : 0, max, correct, skill: q.skill, skipped: false };
  }

  // Session lifecycle
  function startPlacement(trackId, programId, audience, program) {
    return {
      v: 2, trackId, programId, audience,
      levelIds: levelIdsOf(program, audience),
      claimLevel: null, phase: "selfReport", direction: "up",
      currentLevel: null, slots: [], index: 0,
      levelResults: [], askedIds: [], order: [],
    };
  }

  function getStartingLevel(session, claimLevel) {
    const ids = session.levelIds;
    let claim = Number(claimLevel);
    if (!isFinite(claim)) claim = ids[0];
    claim = Math.max(ids[0], Math.min(ids[ids.length - 1], claim));
    const idx = ids.indexOf(claim);
    return ids[Math.max(0, idx - CONFIG.PREREQUISITE_LOOKBACK)];
  }

  function applySelfReport(session, program, claimLevel) {
    session.claimLevel = claimLevel;
    session.phase = "testing";
    session.direction = "up";
    loadLevelQuestions(session, program, getStartingLevel(session, claimLevel));
    return session;
  }

  function loadLevelQuestions(session, program, levelId) {
    session.currentLevel = levelId;
    session.index = 0;
    session.slots = selectLevelQuestions(
      program, session.audience, levelId, new Set(session.askedIds), serveCount(session.audience));
    session.slots.forEach(s => { if (session.askedIds.indexOf(s.id) === -1) session.askedIds.push(s.id); });
    return session.slots;
  }

  function currentSlot(session) { return session.slots[session.index] || null; }
  function currentQuestion(session, program) {
    const slot = currentSlot(session);
    return slot ? present(program, session.audience, slot) : null;
  }

  function answerCurrent(session, response) {
    const slot = currentSlot(session);
    if (!slot) return false;
    slot.response = (response === null || response === undefined) ? null : Number(response);
    return true;
  }

  function goNext(session) {
    if (session.index < session.slots.length) session.index++;
    return session.index >= session.slots.length;
  }
  function goBack(session) {
    if (session.index > 0) { session.index--; return true; }
    return false;
  }
  function canGoBack(session) { return session.index > 0; }

  function evaluateLevel(session, program) {
    let earned = 0, max = 0;
    const answers = session.slots.map(slot => {
      const g = gradeSlot(program, session.audience, slot);
      earned += g.earned; max += g.max;
      return { id: slot.id, order: slot.order, response: slot.response, earned: g.earned, max: g.max, correct: g.correct, skill: g.skill };
    });
    const p = pct(earned, max);
    return { level: session.currentLevel, earned, max, pct: p, passed: isMastered(p), answers };
  }

  function completeLevel(session, program) {
    const result = evaluateLevel(session, program);
    const existing = session.levelResults.findIndex(r => r.level === result.level);
    if (existing >= 0) session.levelResults[existing] = result;
    else session.levelResults.push(result);
    if (session.order.indexOf(result.level) === -1) session.order.push(result.level);

    const ids = session.levelIds;
    const min = ids[0], max = ids[ids.length - 1];
    const at = ids.indexOf(result.level);
    const tested = lvl => session.levelResults.some(r => r.level === lvl);

    let next = null;
    if (result.passed) {
      if (session.direction === "up" && result.level !== max) next = ids[at + 1];
    } else {
      if (result.level !== min && !tested(ids[at - 1])) {
        next = ids[at - 1];
        session.direction = "down";
      }
    }

    if (next === null || next === undefined) {
      session.phase = "complete";
      session.slots = []; session.index = 0;
      return { result, done: true, passed: result.passed, direction: session.direction, nextLevel: null, isTopLevel: result.level === max };
    }
    loadLevelQuestions(session, program, next);
    return { result, done: false, passed: result.passed, direction: session.direction, nextLevel: next, isTopLevel: false };
  }

  // Reporting
  function aggregateSkills(levelResults) {
    const map = {};
    levelResults.forEach(r => r.answers.forEach(a => {
      if (!a.skill || !a.max) return;
      if (!map[a.skill]) map[a.skill] = { skill: a.skill, earned: 0, max: 0 };
      map[a.skill].earned += a.earned;
      map[a.skill].max += a.max;
    }));
    return Object.keys(map).map(k => ({ ...map[k], pct: pct(map[k].earned, map[k].max) }));
  }

  function buildStrengthsWeaknesses(skillArr) {
    const scored = skillArr.filter(s => s.max > 0);
    const desc = [...scored].sort((a, b) => b.pct - a.pct);
    const asc = [...scored].sort((a, b) => a.pct - b.pct);
    let strengths = desc.filter(s => s.pct >= 0.65).slice(0, 3);
    if (!strengths.length && desc.length && desc[0].pct >= 0.5) strengths = desc.slice(0, 1);
    const strong = new Set(strengths.map(s => s.skill));
    let weaknesses = asc.filter(s => s.pct < 0.6 && !strong.has(s.skill)).slice(0, 3);
    if (!weaknesses.length && asc.length && asc[0].pct < 0.9 && !strong.has(asc[0].skill)) weaknesses = [asc[0]];
    return { strengths, weaknesses };
  }

  function estimateDuration(level, program) {
    const fastPace = program.fastPaceNote;
    if (!level || !level.weeks) {
      return { label: "Individualized pace", note: "Planned with your teacher around your own progress", lessonsPerWeek: fastPace || "2x / week (standard pace)" };
    }
    const label = level.weeks < 14 ? level.weeks + " weeks" : Math.round(level.weeks / 4.345) + " months";
    return { label, note: (level.lessons || Math.round(level.weeks * 2)) + " lessons to complete this level", lessonsPerWeek: fastPace || "2x / week (standard pace)" };
  }

  function listLevels(nums) {
    if (!nums.length) return "";
    if (nums.length === 1) return "Level " + nums[0];
    return "Levels " + nums.slice(0, -1).join(", ") + " and " + nums[nums.length - 1];
  }

  function finalizePlacement(session, program, track) {
    const ids = session.levelIds;
    const min = ids[0], max = ids[ids.length - 1];
    const results = session.levelResults.slice().sort((a, b) => a.level - b.level);
    const passedLevels = results.filter(r => r.passed).map(r => r.level);
    const failedLevels = results.filter(r => !r.passed).map(r => r.level);
    const highestMastered = passedLevels.length ? Math.max(...passedLevels) : null;

    let recommendedId;
    if (CONFIG.PLACEMENT_MODE === "highestMastered") {
      recommendedId = highestMastered === null ? min : highestMastered;
    } else {
      recommendedId = highestMastered === null ? min : ids[Math.min(ids.indexOf(highestMastered) + 1, ids.length - 1)];
    }

    const recommended = levelInfo(program, session.audience, recommendedId);
    const mastered = highestMastered === null ? null : levelInfo(program, session.audience, highestMastered);
    const levelScores = results.map(r => {
      const info = levelInfo(program, session.audience, r.level);
      const bank = bankOf(program, session.audience, r.level);
      return { level: r.level, name: info ? info.name : "Level " + r.level, focus: bank ? bank.focus : "", correct: r.earned, total: r.max, pct: r.pct, passed: r.passed };
    });

    const skills = aggregateSkills(results);
    const sw = buildStrengthsWeaknesses(skills);
    const duration = estimateDuration(recommended, program);

    let summary;
    if (!passedLevels.length) {
      summary = "You are all set to begin at " + (recommended ? recommended.name : "Level " + recommendedId) + ". Starting here builds the foundations properly, and you will move up quickly once they are solid.";
    } else if (highestMastered === max && recommendedId === max) {
      summary = "You showed a strong command of " + listLevels(passedLevels) + ", including the highest level in this program. You are recommended to begin at " + (recommended ? recommended.name : "Level " + recommendedId) + ".";
    } else {
      summary = "Based on your assessment, you demonstrated mastery of " + listLevels(passedLevels) + ". You are therefore recommended to begin at Level " + recommendedId + (recommended ? " — " + recommended.name : "") + ".";
    }

    const nextStep = "Share these results with Fosselat Academy to enrol in " + (recommended ? recommended.name : "Level " + recommendedId) + " of " + program.label + ". No further testing is needed — your placement is complete.";

    const claimOption = (selfReportOf(program, session.audience).options || []).find(o => o.claimLevel === session.claimLevel);

    return {
      audience: session.audience,
      audienceLabel: session.audience === "kids" ? "Kids" : "Adults",
      trackId: track ? track.id : session.trackId,
      trackLabel: track ? track.label : session.trackId,
      programId: program.id, programLabel: program.label,
      claimLevel: session.claimLevel,
      claimLabel: claimOption ? claimOption.label : "",
      recommendedLevel: recommended, recommendedLevelId: recommendedId,
      recommendedPosition: ids.indexOf(recommendedId) + 1,
      totalLevels: ids.length,
      highestMasteredLevel: mastered, highestMasteredId: highestMastered,
      levelsPassed: passedLevels, levelsNotPassed: failedLevels,
      levelScores, skills,
      strengths: sw.strengths, weaknesses: sw.weaknesses,
      duration, summary, nextStep,
      masteryThreshold: CONFIG.MASTERY_THRESHOLD,
    };
  }

  function rehydrate(session, program) {
    if (!session || session.v !== 2) return null;
    const ids = levelIdsOf(program, session.audience);
    if (!ids.length) return null;
    session.levelIds = ids;
    session.levelResults = (session.levelResults || []).filter(r => ids.indexOf(r.level) !== -1 && Array.isArray(r.answers));
    session.levelResults.forEach(r => {
      r.answers = r.answers.filter(a => questionById(program, session.audience, a.id));
      r.earned = r.answers.reduce((s, a) => s + (a.earned || 0), 0);
      r.max = r.answers.reduce((s, a) => s + (a.max || 0), 0);
      r.pct = pct(r.earned, r.max);
      r.passed = isMastered(r.pct);
    });
    session.order = (session.order || []).filter(l => ids.indexOf(l) !== -1);
    session.askedIds = (session.askedIds || []).filter(id => questionById(program, session.audience, id));
    if (session.phase === "testing") {
      if (ids.indexOf(session.currentLevel) === -1) return null;
      session.slots = (session.slots || []).filter(s => questionById(program, session.audience, s.id));
      if (!session.slots.length) loadLevelQuestions(session, program, session.currentLevel);
      session.index = Math.max(0, Math.min(session.index || 0, session.slots.length - 1));
    }
    if (session.phase === "selfReport") { session.slots = []; session.index = 0; }
    return session;
  }

  function progressFraction(session) {
    const total = session.levelIds.length;
    if (session.phase === "selfReport") return 0.04;
    if (session.phase === "complete") return 1;
    const done = session.levelResults.length;
    const within = session.slots.length ? session.index / session.slots.length : 0;
    const expected = Math.min(total, Math.max(2, done + 1));
    return Math.min(0.96, (done + within) / (expected + 0.35));
  }

  return {
    CONFIG, configure, levelsOf, levelIdsOf, levelInfo, bankOf, questionById, selfReportOf,
    startPlacement, getStartingLevel, applySelfReport, loadLevelQuestions, serveCount,
    selectLevelQuestions, present, currentSlot, currentQuestion,
    answerCurrent, goNext, goBack, canGoBack,
    evaluateLevel, completeLevel, finalizePlacement,
    gradeSlot, pct, isMastered, aggregateSkills, buildStrengthsWeaknesses,
    estimateDuration, rehydrate, progressFraction,
  };
})();

/* ──────────────────────────────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────────────────────────────── */
export default function PlacementTest() {
  const [data, setData] = useState(null);
  const [screen, setScreen] = useState('welcome');
  const [track, setTrack] = useState(null);
  const [program, setProgram] = useState(null);
  const [session, setSession] = useState(null);
  const [pendingAudience, setPendingAudience] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [progressPct, setProgressPct] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [progressVisible, setProgressVisible] = useState(false);
  const [stageInfo, setStageInfo] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(null);

  // User info state
  const [userInfo, setUserInfo] = useState({ name: '', age: '', email: '' });
  const [userInfoErrors, setUserInfoErrors] = useState({});

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  // ─── Data loading ───
  useEffect(() => {
    fetch('/questions.json')
      .then(r => r.json())
      .then(d => {
        Placement.configure(d.meta);
        setData(d);
      })
      .catch(e => console.error("Error loading questions:", e));
  }, []);

  // ─── Resume check ───
  useEffect(() => {
    if (!data) return;
    const found = loadSnapshot(data);
    if (found) setResumeData(found);
  }, [data]);

  // ─── URL params deep-linking ───
  useEffect(() => {
    if (!data || resumeData) return;
    const trackParam = searchParams.get('track');
    const programParam = searchParams.get('program');
    const audienceParam = searchParams.get('audience');
    if (!trackParam) return;
    const t = data.tracks.find(tr => tr.id === trackParam);
    if (!t) return;
    setAccent(t.id);
    setTrack(t);
    if (audienceParam) setPendingAudience(audienceParam);
    if (programParam) {
      const p = t.programs.find(pr => pr.id === programParam);
      if (p) {
        setProgram(p);
        setScreen('testintro');
        return;
      }
    }
    setScreen('program');
  }, [data, searchParams, resumeData]);

  // ─── LocalStorage ───
  function safeStorage() {
    try {
      const k = "__fosselat_probe__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return window.localStorage;
    } catch { return null; }
  }

  function saveProgress(sess) {
    const s = safeStorage();
    if (!s || !sess) return;
    try { s.setItem(STORAGE_KEY, JSON.stringify({ v: 2, savedAt: Date.now(), session: sess, userId: user?.id || null })); }
    catch { /* quota */ }
  }

  function clearProgress() {
    const s = safeStorage();
    if (!s) return;
    try { s.removeItem(STORAGE_KEY); LEGACY_KEYS.forEach(k => s.removeItem(k)); } catch {}
  }

  function loadSnapshot(appData) {
    const s = safeStorage();
    if (!s) return null;
    try {
      const raw = s.getItem(STORAGE_KEY);
      if (!raw) return null;
      const snap = JSON.parse(raw);
      if (!snap || snap.v !== 2 || !snap.session) return null;
      if (!snap.savedAt || Date.now() - snap.savedAt > MAX_SAVE_AGE_MS) return null;
      if (snap.userId !== (user?.id || null)) return null;
      const sess = snap.session;
      const t = appData.tracks.find(tr => tr.id === sess.trackId);
      const p = t && t.programs.find(pr => pr.id === sess.programId);
      if (!t || !p || (sess.audience !== "kids" && sess.audience !== "adults")) return null;
      const fixed = Placement.rehydrate(sess, p);
      if (!fixed) return null;
      return { track: t, program: p, session: fixed };
    } catch { return null; }
  }

  function setAccent(trackId) {
    document.documentElement.style.setProperty("--accent", ACCENTS[trackId] || "var(--color-gold)");
    document.documentElement.style.setProperty("--accent-dim", ACCENTS[trackId] || "var(--color-gold-dim)");
  }

  // ─── User info validation ───
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateUserInfo() {
    const errors = {};
    if (!userInfo.name.trim()) errors.name = "Please enter your name";
    if (userInfo.age.trim() && (isNaN(Number(userInfo.age)) || Number(userInfo.age) < 3 || Number(userInfo.age) > 100)) errors.age = "Please enter a valid age (3-100)";
    if (!userInfo.email.trim()) errors.email = "Please enter your email";
    else if (!validateEmail(userInfo.email)) errors.email = "Please enter a valid email address";
    setUserInfoErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ─── Progress ───
  function updateProgressUI(sess) {
    const s = sess || sessionRef.current;
    if (!s) return;
    const total = s.slots.length;
    let label;
    if (s.phase === "selfReport") {
      label = "Getting started";
    } else {
      const setNo = s.order.length + (s.order.indexOf(s.currentLevel) === -1 ? 1 : 0);
      label = `Set ${Math.max(1, setNo)} · Question ${Math.min(s.index + 1, total)} of ${total}`;
    }
    setProgressPct(Placement.progressFraction(s));
    setProgressLabel(label);
    setProgressVisible(true);
  }

  function focusLine(sess, prog) {
    const info = Placement.levelInfo(prog, sess.audience, sess.currentLevel);
    const bank = Placement.bankOf(prog, sess.audience, sess.currentLevel);
    const name = info ? info.name : "";
    const focus = bank ? bank.focus : "";
    if (!name) return focus;
    if (!focus) return name;
    const norm = x => x.toLowerCase().replace(/[^a-z0-9]/g, "");
    const a = norm(name), b = norm(focus);
    const shorter = a.length <= b.length ? a : b;
    const longer = a.length <= b.length ? b : a;
    if (longer.indexOf(shorter.slice(0, 8)) !== -1) return name;
    return name + " — " + focus;
  }

  // ─── Flow actions ───
  function resetAll() {
    clearProgress();
    setTrack(null); setProgram(null); setSession(null);
    setPendingAudience(null); setResultData(null); setStageInfo(null);
    setProgressVisible(false); setSelected(null);
    setEmailSent(false); setEmailError(null);
    setAccent(null);
    const found = data ? loadSnapshot(data) : null;
    setResumeData(found);
    setScreen('welcome');
  }

  function doResume() {
    if (!resumeData) return;
    const { track: t, program: p, session: s } = resumeData;
    setTrack(t); setProgram(p); setSession(s);
    setPendingAudience(s.audience);
    setAccent(t.id);
    setResumeData(null);
    if (s.phase === "complete") {
      const result = Placement.finalizePlacement(s, p, t);
      clearProgress();
      setResultData(result);
      setProgressVisible(false);
      setScreen('results');
    } else if (s.phase === "selfReport") {
      updateProgressUI(s);
      setScreen('selfreport');
    } else {
      updateProgressUI(s);
      setScreen('question');
    }
  }



  function handleTrackSelect(t) {
    setTrack(t);
    setAccent(t.id);
    setProgram(null);
    setScreen('program');
  }

  function handleProgramSelect(p) {
    setProgram(p);
    setScreen('testintro');
  }

  function startTest(aud) {
    if (!track || !program || !aud) { resetAll(); return; }
    setPendingAudience(aud);
    clearProgress();
    const sess = Placement.startPlacement(track.id, program.id, aud, program);
    setSession(sess);
    saveProgress(sess);
    updateProgressUI(sess);
    setScreen('selfreport');
  }

  function handleSelfReport(idx) {
    const sr = Placement.selfReportOf(program, pendingAudience);
    const claim = sr.options[idx] ? sr.options[idx].claimLevel : session.levelIds[0];
    const updated = { ...session };
    Placement.applySelfReport(updated, program, claim);
    setSession(updated);
    saveProgress(updated);
    updateProgressUI(updated);
    
    setStageInfo({
      eyebrow: "Let's start here.",
      title: "Answer a few short questions.",
      message: "Do well, and we'll move you up automatically.",
      focus: focusLine(updated, program),
      cta: "Begin"
    });
    setScreen('stage');
  }

  function askQuestion() {
    const sess = sessionRef.current;
    if (!sess || sess.phase === "complete") { finalize(sess); return; }
    const q = Placement.currentQuestion(sess, program);
    if (!q) { handleLevelComplete(); return; }
    setSelected(Placement.currentSlot(sess)?.response ?? null);
    updateProgressUI(sess);
    setScreen('question');
  }

  function submitAnswer(response) {
    const sess = { ...sessionRef.current };
    Placement.answerCurrent(sess, response);
    const levelDone = Placement.goNext(sess);
    setSession(sess);
    saveProgress(sess);
    if (levelDone) {
      handleLevelCompleteWith(sess);
    } else {
      setSelected(null);
      updateProgressUI(sess);
    }
  }

  function handleLevelComplete() {
    handleLevelCompleteWith(sessionRef.current);
  }

  function handleLevelCompleteWith(sess) {
    const outcome = Placement.completeLevel(sess, program);
    setSession({ ...sess });
    saveProgress(sess);

    if (outcome.done) {
      finalize(sess);
      return;
    }

    updateProgressUI(sess);
    const focus = focusLine(sess, program);

    const up = [
      { eyebrow: "Well done!", title: "Great job!", message: "Let's see if you're ready for the next level." },
      { eyebrow: "Excellent!", title: "Nicely done.", message: "You're doing well — let's try a few more questions." },
      { eyebrow: "Great work!", title: "That was strong.", message: "Let's check the next level and see how far you can go." },
    ];
    const down = [
      { eyebrow: "Thank you!", title: "Let's try something else.", message: "Those were a little tricky, so here are some questions that fit you better." },
      { eyebrow: "No problem!", title: "Let's adjust.", message: "We'll ask a few different questions so we can find the best starting point for you." },
    ];
    const pool = outcome.passed ? up : down;
    const pick = pool[Math.floor(Math.random() * pool.length)];

    setStageInfo({ ...pick, focus, cta: "Continue" });
    setScreen('stage');
  }

  function goBackQuestion() {
    const sess = { ...sessionRef.current };
    Placement.goBack(sess);
    setSession(sess);
    saveProgress(sess);
    const slot = Placement.currentSlot(sess);
    setSelected(slot?.response ?? null);
    updateProgressUI(sess);
  }

  function finalize(sess) {
    const s = sess || sessionRef.current;
    const result = Placement.finalizePlacement(s, program, track);
    clearProgress();
    setResultData(result);
    setProgressVisible(false);
    setScreen('results');
  }

  // ─── Send to Academy ───
  async function sendToAcademy() {
    if (!resultData || !userInfo.email) return;
    setSendingEmail(true);
    setEmailError(null);
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API}/placement/send-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo: { 
            name: userInfo.name, 
            age: userInfo.age, 
            email: userInfo.email,
            student_id: user?.id || undefined
          },
          results: {
            trackLabel: resultData.trackLabel,
            programLabel: resultData.programLabel,
            audienceLabel: resultData.audienceLabel,
            recommendedLevel: resultData.recommendedLevel?.name || `Level ${resultData.recommendedLevelId}`,
            recommendedLevelId: resultData.recommendedLevelId,
            totalLevels: resultData.totalLevels,
            score: Math.round(resultData.levelScores.reduce((a, l) => a + l.pct, 0) / (resultData.levelScores.length || 1) * 100),
            levelScores: resultData.levelScores,
            strengths: resultData.strengths.map(s => ({ skill: s.skill, pct: Math.round(s.pct * 100) })),
            weaknesses: resultData.weaknesses.map(s => ({ skill: s.skill, pct: Math.round(s.pct * 100) })),
            duration: resultData.duration,
            summary: resultData.summary,
            nextStep: resultData.nextStep,
          },
        }),
      });
      const json = await res.json();
      if (json.success) { setEmailSent(true); }
      else { setEmailError(json.message || 'Failed to send results'); }
    } catch (err) {
      setEmailError('Network error. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  }


  const { user } = useAuth();
  const [currentUserId, setCurrentUserId] = useState(user?.id || null);

  useEffect(() => {
    if (user?.id !== currentUserId) {
      resetAll();
      setCurrentUserId(user?.id || null);
    }
  }, [user?.id, currentUserId]);

  useEffect(() => {
    if (user) {
      setUserInfo({ name: user.full_name || '', email: user.email || '', age: user.age ? String(user.age) : '' });
    }
  }, [user]);

  useEffect(() => {
    if (screen === 'results' && resultData && userInfo.email && !emailSent && !sendingEmail && !emailError) {
      sendToAcademy();
    }
  }, [screen, resultData, userInfo.email, emailSent, sendingEmail, emailError]);

  // ─── Render Screens ───
  const renderWelcome = () => (
    <div className="pt-screen">
      <div className="pt-card pt-card-hero">
        <h1 className="pt-display">Determine your path.</h1>
        <p className="pt-lede">Our adaptive assessment finds exactly where you should start in our curriculum.</p>
        {resumeData && (
          <div className="pt-resume-banner">
            <p>You have a saved session: <strong>{resumeData.track.label} — {resumeData.program.label}</strong></p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button className="pt-btn pt-btn-primary" onClick={doResume}>Resume</button>
              <button className="pt-btn pt-btn-ghost" onClick={() => { clearProgress(); setResumeData(null); }}>Start Fresh Instead</button>
            </div>
          </div>
        )}
        <button className="pt-btn pt-btn-primary pt-btn-lg" style={{ marginTop: '32px' }} onClick={() => {
          if (user && user.age) {
            handleAudienceSelect(parseInt(user.age) >= 15, true);
          } else {
            setScreen('track');
          }
        }}>
          Begin Assessment
        </button>
      </div>
    </div>
  );

  const handleAudienceSelect = (isAdult, skipAgeOverride = false) => {
    if (!skipAgeOverride) {
      setUserInfo({ ...userInfo, age: isAdult ? '25' : '10' });
    }
    setPendingAudience(isAdult ? 'adults' : 'kids');
    if (!track) {
      setScreen('track');
    } else if (!program) {
      setScreen('program');
    } else {
      setScreen('testintro');
    }
  };



  const renderTrack = () => (
    <div className="pt-screen">
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <button className="pt-btn pt-btn-ghost pt-back-btn" style={{ padding: '4px 12px', marginLeft: '-12px' }} onClick={() => setScreen('welcome')}>← Back</button>
      </div>
      <div className="pt-step-head">
        <div className="pt-eyebrow">Step 1</div>
        <h1 className="pt-display-sm">Choose a subject track</h1>
      </div>
      <div className="pt-choice-grid pt-choice-grid-3">
        {data?.tracks.map(t => (
          <button key={t.id} className="pt-choice-card" style={{ '--card-accent': ACCENTS[t.id] }} onClick={() => handleTrackSelect(t)}>
            <span className="cc-icon">{INITIALS[t.id]}</span>
            <span className="cc-title">{t.label}</span>
            <span className="cc-desc">{t.tagline}</span>
          </button>
        ))}
      </div>
    </div>
  );

  
  useEffect(() => {
    if (screen === 'testintro' && user && program) {
      const ageAud = (user.age && user.age < 16) ? 'kids' : 'adults';
      startTest(ageAud);
    }
  }, [screen, user, program]);

const renderProgram = () => {
    const trackParam = searchParams.get('track');
    return (
      <div className="pt-screen">
        <div style={{ width: '100%', marginBottom: '20px' }}>
          <button className="pt-btn pt-btn-ghost pt-back-btn" style={{ padding: '4px 12px', marginLeft: '-12px' }} onClick={() => { setProgram(null); setScreen('track'); }}>← Back</button>
        </div>
        <div className="pt-step-head">
          <div className="pt-eyebrow">Step 2</div>
          <h1 className="pt-display-sm">Choose a program — {track?.label}</h1>
        </div>
      <div className="pt-choice-list">
        {track?.programs.map(p => (
          <button key={p.id} className="pt-choice-row" style={{ '--card-accent': ACCENTS[track.id] }} onClick={() => handleProgramSelect(p)}>
            <span>
              <span className="cr-title">{p.label}</span>
              <span className="cr-desc">{p.description}</span>
            </span>
            <span className="cr-arrow">→</span>
          </button>
        ))}
    </div>
      </div>
    );
  };

  const renderTestIntro = () => {
    const qpl = Placement.serveCount(pendingAudience || 'adults');
    const levels = program ? Placement.levelsOf(program, pendingAudience || 'adults') : [];
    const minQ = 1 + qpl;
    const maxQ = 1 + qpl * Math.min(levels.length, 4);
    const hasProgramParam = searchParams.get('program');
    
    return (
      <div className="pt-screen">
        {!hasProgramParam && (
          <div style={{ width: '100%', maxWidth: 560, margin: '0 auto 20px' }}>
            <button className="pt-btn pt-btn-ghost pt-back-btn" style={{ padding: '4px 12px', marginLeft: '-12px' }} onClick={() => setScreen('program')}>← Back</button>
          </div>
        )}
        <div className="pt-card pt-card-narrow">
          <div className="pt-eyebrow">{track?.label} · {program?.label}</div>
          <h2 className="pt-display-sm" style={{ marginBottom: '16px' }}>Ready when you are.</h2>
          <p className="pt-lede" style={{ fontSize: '0.95rem', marginBottom: '24px' }}>
            A short adaptive test. Each level has its own small set of questions — the system adjusts as you go.
          </p>
          
          {!user && (
            <div className="pt-userinfo-form" style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-bg-dark)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#fff' }}>Tell us about yourself</h3>
              <div className="pt-form-group">
                <label>Full Name <span style={{ color: 'var(--color-gold)' }}>*</span></label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={userInfo.name}
                  onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                  className={userInfoErrors.name ? 'pt-input-error' : ''}
                  required
                />
                {userInfoErrors.name && <span className="pt-error-text">{userInfoErrors.name}</span>}
              </div>
              <div className="pt-form-group">
                <label>Age <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85em', fontWeight: 'normal' }}>(Optional)</span></label>
                <input
                  type="number"
                  placeholder="Enter your age"
                  value={userInfo.age}
                  onChange={e => setUserInfo({ ...userInfo, age: e.target.value })}
                  className={userInfoErrors.age ? 'pt-input-error' : ''}
                  min="3" max="100"
                />
                {userInfoErrors.age && <span className="pt-error-text">{userInfoErrors.age}</span>}
              </div>
              <div className="pt-form-group">
                <label>Email <span style={{ color: 'var(--color-gold)' }}>*</span></label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={userInfo.email}
                  onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
                  className={userInfoErrors.email ? 'pt-input-error' : ''}
                  required
                />
                {userInfoErrors.email && <span className="pt-error-text">{userInfoErrors.email}</span>}
              </div>
            </div>
          )}

          <div className="pt-intro-stats">
            <div><dt>Questions</dt><dd>{minQ}–{maxQ}</dd></div>
            <div><dt>Est. Time</dt><dd>{Math.max(2, Math.round(minQ * 0.4))}–{Math.max(4, Math.round(maxQ * 0.5))} min</dd></div>
            <div><dt>Choices</dt><dd>Multiple choice</dd></div>
          </div>
          <button className="pt-btn pt-btn-primary pt-btn-block" onClick={() => {
            if (!user) {
              if (!validateUserInfo()) return;
              const ageNum = userInfo.age.trim() ? parseInt(userInfo.age, 10) : 25;
              startTest(ageNum < 16 ? 'kids' : 'adults');
            } else {
              startTest((user.age && user.age < 16) ? 'kids' : 'adults');
            }
          }}>
            Start Test
          </button>
        </div>
      </div>
    );
  };

  const renderSelfReport = () => {
    if (!session || !program || !pendingAudience) return null;
    const sr = Placement.selfReportOf(program, pendingAudience);
    if (!sr) return null;
    return (
      <div className="pt-screen">
        <div className="pt-card pt-card-narrow">
          <div className="pt-eyebrow">{track?.label} · {program?.label}</div>
          <h2 className="pt-display-sm" style={{ marginBottom: '24px' }}>{sr.prompt}</h2>
          <div className="pt-choice-list">
            {sr.options.map((opt, idx) => (
              <button key={idx} className="pt-choice-row" onClick={() => handleSelfReport(idx)}>
                <span className="cr-title">{opt.label}</span>
                <span className="cr-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStage = () => {
    if (!stageInfo) return null;
    return (
      <div className="pt-screen">
        <div className="pt-card pt-card-hero" style={{ maxWidth: 500 }}>
          <p className="pt-step-label">{stageInfo.eyebrow}</p>
          <h2 className="pt-display" style={{ fontSize: '1.6rem' }}>{stageInfo.title}</h2>
          <p className="pt-lede">{stageInfo.message}</p>
          {stageInfo.focus && <p className="pt-stage-focus">{stageInfo.focus}</p>}
          <button className="pt-btn pt-btn-primary pt-btn-lg" onClick={() => { setSelected(null); askQuestion(); }}>
            {stageInfo.cta}
          </button>
        </div>
      </div>
    );
  };

  const renderQuestion = () => {
    if (!session || !program) return null;
    const q = Placement.currentQuestion(session, program);
    if (!q) return null;
    const info = Placement.levelInfo(program, session.audience, session.currentLevel);
    const bank = Placement.bankOf(program, session.audience, session.currentLevel);
    const isLast = session.index === session.slots.length - 1;
    const canBack = Placement.canGoBack(session);

    return (
      <div className="pt-screen">
        <div className="pt-card pt-card-question">
          <div className="pt-q-stage">
            {info?.name || ''}{bank?.focus ? ` · ${bank.focus}` : ''}
          </div>
          <h3 className="pt-q-prompt">{q.prompt}</h3>
          {q.arabic && (
            <div className="pt-q-stimulus-wrap">
              <div className={`pt-q-stimulus ${q.arabic.length > 24 ? '' : 'small'}`} lang="ar" dir="rtl">{q.arabic}</div>
            </div>
          )}
          <div className={`pt-q-options${q.optionsArabic ? ' pt-q-options-ar' : ''}`}>
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                className={`pt-q-option${selected === idx ? ' is-picked' : ''}`}
                onClick={() => setSelected(idx)}
              >
                <span className="opt-mark">{String.fromCharCode(65 + idx)}</span>
                <span className={q.optionsArabic ? 'opt-ar' : ''}>{opt}</span>
              </button>
            ))}
          </div>
          <div className="pt-q-actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '20px' }}>
            <div>
              {canBack && (
                <button className="pt-btn pt-btn-ghost" onClick={goBackQuestion}>← Back</button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="pt-btn pt-btn-ghost" onClick={() => { submitAnswer(null); setSelected(null); }}>Skip</button>
              <button
                className="pt-btn pt-btn-primary"
                disabled={selected === null}
                onClick={() => { submitAnswer(selected); setSelected(null); }}
              >
                {isLast ? 'Finish' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
        {progressVisible && (
          <div className="pt-progress-wrap" style={{ marginTop: '32px' }}>
            <div className="pt-progress-label">{progressLabel}</div>
            <div className="pt-progress-track">
              <div className="pt-progress-fill" style={{ width: `${Math.round(progressPct * 100)}%`, transition: 'width 0.5s ease' }}></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    if (!resultData) return null;
    const accent = ACCENTS[resultData.trackId] || "var(--color-gold)";

    return (
      <div className="pt-screen">
        {!user ? (
          <div className="pt-results-hero pt-rh-card-highlight" style={{ '--card-accent': accent }}>
            <svg className="rh-motif" viewBox="0 0 100 100" aria-hidden="true">
              <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" />
              <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" transform="rotate(45 50 50)" />
            </svg>
            <p className="pt-rh-eyebrow">Recommended Starting Level</p>
            <p className="pt-rh-level-tag">Level {resultData.recommendedLevelId} of {resultData.totalLevels}</p>
            <h2 className="pt-rh-level">{resultData.recommendedLevel?.name || `Level ${resultData.recommendedLevelId}`}</h2>
            <p className="pt-rh-program">{resultData.trackLabel} — {resultData.programLabel}</p>
            {resultData.recommendedLevel?.desc && (
              <p className="pt-rh-level-desc">"{resultData.recommendedLevel.desc}"</p>
            )}
          </div>
        ) : (
          <div className="pt-results-hero" style={{ '--card-accent': accent }}>
            <svg className="rh-motif" viewBox="0 0 100 100" aria-hidden="true">
              <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" />
              <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" transform="rotate(45 50 50)" />
            </svg>
            <h2 className="pt-rh-level">Assessment Complete</h2>
            <p className="pt-rh-program">{resultData.trackLabel} — {resultData.programLabel}</p>
          </div>
        )}

        {/* Level score bars */}
        {resultData.levelScores.length > 0 && (
          <div className="pt-level-scores">
            <h3>Level-by-Level Results</h3>
            {resultData.levelScores.map(ls => (
              <div key={ls.level} className={`pt-level-row ${ls.passed ? 'passed' : 'failed'}`}>
                <div className="pt-level-row-header">
                  <span className="pt-level-row-name">{ls.name}</span>
                  <span className="pt-level-row-score">{ls.correct}/{ls.total} ({Math.round(ls.pct * 100)}%)</span>
                </div>
                <div className="pt-level-bar-track">
                  <div className="pt-level-bar-fill" style={{ width: `${Math.round(ls.pct * 100)}%` }} />
                  <div className="pt-level-bar-threshold" style={{ left: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-results-grid">
          <div className="pt-results-card">
            <h3>Strengths</h3>
            <ul>
              {resultData.strengths.length ? resultData.strengths.map(s => (
                <li key={s.skill}><span className="tag-dot ok" /><span>{s.skill} <strong>({Math.round(s.pct * 100)}%)</strong></span></li>
              )) : <li>Building across the board — a full profile will sharpen as you continue.</li>}
            </ul>
          </div>
          <div className="pt-results-card">
            <h3>Areas to Build</h3>
            <ul>
              {resultData.weaknesses.length ? resultData.weaknesses.map(s => (
                <li key={s.skill}><span className="tag-dot watch" /><span>{s.skill} <strong>({Math.round(s.pct * 100)}%)</strong></span></li>
              )) : <li>No specific gaps stood out — nicely balanced.</li>}
            </ul>
          </div>
        </div>

        {!user && resultData.duration && (
          <div className="pt-results-grid" style={{ marginTop: '20px' }}>
            <div className="pt-results-card">
              <h3>Estimated Duration</h3>
              <div className="stat-big">{resultData.duration.label}</div>
              <div className="stat-sub">{resultData.duration.note}</div>
            </div>
            <div className="pt-results-card">
              <h3>Recommended Pace</h3>
              <div className="stat-big">{resultData.duration.lessonsPerWeek}</div>
              <div className="stat-sub">Suggested weekly lessons to progress steadily</div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="pt-results-summary" style={{ marginTop: '32px' }}>
          <p>{resultData.summary}</p>
          <p className="pt-results-nextstep" style={{ marginTop: '12px' }}>{resultData.nextStep}</p>
        </div>

        <div className="pt-results-actions" style={{ flexDirection: 'column', alignItems: 'center' }}>
          {sendingEmail ? (
            <div className="pt-email-success" style={{ color: 'var(--color-cream)', marginBottom: '16px' }}>
              <div className="pt-loading-spinner" style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
              Saving and sending your results...
            </div>
          ) : emailSent ? (
            <div className="pt-email-success" style={{ marginBottom: '16px' }}>
              <span>✅</span> Results sent to <strong>{userInfo.email}</strong> and saved!
            </div>
          ) : emailError ? (
            <p className="pt-error-text" style={{ marginBottom: '16px', fontSize: '1rem' }}>{emailError}</p>
          ) : null}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="pt-btn pt-btn-primary" onClick={() => { clearProgress(); setSession(null); setResultData(null); setEmailSent(false); setScreen('track'); }}>
              Explore Another Program
            </button>
            <button className="pt-btn pt-btn-ghost" onClick={() => { setEmailSent(false); startTest(); }}>
              Retake This Assessment
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Main Render ───
  if (!data) {
    return (
      <div className="placement-test-container">
        <main className="pt-main">
          <div className="pt-screen">
            <div className="pt-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div className="pt-loading-spinner" />
              <p style={{ marginTop: '20px', color: 'var(--color-text-muted)' }}>Loading assessment…</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="placement-test-container">
      <main className="pt-main">
        {screen === 'welcome' && renderWelcome()}
                {screen === 'track' && renderTrack()}
        {screen === 'program' && renderProgram()}
        {screen === 'testintro' && renderTestIntro()}
        {screen === 'selfreport' && renderSelfReport()}
        {screen === 'stage' && renderStage()}
        {screen === 'question' && renderQuestion()}
        {screen === 'results' && renderResults()}
      </main>
    </div>
  );
}