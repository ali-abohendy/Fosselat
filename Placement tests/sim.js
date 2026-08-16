/**
 * sim.js — end-to-end simulation QA for the placement engine.
 * Runs every track / program / audience / self-report claim against a set of
 * simulated students and asserts the placement rules hold.
 *
 *   node sim.js
 */
const fs = require("fs");
const vm = require("vm");

// the app files: next to this script, or in ./out/
const DIR = fs.existsSync(__dirname + "/questions.json") ? __dirname + "/" : __dirname + "/out/";
const DATA = JSON.parse(fs.readFileSync(DIR + "questions.json", "utf8"));

const ctx = vm.createContext({ console });
vm.runInContext(fs.readFileSync(DIR + "scoring.js", "utf8") + "\n;this.__P = Placement;", ctx);
const P = ctx.__P;
P.configure(DATA.meta);

let checks = 0, failures = [];
function ok(cond, msg) {
  checks++;
  if (!cond) failures.push(msg);
}

// ---------------------------------------------------------------------------
// 1. Data integrity
// ---------------------------------------------------------------------------
const AUDS = ["kids", "adults"];
let questionCount = 0;
DATA.tracks.forEach(t => t.programs.forEach(p => AUDS.forEach(aud => {
  const levels = P.levelsOf(p, aud);
  ok(levels.length > 0, `${p.id}/${aud}: no levels`);
  levels.forEach(l => {
    const bank = P.bankOf(p, aud, l.id);
    ok(!!bank, `${p.id}/${aud}/L${l.id}: missing bank`);
    if (!bank) return;
    const serve = P.serveCount(aud);
    ok(bank.questions.length >= serve,
      `${p.id}/${aud}/L${l.id}: pool ${bank.questions.length} < ${serve} served`);
    ok(bank.questions.length >= serve + 4,
      `${p.id}/${aud}/L${l.id}: pool ${bank.questions.length} leaves little variation (serves ${serve})`);
    // difficulty bands present, so a served set can be mixed
    const bands = {};
    bank.questions.forEach(q => { bands[q.difficulty] = (bands[q.difficulty] || 0) + 1; });
    ok(Object.keys(bands).length >= 2, `${p.id}/${aud}/L${l.id}: only one difficulty band ${JSON.stringify(bands)}`);
    // no systematic position bias in the stored data
    const posCount = {};
    bank.questions.forEach(q => { posCount[q.correct] = (posCount[q.correct] || 0) + 1; });
    const worst = Math.max(...Object.values(posCount));
    ok(worst <= bank.questions.length * 0.55,
      `${p.id}/${aud}/L${l.id}: correct answer sits in one position ${worst}/${bank.questions.length} times`);
    // length of the correct option must not give it away
    const plain = bank.questions.filter(q => !q.optionsArabic);
    if (plain.length >= 6) {
      const cor = plain.map(q => q.options[q.correct].length);
      const dis = plain.flatMap(q => q.options.filter((_, i) => i !== q.correct).map(o => o.length));
      const mc = cor.reduce((a, b) => a + b, 0) / cor.length;
      const md = dis.reduce((a, b) => a + b, 0) / dis.length;
      ok(Math.abs(mc - md) / md < 0.18,
        `${p.id}/${aud}/L${l.id}: correct options average ${mc.toFixed(0)} chars vs ${md.toFixed(0)} for distractors`);
    }
    bank.questions.forEach(q => {
      questionCount++;
      ok(q.level === l.id, `${q.id}: level field mismatch`);
      ok(q.type === "mcq", `${q.id}: only mcq is supported now (${q.type})`);
      ok(q.track === t.id && q.program === p.id, `${q.id}: track/program tag mismatch`);
      ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length, `${q.id}: bad correct index`);
      ok(q.options[q.correct] === q.correctAnswer, `${q.id}: correctAnswer text out of sync`);
      ok(q.points === 1, `${q.id}: unexpected points`);
      ok(!!q.skill && !!q.difficulty, `${q.id}: missing skill/difficulty`);
      ok(new Set(q.options).size === q.options.length, `${q.id}: duplicate options`);
      ok(q.options.length >= 2, `${q.id}: too few options`);
      // no question may ask the student to judge their own ability, or depend
      // on a teacher, a recording, or anything a computer cannot grade
      ok(!/(how (often|many times|well) do you|do you follow|rate yourself|your teacher|does your teacher|read (this |the )?(passage|verse) aloud|record yourself|recording|listen to yourself)/i.test(q.prompt),
        `${q.id}: prompt is not objectively gradable: ${q.prompt}`);
      ok(!/complete this (ayah|verse)/i.test(q.prompt), `${q.id}: complete-the-verse items are not allowed`);
    });
  });
  const sr = P.selfReportOf(p, aud);
  ok(sr && sr.options && sr.options.length >= 2, `${p.id}/${aud}: no self-report options`);
  sr.options.forEach(o => ok(P.levelInfo(p, aud, o.claimLevel), `${p.id}/${aud}: claim level ${o.claimLevel} has no level`));
})));

// ---------------------------------------------------------------------------
// 2. Threshold behaviour (60% passes, 59% does not)
// ---------------------------------------------------------------------------
ok(P.CONFIG.MASTERY_THRESHOLD === 0.6, "threshold should default to 0.60");
ok(P.isMastered(0.60) === true, "exactly 60% must PASS");
ok(P.isMastered(0.59) === false, "59% must FAIL");
ok(P.isMastered(0.61) === true, "61% must PASS");
ok(P.isMastered(3 / 5) === true, "3 of 5 (60%) must PASS");
ok(P.isMastered(2 / 5) === false, "2 of 5 (40%) must FAIL");
ok(P.isMastered(6 / 10) === true, "6 of 10 (60%) must PASS");
ok(P.isMastered(5 / 10) === false, "5 of 10 (50%) must FAIL");
ok(P.isMastered(0.6000000000000001) === true, "float noise above 60% must PASS");

// ---------------------------------------------------------------------------
// 3. Simulated students
// ---------------------------------------------------------------------------
/**
 * Answers a presented question. `trueLevel` = the highest level the student
 * genuinely knows. correctRate lets us model partial ability.
 */
function answerFor(program, audience, slot, trueLevel, correctRate, rnd) {
  const q = P.questionById(program, audience, slot.id);
  const presentedCorrect = slot.order.indexOf(q.correct);
  const knows = q.level <= trueLevel;
  const hit = knows && (correctRate === undefined || rnd() < correctRate);
  if (hit) return presentedCorrect;
  const wrong = slot.order.map((_, i) => i).filter(i => i !== presentedCorrect);
  return wrong[Math.floor(rnd() * wrong.length)];
}

function mulberry(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function runStudent(track, program, audience, claimLevel, trueLevel, opts) {
  opts = opts || {};
  const rnd = opts.rnd || Math.random;
  const session = P.startPlacement(track.id, program.id, audience, program);
  P.applySelfReport(session, program, claimLevel);

  const seenIds = [];
  let guard = 0;
  while (session.phase === "testing") {
    if (++guard > 200) throw new Error("runaway loop: " + program.id);
    const slot = P.currentSlot(session);
    const q = P.questionById(program, audience, slot.id);
    seenIds.push(slot.id);
    if (q.level !== session.currentLevel) throw new Error("question from the wrong level served: " + slot.id);
    let response;
    if (opts.skipAll) response = null;
    else if (opts.exactAnswers) {
      // exactly n correct out of the set, in order
      response = session.index < opts.exactAnswers
        ? P.questionById(program, audience, slot.id) && slot.order.indexOf(q.correct)
        : (slot.order.indexOf(q.correct) + 1) % slot.order.length;
    } else {
      response = answerFor(program, audience, slot, trueLevel, opts.correctRate, rnd);
    }
    P.answerCurrent(session, response);
    const levelDone = P.goNext(session);
    if (levelDone) P.completeLevel(session, program);
  }
  const result = P.finalizePlacement(session, program, track);
  return { session, result, seenIds };
}

const ids = {};
DATA.tracks.forEach(t => t.programs.forEach(p => AUDS.forEach(aud => {
  const levelIds = P.levelIdsOf(p, aud);
  const min = levelIds[0], max = levelIds[levelIds.length - 1];
  const sr = P.selfReportOf(p, aud);
  const label = `${t.id}/${p.id}/${aud}`;
  const rnd = mulberry(1234);

  sr.options.forEach(opt => {
    // trueLevel 0 = knows nothing, up to max = knows everything
    for (let trueLevel = 0; trueLevel <= max; trueLevel++) {
      const { session, result, seenIds } = runStudent(t, p, aud, opt.claimLevel, trueLevel, { rnd });
      const expected = trueLevel < min ? min : Math.min(trueLevel + 1, max);
      ok(result.recommendedLevelId === expected,
        `${label} claim=${opt.claimLevel} trueLevel=${trueLevel}: recommended ${result.recommendedLevelId}, expected ${expected}`);

      // performance beats self-report
      if (trueLevel === 0) {
        ok(result.recommendedLevelId === min && result.levelsPassed.length === 0,
          `${label} claim=${opt.claimLevel}: a student who answers nothing correctly must land on the first level`);
      }
      // every level assessed independently, no mixing
      session.levelResults.forEach(r => {
        ok(r.max === Math.min(P.serveCount(aud), P.bankOf(p, aud, r.level).questions.length),
          `${label}: level ${r.level} scored over ${r.max} points, expected the level's own question count`);
        ok(r.answers.every(a => P.questionById(p, aud, a.id).level === r.level),
          `${label}: level ${r.level} contains a question from another level`);
        ok(Math.abs(r.pct - r.earned / r.max) < 1e-12, `${label}: level ${r.level} percentage does not match its own answers`);
        ok(r.passed === (r.pct >= 0.6 - 1e-9), `${label}: level ${r.level} pass flag disagrees with the threshold`);
      });
      // a failed higher level never lowers a passed lower level
      const passed = session.levelResults.filter(r => r.passed).map(r => r.level);
      ok(passed.every(l => session.levelResults.find(r => r.level === l).pct >= 0.6 - 1e-9),
        `${label}: a passed level lost its score`);
      // highest mastered / levels passed reported consistently
      ok(result.highestMasteredId === (passed.length ? Math.max(...passed) : null),
        `${label}: highest mastered level reported incorrectly`);
      // no repeated questions inside one sitting
      ok(new Set(seenIds).size === seenIds.length, `${label}: the same question was asked twice`);
      // test length stays sane
      ok(session.levelResults.length <= max, `${label}: assessed more levels than exist`);
      ids[label] = (ids[label] || 0) + 1;
    }
  });

  // --- skipping every question -----------------------------------------
  const skipRun = runStudent(t, p, aud, sr.options[sr.options.length - 1].claimLevel, max, { skipAll: true, rnd });
  ok(skipRun.result.recommendedLevelId === min, `${label}: skipping everything must place at the first level`);
  ok(skipRun.session.levelResults.every(r => r.earned === 0 && r.max > 0),
    `${label}: skipped questions must score 0 but still count`);

  // --- exactly-at-threshold student -------------------------------------
  const serve = P.serveCount(aud);
  const passN = Math.ceil(0.6 * serve);          // smallest score that passes
  const exact = runStudent(t, p, aud, min, max, { exactAnswers: passN, rnd });
  const firstExact = exact.session.levelResults[0];
  ok(firstExact.passed && firstExact.pct >= 0.6,
    `${label}: ${passN} of ${serve} (${Math.round(passN / serve * 100)}%) must count as mastered`);
  const under = runStudent(t, p, aud, min, max, { exactAnswers: passN - 1, rnd });
  const firstUnder = under.session.levelResults[0];
  ok(!firstUnder.passed && firstUnder.pct < 0.6,
    `${label}: ${passN - 1} of ${serve} must not count as mastered`);

  // --- a random guesser must almost never pass a level -------------------
  // exact binomial: P(at least passN correct out of serve, each 1 in 4)
  const optionCount = 4;
  const pGuess = 1 / optionCount;
  let pPass = 0;
  for (let k = passN; k <= serve; k++) {
    let c = 1;
    for (let i = 0; i < k; i++) c = c * (serve - i) / (i + 1);
    pPass += c * Math.pow(pGuess, k) * Math.pow(1 - pGuess, serve - k);
  }
  ok(pPass < 0.03, `${label}: a pure guesser passes a level with probability ${(pPass * 100).toFixed(2)}% (want < 3%)`);

  // --- kids and adults must not be the same test ------------------------
  if (aud === "adults") {
    const kidIds = new Set(P.levelIdsOf(p, "kids").flatMap(l => P.bankOf(p, "kids", l).questions.map(q => q.prompt)));
    const adultPrompts = P.levelIdsOf(p, "adults").flatMap(l => P.bankOf(p, "adults", l).questions.map(q => q.prompt));
    const shared = adultPrompts.filter(x => kidIds.has(x)).length;
    ok(shared / adultPrompts.length < 0.92,
      `${t.id}/${p.id}: kids and adults share ${Math.round(shared / adultPrompts.length * 100)}% of question wording`);
  }

  // --- served sets are difficulty-mixed, not accidentally all-easy ------
  {
    const lvl = P.levelIdsOf(p, aud)[0];
    let mixed = 0;
    for (let i = 0; i < 20; i++) {
      const slots = P.selectLevelQuestions(p, aud, lvl, new Set(), P.serveCount(aud));
      const bands = new Set(slots.map(sl => P.questionById(p, aud, sl.id).difficulty));
      if (bands.size >= 2) mixed++;
    }
    ok(mixed >= 19, `${label}: served sets should mix difficulty bands (${mixed}/20 did)`);
  }

  // --- report completeness ---------------------------------------------
  const rep = runStudent(t, p, aud, min, Math.max(min, max - 1), { rnd }).result;
  ["audienceLabel", "trackLabel", "programLabel", "summary", "nextStep"].forEach(k =>
    ok(typeof rep[k] === "string" && rep[k].length > 0, `${label}: report field ${k} missing`));
  ok(!!rep.recommendedLevel, `${label}: report has no recommended level object`);
  ok(rep.levelScores.length > 0, `${label}: report has no per-level scores`);
  ok(rep.duration && rep.duration.label && rep.duration.note, `${label}: report has no duration`);
  ok(rep.totalLevels === levelIds.length, `${label}: totalLevels wrong`);
  const student_facing = [rep.summary, rep.nextStep].join(" ");
  ok(!/threshold|algorithm|adaptive engine|branch|mastery threshold|scoring engine/i.test(student_facing),
    `${label}: technical wording leaked into the student's result`);
})));

// ---------------------------------------------------------------------------
// 4. Changing an answer, and going back
// ---------------------------------------------------------------------------
(function () {
  const t = DATA.tracks[0], p = t.programs[0], aud = "adults";
  const s = P.startPlacement(t.id, p.id, aud, p);
  P.applySelfReport(s, p, 1);
  const slot0 = P.currentSlot(s);
  const q0 = P.questionById(p, aud, slot0.id);
  const correct0 = slot0.order.indexOf(q0.correct);
  P.answerCurrent(s, (correct0 + 1) % slot0.order.length); // wrong
  P.goNext(s);
  ok(P.canGoBack(s), "back should be possible after the first question");
  P.goBack(s);
  ok(P.currentSlot(s).id === slot0.id, "going back should return to the same question");
  ok(P.currentSlot(s).response !== null, "the previous answer should still be shown");
  P.answerCurrent(s, correct0); // change to the right answer
  P.goNext(s);
  // finish the level answering everything else correctly
  while (s.phase === "testing" && s.index < s.slots.length) {
    const sl = P.currentSlot(s);
    const q = P.questionById(p, aud, sl.id);
    P.answerCurrent(s, sl.order.indexOf(q.correct));
    if (P.goNext(s)) break;
  }
  const r = P.evaluateLevel(s, p);
  ok(r.earned === r.max, "score must reflect the final answer after a change, not the first one");
  ok(P.canGoBack(s) === true, "back stays available inside the level");
})();

// ---------------------------------------------------------------------------
// 5. Refresh / close-and-return (serialise, restore, continue)
// ---------------------------------------------------------------------------
(function () {
  const t = DATA.tracks[1], p = t.programs[0], aud = "kids";
  const s = P.startPlacement(t.id, p.id, aud, p);
  P.applySelfReport(s, p, 2);
  const sl = P.currentSlot(s);
  P.answerCurrent(s, sl.order.indexOf(P.questionById(p, aud, sl.id).correct));
  P.goNext(s);

  const restored = P.rehydrate(JSON.parse(JSON.stringify(s)), p);
  ok(!!restored, "a saved session must restore");
  ok(restored.currentLevel === s.currentLevel && restored.index === s.index,
    "restore must resume on the same question of the same level");
  ok(restored.slots[0].response === s.slots[0].response, "restore must keep answers already given");

  let guard = 0;
  while (restored.phase === "testing") {
    if (++guard > 200) throw new Error("runaway after restore");
    const slot = P.currentSlot(restored);
    const q = P.questionById(p, aud, slot.id);
    P.answerCurrent(restored, slot.order.indexOf(q.correct));
    if (P.goNext(restored)) P.completeLevel(restored, p);
  }
  const res = P.finalizePlacement(restored, p, t);
  ok(res.recommendedLevelId === P.levelIdsOf(p, aud).slice(-1)[0],
    "a perfect student after a refresh should still reach the top level");

  // corrupted / stale saves are rejected rather than resumed badly
  const bad = JSON.parse(JSON.stringify(s));
  bad.currentLevel = 99;
  ok(P.rehydrate(bad, p) === null, "a save pointing at a level that no longer exists must be rejected");
  const badV = JSON.parse(JSON.stringify(s)); badV.v = 1;
  ok(P.rehydrate(badV, p) === null, "a save from an older version must be rejected");
  const dropped = JSON.parse(JSON.stringify(s));
  dropped.slots.forEach(x => { x.id = "GONE_" + x.id; });
  const fixed = P.rehydrate(dropped, p);
  ok(fixed && fixed.slots.length > 0 && fixed.slots.every(x => !!P.questionById(p, aud, x.id)),
    "questions removed from the data must be replaced, not crash the resume");
})();

// ---------------------------------------------------------------------------
// 6. Option shuffling is graded correctly, and varies between students
// ---------------------------------------------------------------------------
(function () {
  DATA.tracks.forEach(t => t.programs.forEach(p => AUDS.forEach(aud => {
    P.levelIdsOf(p, aud).forEach(lvl => {
      P.bankOf(p, aud, lvl).questions.forEach(q => {
        const order = [...q.options.keys()].reverse();
        const slot = { id: q.id, order: order, response: order.indexOf(q.correct) };
        const g = P.gradeSlot(p, aud, slot);
        ok(g.correct && g.earned === 1, `${q.id}: shuffled options graded incorrectly`);
        const wrongSlot = { id: q.id, order: order, response: (order.indexOf(q.correct) + 1) % order.length };
        ok(P.gradeSlot(p, aud, wrongSlot).earned === 0, `${q.id}: a wrong answer scored points`);
        const presented = P.present(p, aud, slot);
        ok(presented.options.length === q.options.length, `${q.id}: presented option count changed`);
        ok(presented.options[slot.response] === q.correctAnswer, `${q.id}: presented order mismatch`);
      });
    });
  })));

  // two students on the same level rarely get an identical question set
  const t = DATA.tracks[0], p = t.programs[1];
  let differing = 0;
  for (let i = 0; i < 40; i++) {
    const a = P.selectLevelQuestions(p, "kids", 1, new Set(), 5).map(x => x.id).join(",");
    const b = P.selectLevelQuestions(p, "kids", 1, new Set(), 5).map(x => x.id).join(",");
    if (a !== b) differing++;
  }
  ok(differing > 25, `question sets should vary between students (varied in ${differing}/40 pairs)`);
})();

// ---------------------------------------------------------------------------
// 7. The documented worked examples
// ---------------------------------------------------------------------------
(function () {
  const t = DATA.tracks.find(x => x.id === "quran");
  const p = t.programs.find(x => x.id === "memorization");
  const aud = "kids";
  const rnd = mulberry(7);

  // Example A: claims Juz' Amma (level 1), truly knows levels 1 and 2
  let r = runStudent(t, p, aud, 1, 2, { rnd });
  ok(r.result.levelsPassed.join(",") === "1,2", "Example A: should master levels 1 and 2");
  ok(r.result.recommendedLevelId === 3, "Example A: should be recommended level 3");

  // Example B: claims level 2 -> level 1 is verified first
  r = runStudent(t, p, aud, 2, 2, { rnd });
  ok(r.session.order[0] === 1, "Example B: a level-2 claim must verify level 1 first");

  // Example C: claims the whole Qur'an but only really knows level 1
  r = runStudent(t, p, aud, 4, 1, { rnd });
  ok(r.result.recommendedLevelId === 2, "Example C: self-report must not override weak performance");
  ok(r.result.highestMasteredId === 1, "Example C: highest mastered should be level 1");

  // Claims the lowest level but is excellent -> reaches the top
  r = runStudent(t, p, aud, 1, 4, { rnd });
  ok(r.result.recommendedLevelId === 4, "an underestimating student must be allowed to advance");
  ok(r.session.levelResults.length >= 4, "an underestimating student should be tested up the ladder");

  // Efficiency: a strong high claimer answers few questions
  r = runStudent(t, p, aud, 4, 4, { rnd });
  const cap = 2 * P.serveCount("kids") + 2;
  ok(r.seenIds.length <= cap, `a strong high claimer should only need a short test (was ${r.seenIds.length}, cap ${cap})`);
})();

// ---------------------------------------------------------------------------
// 8. placementMode = highestMastered (the alternative rule)
// ---------------------------------------------------------------------------
(function () {
  const t = DATA.tracks.find(x => x.id === "quran");
  const p = t.programs.find(x => x.id === "memorization");
  P.CONFIG.PLACEMENT_MODE = "highestMastered";
  const r = runStudent(t, p, "kids", 1, 2, { rnd: mulberry(3) });
  ok(r.result.recommendedLevelId === 2, "highestMastered mode should recommend the highest level proven");
  P.CONFIG.PLACEMENT_MODE = "firstUnmastered";
})();

// ---------------------------------------------------------------------------
// 9. Fuzz: partial ability, random skipping, random going back
// ---------------------------------------------------------------------------
(function () {
  let runs = 0;
  DATA.tracks.forEach(t => t.programs.forEach(p => AUDS.forEach(aud => {
    const levelIds = P.levelIdsOf(p, aud);
    const min = levelIds[0], max = levelIds[levelIds.length - 1];
    for (let seed = 0; seed < 12; seed++) {
      const rnd = mulberry(seed * 977 + 13);
      const sr = P.selfReportOf(p, aud);
      const claim = sr.options[Math.floor(rnd() * sr.options.length)].claimLevel;
      const s = P.startPlacement(t.id, p.id, aud, p);
      P.applySelfReport(s, p, claim);
      let guard = 0;
      while (s.phase === "testing") {
        if (++guard > 400) throw new Error("fuzz runaway in " + p.id);
        const slot = P.currentSlot(s);
        const q = P.questionById(p, aud, slot.id);
        const r = rnd();
        if (r < 0.12) P.answerCurrent(s, null);                       // skip
        else if (r < 0.62) P.answerCurrent(s, slot.order.indexOf(q.correct));
        else P.answerCurrent(s, Math.floor(rnd() * slot.order.length));
        if (rnd() < 0.15 && P.canGoBack(s)) { P.goBack(s); continue; } // wander back
        if (P.goNext(s)) P.completeLevel(s, p);
      }
      const res = P.finalizePlacement(s, p, t);
      ok(res.recommendedLevelId >= min && res.recommendedLevelId <= max,
        `fuzz ${p.id}/${aud}: recommended level ${res.recommendedLevelId} outside the program`);
      ok(!!res.recommendedLevel && !!res.summary, `fuzz ${p.id}/${aud}: incomplete result`);
      ok(s.levelResults.every(x => x.max > 0 && x.earned <= x.max), `fuzz ${p.id}/${aud}: impossible level score`);
      ok(new Set(s.levelResults.map(x => x.level)).size === s.levelResults.length,
        `fuzz ${p.id}/${aud}: a level was scored twice`);
      const passed = s.levelResults.filter(x => x.passed).map(x => x.level);
      if (passed.length) {
        ok(res.recommendedLevelId === Math.min(Math.max(...passed) + 1, max),
          `fuzz ${p.id}/${aud}: recommendation does not follow the highest mastered level`);
      } else {
        ok(res.recommendedLevelId === min, `fuzz ${p.id}/${aud}: no level passed but not placed at the first level`);
      }
      runs++;
    }
  })));
  console.log("fuzz runs             :", runs);
})();

// ---------------------------------------------------------------------------
console.log("questions in database:", questionCount);
console.log("student simulations   :", Object.values(ids).reduce((a, b) => a + b, 0));
console.log("assertions            :", checks);
if (failures.length) {
  console.log("\nFAILURES (" + failures.length + "):");
  [...new Set(failures)].slice(0, 40).forEach(f => console.log("  -", f));
  process.exit(1);
}
console.log("\nALL CHECKS PASSED");
