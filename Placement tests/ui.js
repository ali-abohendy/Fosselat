/**
 * ui.js — all DOM rendering and screen transitions for the Fosselat Academy
 * placement test. Talks to the DOM only: no placement logic (see scoring.js)
 * and no flow state (see script.js).
 *
 * Nothing technical is ever shown to the student: no thresholds, no
 * percentages mid-test, no talk of branching or engines.
 */
const UI = (function () {

  const ACCENTS = {
    quran: "var(--emerald)",
    arabic: "var(--indigo)",
    "islamic-studies": "var(--maroon)",
  };
  const INITIALS = { quran: "Q", arabic: "A", "islamic-studies": "I" };
  const LETTERS = ["A", "B", "C", "D", "E", "F"];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  // ------------------------------------------------------------------
  // Screens
  // ------------------------------------------------------------------
  const SCREENS = ["welcome", "audience", "track", "program", "testintro", "stage", "question", "results"];

  function showScreen(name) {
    SCREENS.forEach(s => {
      const node = document.getElementById("screen-" + s);
      if (!node) return;
      if (s === name) {
        node.hidden = false;
        node.classList.remove("screen");
        void node.offsetWidth; // restart the entrance animation
        node.classList.add("screen");
      } else {
        node.hidden = true;
      }
    });
    const heading = $("#screen-" + name + " h1, #screen-" + name + " h2");
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: false }); }
    try { window.scrollTo({ top: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, 0); }
  }

  function setProgress(visible, frac, label) {
    const wrap = $("#progressWrap");
    wrap.hidden = !visible;
    if (!visible) return;
    $("#progressFill").style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + "%";
    if (label) $("#progressLabel").textContent = label;
  }

  function setAccent(trackId) {
    document.documentElement.style.setProperty("--accent", ACCENTS[trackId] || "var(--gold)");
    document.documentElement.style.setProperty("--accent-dim", ACCENTS[trackId] || "var(--gold-dim)");
  }

  // ------------------------------------------------------------------
  // Step 1 — who is taking it
  // ------------------------------------------------------------------
  function renderAudience(onPick) {
    const grid = $("#audienceGrid");
    grid.innerHTML = "";
    [
      { id: "kids", title: "Kids", desc: "Ages roughly 5–12. Simpler wording, short questions." },
      { id: "adults", title: "Adults", desc: "Teens and adults." },
    ].forEach(o => {
      const card = el(`<button type="button" class="choice-card" data-id="${o.id}">
        <span class="cc-icon">${o.id === "kids" ? "K" : "A"}</span>
        <span class="cc-title">${esc(o.title)}</span>
        <span class="cc-desc">${esc(o.desc)}</span>
      </button>`);
      card.addEventListener("click", () => onPick(o.id));
      grid.appendChild(card);
    });
  }

  // ------------------------------------------------------------------
  // Step 2 — track
  // ------------------------------------------------------------------
  function renderTracks(tracks, onPick) {
    const grid = $("#trackGrid");
    grid.innerHTML = "";
    tracks.forEach(t => {
      const card = el(`<button type="button" class="choice-card" data-id="${t.id}" style="--card-accent:${ACCENTS[t.id]}">
        <span class="cc-icon">${INITIALS[t.id] || "F"}</span>
        <span class="cc-title">${esc(t.label)}</span>
        <span class="cc-desc">${esc(t.tagline)}</span>
      </button>`);
      card.addEventListener("click", () => onPick(t));
      grid.appendChild(card);
    });
  }

  // ------------------------------------------------------------------
  // Step 3 — program
  // ------------------------------------------------------------------
  function renderPrograms(track, onPick) {
    $("#programHeading").textContent = "Choose a program — " + track.label;
    const list = $("#programList");
    list.innerHTML = "";
    track.programs.forEach(p => {
      const row = el(`<button type="button" class="choice-row" style="--card-accent:${ACCENTS[track.id]}">
        <span>
          <span class="cr-title">${esc(p.label)}</span>
          <span class="cr-desc">${esc(p.description)}</span>
        </span>
        <span class="cr-arrow" aria-hidden="true">→</span>
      </button>`);
      row.addEventListener("click", () => onPick(p));
      list.appendChild(row);
    });
  }

  // ------------------------------------------------------------------
  // Step 4 — intro
  // ------------------------------------------------------------------
  function renderTestIntro(track, program, audience, questionsPerLevel) {
    $("#introEyebrow").textContent = track.label + " · " + program.label;
    $("#introTitle").textContent = "Ready when you are.";
    $("#introBody").textContent =
      "First we'll ask one quick question about what you already know, just to pick a good " +
      "starting point. After that you'll answer a few short questions at a time — do well and " +
      "we'll move you up, so you never sit through what you already know.";

    const levels = program.levelsByAudience[audience] || [];
    const minQ = 1 + questionsPerLevel;
    const maxQ = 1 + questionsPerLevel * Math.min(levels.length, 4);
    $("#introStats").innerHTML = `
      <div><dt>Questions</dt><dd>${minQ}–${maxQ}</dd></div>
      <div><dt>Est. Time</dt><dd>${Math.max(2, Math.round(minQ * 0.4))}–${Math.max(4, Math.round(maxQ * 0.5))} min</dd></div>
      <div><dt>Choices</dt><dd>Multiple choice</dd></div>
    `;
  }

  // ------------------------------------------------------------------
  // Between-level message (friendly, never technical)
  // ------------------------------------------------------------------
  function renderStage(info, onContinue) {
    const body = $("#stageBody");
    body.innerHTML = `
      <p class="eyebrow">${esc(info.eyebrow || "")}</p>
      <h2 class="display-sm" tabindex="-1">${esc(info.title)}</h2>
      <p class="lede">${esc(info.message)}</p>
      ${info.focus ? `<p class="stage-focus">Coming up: ${esc(info.focus)}</p>` : ""}
      <button class="btn btn-primary btn-lg" id="stageContinue" type="button">${esc(info.cta || "Continue")}</button>
    `;
    $("h2", body).focus({ preventScroll: true });
    $("#stageContinue", body).addEventListener("click", onContinue);
  }

  // ------------------------------------------------------------------
  // The one self-report question (not scored, and we say so)
  // ------------------------------------------------------------------
  function renderSelfReport(ctx, onPick) {
    $("#qStage").textContent = ctx.trackLabel + " · " + ctx.programLabel;
    const body = $("#qBody");
    let html = `<h2 class="q-prompt" tabindex="-1">${esc(ctx.prompt)}</h2>
      <p class="q-note">This is just a starting point — your answers in the next few questions decide your level.</p>
      <div class="q-options" role="group" aria-label="Answer options">`;
    ctx.options.forEach((o, i) => {
      html += `<button type="button" class="q-option" data-idx="${i}" aria-pressed="false">
        <span class="opt-mark">${LETTERS[i] || i + 1}</span><span>${esc(o.label)}</span>
      </button>`;
    });
    html += `</div><div class="q-actions"><button class="btn btn-primary" id="srContinue" type="button" disabled>Continue</button></div>`;
    body.innerHTML = html;
    $(".q-prompt", body).focus({ preventScroll: true });

    let picked = null;
    const cont = $("#srContinue", body);
    $all(".q-option", body).forEach(btn => {
      btn.addEventListener("click", () => {
        $all(".q-option", body).forEach(b => { b.classList.remove("is-picked"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("is-picked");
        btn.setAttribute("aria-pressed", "true");
        picked = Number(btn.dataset.idx);
        cont.disabled = false;
      });
    });
    cont.addEventListener("click", () => {
      if (picked === null) return;
      cont.disabled = true;
      $all(".q-option", body).forEach(b => { b.disabled = true; });
      onPick(picked);
    });
  }

  // ------------------------------------------------------------------
  // A scored question
  // ------------------------------------------------------------------
  function stimulusBlock(q) {
    if (!q.arabic) return "";
    const long = q.arabic.length > 24;
    // a stimulus may hold two excerpts, one per line
    const body = esc(q.arabic).replace(/\n+/g, "<br>");
    return `<div class="q-stimulus${long ? "" : " small"}" lang="ar" dir="rtl">${body}</div>`;
  }

  /**
   * handlers: { onAnswer(idx), onSkip(), onBack() }
   * ctx: { trackLabel, levelName, focus, question, preset, canBack, isLast }
   */
  function renderQuestion(ctx, handlers) {
    $("#qStage").textContent = ctx.levelName || ctx.trackLabel;

    const q = ctx.question;
    const body = $("#qBody");
    let html = `<h2 class="q-prompt" tabindex="-1">${esc(q.prompt)}</h2>`;
    html += stimulusBlock(q);
    const ar = q.optionsArabic;
    html += `<div class="q-options${ar ? " q-options-ar" : ""}" role="group" aria-label="Answer options">`;
    q.options.forEach((opt, i) => {
      const body = ar
        ? `<span class="opt-ar" lang="ar" dir="rtl">${esc(opt)}</span>`
        : `<span>${esc(opt)}</span>`;
      html += `<button type="button" class="q-option${ar ? " is-ar" : ""}" data-idx="${i}" aria-pressed="false">
        <span class="opt-mark">${LETTERS[i] || i + 1}</span>${body}
      </button>`;
    });
    html += `</div>
      <div class="q-actions">
        ${ctx.canBack ? `<button class="btn btn-ghost" id="qBack" type="button">Back</button>` : ""}
        <button class="btn btn-ghost" id="qSkip" type="button">Skip</button>
        <button class="btn btn-primary" id="qContinue" type="button" disabled>${ctx.isLast ? "Finish this set" : "Continue"}</button>
      </div>`;
    body.innerHTML = html;
    $(".q-prompt", body).focus({ preventScroll: true });

    let selected = (ctx.preset === null || ctx.preset === undefined) ? null : Number(ctx.preset);
    const cont = $("#qContinue", body);

    function paint() {
      $all(".q-option", body).forEach(b => {
        const on = Number(b.dataset.idx) === selected;
        b.classList.toggle("is-picked", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      cont.disabled = selected === null;
    }
    $all(".q-option", body).forEach(btn => {
      btn.addEventListener("click", () => {
        selected = Number(btn.dataset.idx); // changing the answer is allowed
        paint();
      });
    });
    paint();

    function lock() {
      cont.disabled = true;
      $all(".q-option", body).forEach(b => { b.disabled = true; });
      const s = $("#qSkip", body); if (s) s.disabled = true;
      const bk = $("#qBack", body); if (bk) bk.disabled = true;
    }

    cont.addEventListener("click", () => {
      if (selected === null) return;
      lock();
      handlers.onAnswer(selected);
    });
    $("#qSkip", body).addEventListener("click", () => { lock(); handlers.onSkip(); });
    const back = $("#qBack", body);
    if (back) back.addEventListener("click", () => { lock(); handlers.onBack(); });
  }

  // ------------------------------------------------------------------
  // Results
  // ------------------------------------------------------------------
  function skillItem(s, kind) {
    return `<li><span class="tag-dot ${kind === "ok" ? "ok" : "watch"}"></span>
      <span>${esc(s.skill)} <strong>(${Math.round(s.pct * 100)}%)</strong></span></li>`;
  }

  function levelRow(s) {
    return `<li class="lvl-row ${s.passed ? "is-pass" : "is-stop"}">
      <span class="lvl-head">
        <span class="lvl-name">Level ${s.level} — ${esc(s.name)}</span>
        <span class="lvl-score">${Math.round(s.pct * 100)}%</span>
      </span>
      <span class="lvl-bar"><span class="lvl-bar-fill" style="width:${Math.round(s.pct * 100)}%"></span></span>
      <span class="lvl-meta">${s.correct} of ${s.total} correct · ${s.passed ? "Mastered" : "Not yet mastered"}</span>
    </li>`;
  }

  function renderResults(result, track) {
    setProgress(false);
    const strengthsHtml = result.strengths.length
      ? result.strengths.map(s => skillItem(s, "ok")).join("")
      : `<li>A balanced start — your profile will sharpen as you study.</li>`;
    const weaknessesHtml = result.weaknesses.length
      ? result.weaknesses.map(s => skillItem(s, "watch")).join("")
      : `<li>Nothing stood out as a gap — nicely balanced.</li>`;

    const accent = ACCENTS[track.id] || "var(--gold)";
    const rec = result.recommendedLevel;
    const mastered = result.highestMasteredLevel;

    $("#resultsBody").innerHTML = `
      <div class="results-hero" id="resultsHero" style="--card-accent:${accent}">
        <svg class="rh-motif" viewBox="0 0 100 100" aria-hidden="true">
          <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" stroke-width="0.7"/>
          <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" stroke-width="0.7" transform="rotate(45 50 50)"/>
        </svg>
        <div class="rh-logo" aria-hidden="true"></div>
        <p class="rh-eyebrow">Recommended Starting Level</p>
        <p class="rh-level-tag">Level ${result.recommendedLevelId} of ${result.totalLevels}</p>
        <h2 class="rh-level">${esc(rec ? rec.name : "Level " + result.recommendedLevelId)}</h2>
        <p class="rh-program">${esc(result.audienceLabel)} · ${esc(track.label)} · ${esc(result.programLabel)}</p>
        ${rec && rec.desc ? `<p class="rh-level-desc">“${esc(rec.desc)}”</p>` : ""}
        <p class="rh-mastered">${mastered
          ? "Highest level you demonstrated: <strong>Level " + result.highestMasteredId + " — " + esc(mastered.name) + "</strong>"
          : "We'll build your foundations from the start of the program."}</p>
      </div>

      <div class="results-card results-summary">
        <h3>What this means</h3>
        <p class="summary-text">${esc(result.summary)}</p>
      </div>

      <div class="results-card">
        <h3>How each set went</h3>
        <ul class="lvl-list">${result.levelScores.map(levelRow).join("")}</ul>
        <p class="stat-sub">${result.levelsPassed.length
          ? "Levels passed: " + result.levelsPassed.map(l => "Level " + l).join(", ")
          : "No level was passed yet — starting at the beginning is the right move."}
          ${result.levelScores.length && result.levelScores[0].level > 1
            ? " · Levels below Level " + result.levelScores[0].level + " were not tested because your performance above them was strong enough."
            : ""}</p>
      </div>

      <div class="results-grid">
        <div class="results-card">
          <h3>Strengths</h3>
          <ul>${strengthsHtml}</ul>
        </div>
        <div class="results-card">
          <h3>Areas to Build</h3>
          <ul>${weaknessesHtml}</ul>
        </div>
        <div class="results-card">
          <h3>Estimated Duration</h3>
          <div class="stat-big">${esc(result.duration.label)}</div>
          <div class="stat-sub">${esc(result.duration.note)}</div>
        </div>
        <div class="results-card">
          <h3>Recommended Pace</h3>
          <div class="stat-big">${esc(result.duration.lessonsPerWeek)}</div>
          <div class="stat-sub">Suggested weekly lessons to progress steadily</div>
        </div>
      </div>

      <div class="results-card">
        <h3>Recommended Next Step</h3>
        <p class="summary-text">${esc(result.nextStep)}</p>
        ${result.claimLabel ? `<p class="stat-sub">You told us at the start: “${esc(result.claimLabel)}”. Your placement above comes from your answers, not from this.</p>` : ""}
      </div>

      <div class="results-actions">
        <button class="btn btn-primary" id="btnRetakeTrack" type="button">Explore Another Program</button>
        <button class="btn btn-ghost" id="btnRetakeSame" type="button">Take This Again</button>
        <button class="btn btn-ghost" id="btnPrint" type="button">Save / Print Result</button>
      </div>
    `;

    requestAnimationFrame(() => {
      const hero = $("#resultsHero");
      if (hero) hero.classList.add("is-revealed");
    });
  }

  // ------------------------------------------------------------------
  // Resume banner
  // ------------------------------------------------------------------
  function setResumeAvailable(available, summary, onResume, onDiscard) {
    const hero = $("#screen-welcome .card-hero");
    if (!hero) return;
    let banner = $("#resumeBanner", hero);
    if (!available) {
      if (banner) banner.remove();
      return;
    }
    if (!banner) {
      banner = el(`<div class="resume-banner" id="resumeBanner">
        <p class="resume-text">You have an assessment in progress.</p>
        <p class="resume-summary" id="resumeSummary"></p>
        <div class="resume-actions">
          <button class="btn btn-primary" id="btnResume" type="button">Resume</button>
          <button class="btn btn-ghost" id="btnDiscardResume" type="button">Start Fresh Instead</button>
        </div>
      </div>`);
      hero.insertBefore(banner, hero.querySelector(".hero-meta"));
    }
    $("#resumeSummary", banner).textContent = summary || "";
    const resumeBtn = $("#btnResume", banner);
    const discardBtn = $("#btnDiscardResume", banner);
    const freshResume = resumeBtn.cloneNode(true);
    const freshDiscard = discardBtn.cloneNode(true);
    resumeBtn.replaceWith(freshResume);
    discardBtn.replaceWith(freshDiscard);
    freshResume.addEventListener("click", onResume);
    freshDiscard.addEventListener("click", onDiscard);
  }

  return {
    $, $all, esc,
    showScreen, setProgress, setAccent, setResumeAvailable,
    renderAudience, renderTracks, renderPrograms, renderTestIntro,
    renderStage, renderSelfReport, renderQuestion, renderResults,
  };
})();
