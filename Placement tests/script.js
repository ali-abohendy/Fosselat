/**
 * script.js — application controller. Owns the flow and wires ui.js
 * (rendering) to scoring.js (the placement engine). Classic script; runs after
 * scoring.js and ui.js are loaded.
 *
 * The whole assessment is automatic: every answer is graded by the engine and
 * the level is decided by the engine. No teacher input exists anywhere.
 *
 * Progress is checkpointed to localStorage after every answer, so a refresh, a
 * closed tab or a returning student continues exactly where they stopped. All
 * storage access is wrapped in try/catch: private browsing or a full quota
 * degrades to "no resume", never to a crash.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "fosselat_placement_v2";
  const LEGACY_KEYS = ["fosselat_placement_progress_v1"];
  const MAX_SAVE_AGE_MS = 7 * 24 * 3600 * 1000;

  let DATA = null;
  let track = null;
  let program = null;
  let session = null;

  // ------------------------------------------------------------------
  // Data
  // ------------------------------------------------------------------
  function loadData() {
    const node = document.getElementById("questions-data");
    DATA = JSON.parse(node.textContent);
    Placement.configure(DATA.meta);
  }

  function findTrack(id) { return DATA.tracks.find(t => t.id === id) || null; }
  function findProgram(t, id) { return t ? (t.programs.find(p => p.id === id) || null) : null; }

  // ------------------------------------------------------------------
  // Persistence
  // ------------------------------------------------------------------
  function safeStorage() {
    try {
      const k = "__fosselat_probe__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }
  const storage = safeStorage();

  function saveProgress() {
    if (!storage || !session) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, savedAt: Date.now(), session: session }));
    } catch (e) { /* non-critical */ }
  }

  function clearProgress() {
    if (!storage) return;
    try {
      storage.removeItem(STORAGE_KEY);
      LEGACY_KEYS.forEach(k => storage.removeItem(k));
    } catch (e) { /* ignore */ }
  }

  function loadSnapshot() {
    if (!storage) return null;
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const snap = JSON.parse(raw);
      if (!snap || snap.v !== 2 || !snap.session) return null;
      if (!snap.savedAt || Date.now() - snap.savedAt > MAX_SAVE_AGE_MS) return null;
      const s = snap.session;
      const t = findTrack(s.trackId);
      const p = findProgram(t, s.programId);
      if (!t || !p || (s.audience !== "kids" && s.audience !== "adults")) return null;
      const fixed = Placement.rehydrate(s, p);
      if (!fixed) return null;
      return { track: t, program: p, session: fixed };
    } catch (e) {
      return null;
    }
  }

  function offerResumeIfAvailable() {
    const found = loadSnapshot();
    if (!found) { UI.setResumeAvailable(false); return; }
    const audienceLabel = found.session.audience === "kids" ? "Kids" : "Adults";
    UI.setResumeAvailable(true,
      found.track.label + " — " + found.program.label + " (" + audienceLabel + ")",
      () => {
        track = found.track;
        program = found.program;
        session = found.session;
        UI.setAccent(track.id);
        continueSession();
      },
      () => { clearProgress(); UI.setResumeAvailable(false); });
  }

  // ------------------------------------------------------------------
  // Navigation
  // ------------------------------------------------------------------
  function resetAll() {
    clearProgress();
    track = null; program = null; session = null;
    UI.setAccent(null);
    UI.setProgress(false);
    offerResumeIfAvailable();
    UI.showScreen("welcome");
  }

  function goAudience() {
    UI.setProgress(false);
    UI.renderAudience(id => {
      pendingAudience = id;
      goTrack();
    });
    UI.showScreen("audience");
  }

  let pendingAudience = null;

  function goTrack() {
    UI.setProgress(false);
    UI.renderTracks(DATA.tracks, t => {
      track = t;
      UI.setAccent(t.id);
      goProgram();
    });
    UI.showScreen("track");
  }

  function goProgram() {
    UI.renderPrograms(track, p => {
      program = p;
      UI.renderTestIntro(track, program, pendingAudience, Placement.CONFIG.QUESTIONS_PER_LEVEL);
      UI.showScreen("testintro");
    });
    UI.showScreen("program");
  }

  // ------------------------------------------------------------------
  // The assessment
  // ------------------------------------------------------------------
  function startTest() {
    if (!track || !program || !pendingAudience) { resetAll(); return; }
    clearProgress();
    session = Placement.startPlacement(track.id, program.id, pendingAudience, program);
    saveProgress();
    askSelfReport();
  }

  function continueSession() {
    if (!session) { resetAll(); return; }
    pendingAudience = session.audience;
    if (session.phase === "complete") { finalize(); return; }
    if (session.phase === "selfReport") { askSelfReport(); return; }
    askQuestion();
  }

  function updateProgressUI() {
    const total = session.slots.length;
    let label;
    if (session.phase === "selfReport") {
      label = "Getting started";
    } else {
      const setNo = session.order.length + (session.order.indexOf(session.currentLevel) === -1 ? 1 : 0);
      label = "Set " + Math.max(1, setNo) + " · Question " + Math.min(session.index + 1, total) + " of " + total;
    }
    UI.setProgress(true, Placement.progressFraction(session), label);
  }

  /** "Level name — focus", without repeating itself when the two are the same. */
  function focusLine(levelId) {
    const info = Placement.levelInfo(program, session.audience, levelId);
    const bank = Placement.bankOf(program, session.audience, levelId);
    const name = info ? info.name : "";
    const focus = bank ? bank.focus : "";
    if (!name) return focus;
    if (!focus) return name;
    // treat "Juz Amma & Foundational Surahs" / "Juz' Amma (Juz 30)" as the same thing
    const norm = x => x.toLowerCase().replace(/[^a-z0-9]/g, "");
    const a = norm(name), b = norm(focus);
    const shorter = a.length <= b.length ? a : b;
    const longer = a.length <= b.length ? b : a;
    if (longer.indexOf(shorter.slice(0, 8)) !== -1) return name;
    return name + " — " + focus;
  }

  function askSelfReport() {
    const sr = Placement.selfReportOf(program, session.audience);
    updateProgressUI();
    UI.showScreen("question");
    UI.renderSelfReport({
      trackLabel: track.label,
      programLabel: program.label,
      prompt: sr.prompt,
      options: sr.options,
    }, idx => {
      const claim = sr.options[idx] ? sr.options[idx].claimLevel : session.levelIds[0];
      Placement.applySelfReport(session, program, claim);
      saveProgress();
      updateProgressUI();
      UI.renderStage({
        eyebrow: "Thanks!",
        title: "Let's start here.",
        message: "Answer a few short questions. If you do well, we'll move you up to the next level automatically.",
        focus: focusLine(session.currentLevel),
        cta: "Start",
      }, askQuestion);
      UI.showScreen("stage");
    });
  }

  function askQuestion() {
    if (session.phase === "complete") { finalize(); return; }
    const q = Placement.currentQuestion(session, program);
    if (!q) { handleLevelComplete(); return; }
    const info = Placement.levelInfo(program, session.audience, session.currentLevel);
    const bank = Placement.bankOf(program, session.audience, session.currentLevel);
    const slot = Placement.currentSlot(session);
    updateProgressUI();
    UI.showScreen("question");
    UI.renderQuestion({
      trackLabel: track.label,
      levelName: info ? info.name : "",
      focus: bank ? bank.focus : "",
      question: q,
      preset: slot ? slot.response : null,
      canBack: Placement.canGoBack(session),
      isLast: session.index === session.slots.length - 1,
    }, {
      onAnswer: idx => submit(idx),
      onSkip: () => submit(null),
      onBack: () => { Placement.goBack(session); saveProgress(); askQuestion(); },
    });
  }

  function submit(response) {
    Placement.answerCurrent(session, response);
    const levelDone = Placement.goNext(session);
    saveProgress();
    if (levelDone) handleLevelComplete();
    else askQuestion();
  }

  function handleLevelComplete() {
    const outcome = Placement.completeLevel(session, program);
    saveProgress();

    if (outcome.done) {
      finalize();
      return;
    }
    updateProgressUI();
    const focus = focusLine(session.currentLevel);

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

    UI.renderStage({
      eyebrow: pick.eyebrow,
      title: pick.title,
      message: pick.message,
      focus: focus,
      cta: "Continue",
    }, askQuestion);
    UI.showScreen("stage");
  }

  function finalize() {
    const result = Placement.finalizePlacement(session, program, track);
    clearProgress();
    UI.renderResults(result, track);
    UI.showScreen("results");
  }

  // ------------------------------------------------------------------
  // Wiring
  // ------------------------------------------------------------------
  function init() {
    loadData();

    document.getElementById("btnStart").addEventListener("click", goAudience);
    document.getElementById("btnStartTest").addEventListener("click", startTest);
    document.getElementById("brandHome").addEventListener("click", resetAll);

    document.getElementById("app").addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.id === "btnRetakeTrack") { clearProgress(); session = null; goTrack(); }
      if (btn.id === "btnRetakeSame") { startTest(); }
      if (btn.id === "btnPrint") { window.print(); }
    });

    offerResumeIfAvailable();
    UI.showScreen("welcome");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
