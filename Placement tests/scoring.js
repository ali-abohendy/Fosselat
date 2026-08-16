/**
 * scoring.js — Fosselat Academy adaptive placement engine.
 *
 * ONE centralized engine. Pure logic: no DOM, no globals except `Placement`.
 * Loaded as a classic script so the app runs from file:// with no build step.
 *
 * HOW PLACEMENT WORKS
 * -------------------
 *   1. The student answers ONE un-scored self-report question. It only decides
 *      where verification starts — it never decides the final level.
 *   2. Verification starts one level BELOW the claimed level (prerequisite
 *      check), never below the first level.
 *   3. Each level is assessed with its OWN small set of questions drawn from
 *      that level's own bank, and scored on its own. A level's score is never
 *      mixed with any other level's score.
 *   4. >= MASTERY_THRESHOLD  -> level mastered, move UP to the next level.
 *      <  MASTERY_THRESHOLD  -> stop going up. If we have not yet proved the
 *      level below, step DOWN and check it, until a level is mastered or the
 *      first level is reached.
 *   5. Final placement is computed from demonstrated performance only.
 *
 * The only knobs are in CONFIG below (and in questions.json -> meta.config,
 * which overrides them at load time).
 */
const Placement = (function () {

  const CONFIG = {
    // Mastery threshold for EVERY level in the whole application.
    // 0.60 => 60%. Exactly 60% passes; 59% does not.
    MASTERY_THRESHOLD: 0.60,

    // How many questions are asked per level. Children answer fewer, so the
    // test stays short for them; adults answer more, which makes a lucky pass
    // vanishingly unlikely (12 four-option questions: ~0.04% chance of
    // reaching 60% by guessing alone).
    QUESTIONS_PER_LEVEL: { kids: 10, adults: 12 },

    // Difficulty mix of one served set. Levels are separated by the SKILL
    // being tested; within a level this spread stops a set being all-easy or
    // all-hard by accident.
    DIFFICULTY_MIX: { easy: 0.3, medium: 0.45, hard: 0.25 },

    // How far below the claimed level verification begins (prerequisite check).
    PREREQUISITE_LOOKBACK: 1,

    // "firstUnmastered" -> start at the level that was not mastered yet
    //                      (mastered 1 and 2, failed 3  ->  start at Level 3)
    // "highestMastered" -> start at the highest level proven
    //                      (mastered 1 and 2, failed 3  ->  start at Level 2)
    PLACEMENT_MODE: "firstUnmastered",

    // Floating-point guard so a computed 0.6 never reads as 0.5999999 -> fail.
    EPSILON: 1e-9,
  };

  /** Apply meta.config from the data file (single source of truth for tuning). */
  function configure(meta) {
    const c = (meta && meta.config) || {};
    if (typeof c.masteryThreshold === "number") CONFIG.MASTERY_THRESHOLD = c.masteryThreshold;
    if (c.questionsPerLevel) CONFIG.QUESTIONS_PER_LEVEL = c.questionsPerLevel;
    if (c.difficultyMix) CONFIG.DIFFICULTY_MIX = c.difficultyMix;
    if (typeof c.prerequisiteLookback === "number") CONFIG.PREREQUISITE_LOOKBACK = c.prerequisiteLookback;
    if (typeof c.placementMode === "string") CONFIG.PLACEMENT_MODE = c.placementMode;
    return CONFIG;
  }

  // --------------------------------------------------------------------
  // Small helpers
  // --------------------------------------------------------------------
  function pct(earned, max) {
    if (!max) return 0;
    return earned / max;
  }

  /** THE mastery test. Used everywhere; never inline a number instead. */
  function isMastered(levelPct) {
    return levelPct >= CONFIG.MASTERY_THRESHOLD - CONFIG.EPSILON;
  }

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /** How many questions this audience answers per level. */
  function serveCount(audience) {
    const c = CONFIG.QUESTIONS_PER_LEVEL;
    if (typeof c === "number") return c;
    return c[audience] || c.adults || 10;
  }

  function filterQuestionsForAudience(questions, audience) {
    return questions.filter(q => !q.audience || q.audience === "both" || q.audience === audience);
  }

  // --------------------------------------------------------------------
  // Data access
  // --------------------------------------------------------------------
  function levelsOf(program, audience) {
    return (program.levelsByAudience[audience] || []).slice().sort((a, b) => a.id - b.id);
  }
  function levelIdsOf(program, audience) {
    return levelsOf(program, audience).map(l => l.id);
  }
  function levelInfo(program, audience, levelId) {
    return levelsOf(program, audience).find(l => l.id === levelId) || null;
  }
  function bankOf(program, audience, levelId) {
    const banks = program.levelBanksByAudience[audience] || [];
    return banks.find(b => b.level === levelId) || null;
  }
  function questionById(program, audience, qid) {
    const banks = program.levelBanksByAudience[audience] || [];
    for (const b of banks) {
      const q = b.questions.find(x => x.id === qid);
      if (q) return q;
    }
    return null;
  }
  function selfReportOf(program, audience) {
    return program.selfReportByAudience[audience];
  }

  // --------------------------------------------------------------------
  // Question selection — level-specific, skill-balanced, varied per student
  // --------------------------------------------------------------------
  /** Spread items so consecutive picks come from different skills. */
  function skillRoundRobin(items) {
    const bySkill = {};
    shuffled(items).forEach(q => { (bySkill[q.skill] = bySkill[q.skill] || []).push(q); });
    const groups = shuffled(Object.keys(bySkill)).map(k => bySkill[k]);
    const out = [];
    let moved = true;
    while (moved) {
      moved = false;
      for (const g of groups) {
        if (g.length) { out.push(g.shift()); moved = true; }
      }
    }
    return out;
  }

  /**
   * Draw the questions for ONE level from that level's own bank. Never mixes
   * levels. The draw is:
   *   · limited to the questions valid for this audience (already separated in
   *     the data file),
   *   · balanced across the level's skills,
   *   · balanced across easy / medium / hard by DIFFICULTY_MIX, and
   *   · randomised, so two students rarely see the same set.
   * The set is then ordered easy first, which is kinder to a nervous student.
   */
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

    // how many we would like from each band...
    const target = {};
    let assigned = 0;
    BANDS.forEach((b, i) => {
      target[b] = i === BANDS.length - 1 ? want - assigned
        : Math.min(byBand[b].length, Math.round(want * (CONFIG.DIFFICULTY_MIX[b] || 0)));
      assigned += target[b];
    });
    // ...then take what actually exists, and top up from the other bands
    const picked = [];
    BANDS.forEach(b => {
      for (let i = 0; i < target[b] && byBand[b].length; i++) picked.push(byBand[b].shift());
    });
    const leftovers = skillRoundRobin(BANDS.reduce((a, b) => a.concat(byBand[b]), []));
    while (picked.length < want && leftovers.length) picked.push(leftovers.shift());

    const rank = { easy: 0, medium: 1, hard: 2 };
    picked.sort((a, b) => (rank[a.difficulty] || 1) - (rank[b.difficulty] || 1));

    // Present each question with its options in a random order, so students
    // cannot pattern-match "the answer is usually the first option".
    return picked.map(q => ({ id: q.id, order: shuffled(q.options.map((_, i) => i)), response: null }));
  }

  /** Build the display object for a slot ({id, order}) — what the UI renders. */
  function present(program, audience, slot) {
    const q = questionById(program, audience, slot.id);
    if (!q) return null;
    const order = slot.order && slot.order.length === q.options.length
      ? slot.order
      : q.options.map((_, i) => i);
    return {
      id: q.id,
      level: q.level,
      skill: q.skill,
      difficulty: q.difficulty,
      prompt: q.prompt,
      arabic: q.arabic || null,
      options: order.map(i => q.options[i]),
      optionsArabic: !!q.optionsArabic,
      points: q.points || 1,
    };
  }

  /**
   * Grade one answered slot.
   * `slot.response` is the index of the option AS SHOWN, or null when skipped.
   * A skipped question scores 0 but still counts towards the level total —
   * consistently, for every question type.
   */
  function gradeSlot(program, audience, slot) {
    const q = questionById(program, audience, slot.id);
    if (!q) return { earned: 0, max: 0, correct: false, skill: null };
    const max = q.points || 1;
    if (slot.response === null || slot.response === undefined) {
      return { earned: 0, max, correct: false, skill: q.skill, skipped: true };
    }
    const order = slot.order && slot.order.length === q.options.length
      ? slot.order
      : q.options.map((_, i) => i);
    const originalIdx = order[slot.response];
    const correct = originalIdx === q.correct;
    return { earned: correct ? max : 0, max, correct, skill: q.skill, skipped: false };
  }

  // --------------------------------------------------------------------
  // Session lifecycle
  // --------------------------------------------------------------------
  /** Create a fresh, fully serialisable placement session. */
  function startPlacement(trackId, programId, audience, program) {
    return {
      v: 2,
      trackId: trackId,
      programId: programId,
      audience: audience,
      levelIds: levelIdsOf(program, audience),
      claimLevel: null,
      phase: "selfReport",      // selfReport -> testing -> complete
      direction: "up",
      currentLevel: null,
      slots: [],                // question slots for the level being assessed
      index: 0,
      levelResults: [],         // one independent result per level assessed
      askedIds: [],
      order: [],                // levels assessed, in the order they were assessed
    };
  }

  /**
   * Where verification begins. The self-reported level is a hint only: we
   * always start at least one level below it so prerequisites are proven,
   * and we never start above the claimed level.
   */
  function getStartingLevel(session, claimLevel) {
    const ids = session.levelIds;
    const min = ids[0], max = ids[ids.length - 1];
    let claim = Number(claimLevel);
    if (!isFinite(claim)) claim = min;
    claim = Math.max(min, Math.min(max, claim));
    const idx = ids.indexOf(claim);
    const startIdx = Math.max(0, idx - CONFIG.PREREQUISITE_LOOKBACK);
    return ids[startIdx];
  }

  /** Record the self-report answer and load the first level's questions. */
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

  function currentSlot(session) {
    return session.slots[session.index] || null;
  }
  function currentQuestion(session, program) {
    const slot = currentSlot(session);
    return slot ? present(program, session.audience, slot) : null;
  }

  /** Store the answer for the current question (re-answering overwrites). */
  function answerCurrent(session, response) {
    const slot = currentSlot(session);
    if (!slot) return false;
    slot.response = (response === null || response === undefined) ? null : Number(response);
    return true;
  }

  function goNext(session) {
    if (session.index < session.slots.length) session.index++;
    return session.index >= session.slots.length; // true => level finished
  }
  function goBack(session) {
    if (session.index > 0) { session.index--; return true; }
    return false;
  }
  function canGoBack(session) {
    return session.index > 0;
  }

  /** Independent score for the level just completed. */
  function evaluateLevel(session, program) {
    let earned = 0, max = 0;
    const answers = session.slots.map(slot => {
      const g = gradeSlot(program, session.audience, slot);
      earned += g.earned; max += g.max;
      return { id: slot.id, order: slot.order, response: slot.response, earned: g.earned, max: g.max, correct: g.correct, skill: g.skill };
    });
    const p = pct(earned, max);
    return {
      level: session.currentLevel,
      earned: earned,
      max: max,
      pct: p,
      passed: isMastered(p),
      answers: answers,
    };
  }

  function shouldAdvance(levelPct) {
    return isMastered(levelPct);
  }

  /**
   * Close the current level, decide what happens next, and (if the test
   * continues) load the next level's questions.
   * Returns { result, done, passed, direction, nextLevel, isTopLevel }.
   */
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
      // Mastered. Go up — unless we were stepping down (we have found the
      // floor) or this is already the highest level available.
      if (session.direction === "up" && result.level !== max) next = ids[at + 1];
    } else {
      // Not mastered. Only step down if the level below has not been proven.
      if (result.level !== min && !tested(ids[at - 1])) {
        next = ids[at - 1];
        session.direction = "down";
      }
    }

    if (next === null || next === undefined) {
      session.phase = "complete";
      session.slots = [];
      session.index = 0;
      return { result, done: true, passed: result.passed, direction: session.direction, nextLevel: null, isTopLevel: result.level === max };
    }
    loadLevelQuestions(session, program, next);
    return { result, done: false, passed: result.passed, direction: session.direction, nextLevel: next, isTopLevel: false };
  }

  /** Kept as a named step for clarity; completeLevel already loads the level. */
  function advanceToNextLevel(session, program, levelId) {
    return loadLevelQuestions(session, program, levelId);
  }

  // --------------------------------------------------------------------
  // Reporting
  // --------------------------------------------------------------------
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
    if (!weaknesses.length && asc.length && asc[0].pct < 0.9 && !strong.has(asc[0].skill)) {
      weaknesses = [asc[0]];
    }
    return { strengths, weaknesses };
  }

  function estimateDuration(level, program) {
    const fastPace = program.fastPaceNote;
    if (!level || !level.weeks) {
      return {
        label: "Individualized pace",
        note: "Planned with your teacher around your own progress",
        lessonsPerWeek: fastPace || "2x / week (standard pace)",
      };
    }
    const label = level.weeks < 14 ? level.weeks + " weeks" : Math.round(level.weeks / 4.345) + " months";
    return {
      label: label,
      note: (level.lessons || Math.round(level.weeks * 2)) + " lessons to complete this level",
      lessonsPerWeek: fastPace || "2x / week (standard pace)",
    };
  }

  function listLevels(nums) {
    if (!nums.length) return "";
    if (nums.length === 1) return "Level " + nums[0];
    return "Levels " + nums.slice(0, -1).join(", ") + " and " + nums[nums.length - 1];
  }

  /**
   * Final placement — computed from demonstrated performance only. The
   * self-reported answer is reported for reference but never used here.
   */
  function finalizePlacement(session, program, track) {
    const ids = session.levelIds;
    const min = ids[0], max = ids[ids.length - 1];
    const results = session.levelResults.slice().sort((a, b) => a.level - b.level);

    const passedLevels = results.filter(r => r.passed).map(r => r.level);
    const failedLevels = results.filter(r => !r.passed).map(r => r.level);
    const highestMastered = passedLevels.length ? Math.max.apply(null, passedLevels) : null;

    let recommendedId;
    if (CONFIG.PLACEMENT_MODE === "highestMastered") {
      recommendedId = highestMastered === null ? min : highestMastered;
    } else {
      recommendedId = highestMastered === null
        ? min
        : ids[Math.min(ids.indexOf(highestMastered) + 1, ids.length - 1)];
    }

    const recommended = levelInfo(program, session.audience, recommendedId);
    const mastered = highestMastered === null ? null : levelInfo(program, session.audience, highestMastered);
    const levelScores = results.map(r => {
      const info = levelInfo(program, session.audience, r.level);
      const bank = bankOf(program, session.audience, r.level);
      return {
        level: r.level,
        name: info ? info.name : "Level " + r.level,
        focus: bank ? bank.focus : "",
        correct: r.earned,
        total: r.max,
        pct: r.pct,
        passed: r.passed,
      };
    });

    const skills = aggregateSkills(results);
    const sw = buildStrengthsWeaknesses(skills);
    const duration = estimateDuration(recommended, program);

    // Friendly, non-technical summary and next step.
    let summary;
    if (!passedLevels.length) {
      summary = "You are all set to begin at " + (recommended ? recommended.name : "Level " + recommendedId) +
        ". Starting here builds the foundations properly, and you will move up quickly once they are solid.";
    } else if (highestMastered === max && recommendedId === max) {
      summary = "You showed a strong command of " + listLevels(passedLevels).toLowerCase().replace("levels", "Levels") +
        ", including the highest level in this program. You are recommended to begin at " +
        (recommended ? recommended.name : "Level " + recommendedId) + ".";
    } else {
      summary = "Based on your assessment, you demonstrated mastery of " + listLevels(passedLevels) +
        ". You are therefore recommended to begin at Level " + recommendedId +
        (recommended ? " — " + recommended.name : "") + ".";
    }

    const nextStep = "Share these results with Fosselat Academy to enrol in " +
      (recommended ? recommended.name : "Level " + recommendedId) + " of " + program.label +
      ". No further testing is needed — your placement is complete.";

    const claimOption = (selfReportOf(program, session.audience).options || [])
      .find(o => o.claimLevel === session.claimLevel);

    return {
      audience: session.audience,
      audienceLabel: session.audience === "kids" ? "Kids" : "Adults",
      trackId: track ? track.id : session.trackId,
      trackLabel: track ? track.label : session.trackId,
      programId: program.id,
      programLabel: program.label,
      claimLevel: session.claimLevel,
      claimLabel: claimOption ? claimOption.label : "",
      recommendedLevel: recommended,
      recommendedLevelId: recommendedId,
      recommendedPosition: ids.indexOf(recommendedId) + 1,
      totalLevels: ids.length,
      highestMasteredLevel: mastered,
      highestMasteredId: highestMastered,
      levelsPassed: passedLevels,
      levelsNotPassed: failedLevels,
      levelScores: levelScores,
      skills: skills,
      strengths: sw.strengths,
      weaknesses: sw.weaknesses,
      duration: duration,
      summary: summary,
      nextStep: nextStep,
      masteryThreshold: CONFIG.MASTERY_THRESHOLD,
    };
  }

  // --------------------------------------------------------------------
  // Resume support: make a restored session safe to continue.
  // --------------------------------------------------------------------
  function rehydrate(session, program) {
    if (!session || session.v !== 2) return null;
    const ids = levelIdsOf(program, session.audience);
    if (!ids.length) return null;
    session.levelIds = ids;

    // Drop anything that no longer exists in the question data.
    session.levelResults = (session.levelResults || []).filter(r =>
      ids.indexOf(r.level) !== -1 && Array.isArray(r.answers));
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
    if (session.phase === "selfReport") {
      session.slots = [];
      session.index = 0;
    }
    return session;
  }

  /** Progress 0..1 — friendly, and never appears to go backwards. */
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
    CONFIG, configure,
    // data access
    levelsOf, levelIdsOf, levelInfo, bankOf, questionById, selfReportOf,
    filterQuestionsForAudience,
    // engine steps
    startPlacement, getStartingLevel, applySelfReport, loadLevelQuestions, serveCount,
    advanceToNextLevel, selectLevelQuestions, present,
    currentSlot, currentQuestion, answerCurrent, goNext, goBack, canGoBack,
    evaluateLevel, shouldAdvance, completeLevel, finalizePlacement,
    // helpers
    gradeSlot, pct, isMastered, aggregateSkills, buildStrengthsWeaknesses,
    estimateDuration, rehydrate, progressFraction,
  };
})();

// Backwards-compatible alias: older code referred to this module as `Scoring`.
const Scoring = Placement;
