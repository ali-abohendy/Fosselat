/**
 * test_ui.js — drives the real page in Chromium: full happy path, wrong-answer
 * path, skip, back, refresh-and-resume, and a mobile pass. Fails on any console
 * error.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

// the app files: next to this script, or in ./out/
const DIR = fs.existsSync(path.join(__dirname, "questions.json")) ? __dirname : path.join(__dirname, "out");
const URL = "file://" + path.join(DIR, "index.html");
const DATA = JSON.parse(fs.readFileSync(path.join(DIR, "questions.json"), "utf8"));

const flat = t => (t || "").replace(/\s+/g, "");
const key = (aud, pid, prompt, arabic) => aud + "|" + pid + "|" + flat(prompt) + "|" + flat(arabic);

const byPrompt = new Map();
DATA.tracks.forEach(t => t.programs.forEach(p => ["kids", "adults"].forEach(aud =>
  (p.levelBanksByAudience[aud] || []).forEach(b => b.questions.forEach(q => {
    // whitespace-insensitive key: a two-line stimulus renders as <br>, so the
    // DOM text has no newline in it
    const k = key(aud, p.id, q.prompt, q.arabic);
    if (!byPrompt.has(k)) byPrompt.set(k, []);
    byPrompt.get(k).push(q);   // the same prompt can appear at two levels
  })))));

let failures = [];
function ok(cond, msg) { if (!cond) { failures.push(msg); console.log("  FAIL: " + msg); } }

async function attach(page, errors) {
  page.on("console", m => {
    // ignore the deliberately blocked webfont requests
    if (m.type() === "error" && !/net::ERR_(TUNNEL_CONNECTION_FAILED|FAILED|BLOCKED_BY_CLIENT|ABORTED)/.test(m.text())) {
      errors.push("console: " + m.text());
    }
  });
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
}

async function currentQuestion(page, aud, programId) {
  const prompt = await page.textContent(".q-prompt");
  const arabic = await page.$(".q-stimulus");
  const ar = arabic ? (await arabic.textContent()).trim() : "";
  const shown = (await page.$$eval(".q-option", els =>
    els.map(e => e.textContent))).map(t => flat(t));
  const candidates = byPrompt.get(key(aud, programId, prompt, ar)) || [];
  // pick the candidate whose options are the ones on screen (a prompt can be
  // reused at another level with a different option set)
  const q = candidates.find(c => c.options.every(o => shown.some(sh => sh.includes(flat(o)))))
    || candidates[0];
  return { prompt: prompt.trim(), arabic: ar, q };
}

/** answer the on-screen question: mode 'right' | 'wrong' | 'skip' */
async function answer(page, aud, programId, mode) {
  const { prompt, q } = await currentQuestion(page, aud, programId);
  if (mode === "skip") { await page.click("#qSkip"); return { prompt, picked: null }; }
  if (!q) throw new Error("question not found in data: " + prompt);
  const wanted = mode === "right" ? q.correctAnswer : q.options.find(o => o !== q.correctAnswer);
  const buttons = await page.$$(".q-option");
  let clicked = false;
  const want = flat(wanted);
  for (const b of buttons) {
    if (flat(await b.textContent()).includes(want)) { await b.click(); clicked = true; break; }
  }
  if (!clicked) throw new Error("option not found on screen: " + wanted);
  await page.click("#qContinue");
  return { prompt, picked: wanted };
}

async function chooseFlow(page, audience, trackLabel, programLabel) {
  await page.click("#btnStart");
  await page.click(`#audienceGrid .choice-card >> nth=${audience === "kids" ? 0 : 1}`);
  await page.click(`#trackGrid .choice-card:has-text("${trackLabel}")`);
  await page.click(`#programList .choice-row:has-text("${programLabel}")`);
  await page.click("#btnStartTest");
}

async function pickSelfReport(page, index) {
  await page.click(`#qBody .q-option >> nth=${index}`);
  await page.click("#srContinue");
  await page.click("#stageContinue");
}

async function playThrough(page, aud, programId, decide) {
  // decide(levelIndexQuestion) -> 'right' | 'wrong' | 'skip'
  let n = 0;
  for (;;) {
    if (await page.isVisible("#screen-results")) break;
    if (await page.isVisible("#screen-stage")) { await page.click("#stageContinue"); continue; }
    if (!(await page.isVisible("#screen-question"))) break;
    await answer(page, aud, programId, decide(n++));
    await page.waitForTimeout(10);
    if (n > 200) throw new Error("too many questions");
  }
  return n;
}

(async () => {
  // set CHROME_PATH if Playwright's bundled browser is not installed
  const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const t0 = Date.now();
  const mark = m => console.log("  [" + ((Date.now() - t0) / 1000).toFixed(1) + "s] " + m);

  // ---------------------------------------------------------------
  // A. strong student, kids / memorization, claims "most or all"
  // ---------------------------------------------------------------
  let errors = [];
  mark("section A");
  let ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  let page = await ctx.newPage();
  await attach(page, errors);
  page.setDefaultTimeout(15000);
  await page.goto(URL);
  await chooseFlow(page, "kids", "Qur'an", "Memorization & Revision");
  const introQ = await page.textContent("#introStats");
  ok(/Questions/.test(introQ), "intro shows a question count");
  await pickSelfReport(page, 4); // "Most or all of the Qur'an" -> claims level 4
  const asked = await playThrough(page, "kids", "memorization", () => "right");
  ok(await page.isVisible("#screen-results"), "A: results screen reached");
  const levelTag = await page.textContent(".rh-level-tag");
  ok(/Level 4 of 4/.test(levelTag), "A: perfect performance on a level-4 claim places at level 4, got " + levelTag);
  ok(asked <= 24, "A: a strong high claimer answered a short test (" + asked + " questions)");
  const rows = await page.$$eval(".lvl-row", els => els.map(e => e.textContent.replace(/\s+/g, " ").trim()));
  ok(rows.length === 2, "A: only the two verified levels are reported, got " + rows.length);
  ok(rows.every(r => /100%/.test(r)), "A: both level scores show 100%");
  const mastered = await page.textContent(".rh-mastered");
  ok(/Level 4/.test(mastered), "A: highest level demonstrated is reported");
  ok(!(await page.isVisible("#screen-welcome")), "A: earlier screens are hidden on the results screen");
  ok(!(await page.isVisible("#progressWrap")), "A: the progress bar is hidden once the result is shown");
  const barWidth = await page.$eval(".lvl-bar-fill", el => el.getBoundingClientRect().width);
  ok(barWidth > 50, "A: the per-level score bars are actually drawn (" + barWidth + "px)");
  const actionCount = await page.$$eval(".results-actions .btn", els => els.length);
  ok(actionCount === 3, "A: all three result actions are rendered, got " + actionCount);
  const ghostContrast = await page.$eval("#btnRetakeSame", el => getComputedStyle(el).color);
  ok(/25[0-9]|24[0-9]|23[0-9]/.test(ghostContrast), "A: secondary buttons are legible on the dark background (" + ghostContrast + ")");
  await page.screenshot({ path: __dirname + "/shot-results-desktop.png", fullPage: true });

  // ---------------------------------------------------------------
  // B. overestimating student: claims the top, answers everything wrong
  // ---------------------------------------------------------------
  mark("section B");
  await page.goto(URL);
  await chooseFlow(page, "kids", "Qur'an", "Memorization & Revision");
  await pickSelfReport(page, 4);
  await playThrough(page, "kids", "memorization", () => "wrong");
  ok(/Level 1 of 4/.test(await page.textContent(".rh-level-tag")),
    "B: a top claim with weak answers must land on level 1");
  ok(/build your foundations/i.test(await page.textContent(".rh-mastered")),
    "B: no level is claimed as mastered");

  // ---------------------------------------------------------------
  // C. skipping everything (adults / reading & tajweed)
  // ---------------------------------------------------------------
  mark("section C");
  await page.goto(URL);
  await chooseFlow(page, "adults", "Qur'an", "Reading & Tajweed");
  await pickSelfReport(page, 3);
  await playThrough(page, "adults", "reading-tajweed", () => "skip");
  ok(/Level 1 of 3/.test(await page.textContent(".rh-level-tag")), "C: skipping everything places at level 1");
  ok(/0 of 12 correct/.test(await page.textContent(".lvl-list")), "C: skipped questions count as 0 of 12");

  // ---------------------------------------------------------------
  // D. Back button changes an answer, and the change counts
  // ---------------------------------------------------------------
  mark("section D");
  await page.goto(URL);
  await chooseFlow(page, "adults", "Islamic Studies", "Fiqh");
  await pickSelfReport(page, 0);
  const first = await answer(page, "adults", "fiqh", "wrong");
  await page.waitForTimeout(40);
  ok(await page.isVisible("#qBack"), "D: back button appears from question 2");
  await page.click("#qBack");
  await page.waitForTimeout(40);
  const backTo = await page.textContent(".q-prompt");
  ok(backTo.trim() === first.prompt, "D: back returns to the previous question");
  const picked = await page.$$eval(".q-option.is-picked", e => e.length);
  ok(picked === 1, "D: the earlier answer is still selected");
  await answer(page, "adults", "fiqh", "right"); // change it
  await playThrough(page, "adults", "fiqh", () => "right");
  const fiqhRows = await page.$$eval(".lvl-row", els => els.map(e => e.textContent.replace(/\s+/g, " ")));
  ok(/12 of 12 correct/.test(fiqhRows[0]), "D: the corrected answer counted — got " + fiqhRows[0]);

  // ---------------------------------------------------------------
  // E. Refresh mid-test resumes at the same question
  // ---------------------------------------------------------------
  mark("section E");
  await page.goto(URL);
  await chooseFlow(page, "kids", "Arabic Language", "Arabic Foundation");
  await pickSelfReport(page, 2);
  await answer(page, "kids", "foundation", "right");
  await page.waitForTimeout(40);
  const beforeReload = (await page.textContent(".q-prompt")).trim();
  const progressBefore = await page.textContent("#progressLabel");
  await page.reload();
  ok(await page.isVisible("#resumeBanner"), "E: refresh offers to resume");
  await page.click("#btnResume");
  await page.waitForTimeout(60);
  ok((await page.textContent(".q-prompt")).trim() === beforeReload, "E: resumes on the same question");
  ok((await page.textContent("#progressLabel")) === progressBefore, "E: progress is preserved");
  await playThrough(page, "kids", "foundation", () => "right");
  ok(await page.isVisible("#screen-results"), "E: the resumed test completes");
  await page.goto(URL);
  ok(!(await page.isVisible("#resumeBanner")), "E: a finished test leaves nothing to resume");

  // ---------------------------------------------------------------
  // F. Mixed ability -> stops at the right level (adults / post-foundation)
  // ---------------------------------------------------------------
  mark("section F");
  await page.goto(URL);
  await chooseFlow(page, "adults", "Arabic Language", "Arabic Post-Foundation");
  await pickSelfReport(page, 1); // claims level 2 -> level 1 checked first
  const l1 = await page.textContent("#qStage");
  ok(/PF1/.test(l1) || /Beginner/.test(l1), "F: a level-2 claim starts by checking level 1, got " + l1);
  let count = 0;
  await playThrough(page, "adults", "advanced", () => (count++ < 24 ? "right" : "wrong"));
  ok(/Level 3 of 4/.test(await page.textContent(".rh-level-tag")),
    "F: mastering levels 1-2 then failing level 3 recommends level 3");
  const txt = await page.textContent("#resultsBody");
  ok(/demonstrated mastery of Levels 1 and 2/.test(txt), "F: the summary names the levels mastered");
  ok(!/threshold|algorithm|adaptive|branch/i.test(txt), "F: no technical wording on the results screen");

  // ---------------------------------------------------------------
  // G. Mobile pass
  // ---------------------------------------------------------------
  mark("section G");
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const mpage = await mctx.newPage();
  await attach(mpage, errors);
  mpage.setDefaultTimeout(15000);
  await mpage.goto(URL);
  await chooseFlow(mpage, "kids", "Islamic Studies", "Manners & Islamic Character");
  await pickSelfReport(mpage, 1);
  const overflow = await mpage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 1, "G: no horizontal overflow on mobile (" + overflow + "px)");
  await mpage.screenshot({ path: __dirname + "/shot-question-mobile.png" });
  await playThrough(mpage, "kids", "manners", () => "right");
  ok(await mpage.isVisible("#screen-results"), "G: mobile run reaches the results");
  await mpage.screenshot({ path: __dirname + "/shot-results-mobile.png", fullPage: true });

  // ---------------------------------------------------------------
  // H. every track/program is reachable and starts cleanly
  // ---------------------------------------------------------------
  mark("section H");
  for (const t of DATA.tracks) {
    for (const p of t.programs) {
      for (const aud of ["kids", "adults"]) {
        await page.goto(URL);
        await chooseFlow(page, aud, t.label, p.label);
        const srOptions = await page.$$eval("#qBody .q-option", e => e.length);
        ok(srOptions >= 2, `H: ${t.id}/${p.id}/${aud} shows self-report options`);
        await pickSelfReport(page, srOptions - 1);
        const visible = await page.isVisible("#screen-question");
        ok(visible, `H: ${t.id}/${p.id}/${aud} starts its first question`);
        const opts = await page.$$eval("#qBody .q-option", e => e.length);
        ok(opts >= 2, `H: ${t.id}/${p.id}/${aud} first question has options`);
        const n = await playThrough(page, aud, p.id, i => (i % 3 === 0 ? "wrong" : "right"));
        ok(await page.isVisible("#screen-results"), `H: ${t.id}/${p.id}/${aud} completes`);
        ok(n >= 10 && n <= 70, `H: ${t.id}/${p.id}/${aud} asked ${n} questions`);
        mark(`H ${t.id}/${p.id}/${aud} ok (${n} questions)`);
      }
    }
  }

  ok(errors.length === 0, "no console/page errors — got:\n    " + errors.slice(0, 8).join("\n    "));
  await browser.close();

  console.log(failures.length ? "\n" + failures.length + " UI CHECK(S) FAILED" : "\nALL UI CHECKS PASSED");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.error("CRASH:", e); process.exit(2); });
