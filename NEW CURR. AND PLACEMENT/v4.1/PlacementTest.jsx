import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PlacementTest.css';
import * as Engine from './placementEngine';

const STORAGE_KEY = "fosselat_placement_progress_v2";
const LEGACY_KEYS = ["fosselat_placement_progress_v1"];
const MAX_SAVE_AGE_MS = 7 * 24 * 3600 * 1000;

const ACCENTS = {
  quran: "var(--emerald)",
  arabic: "var(--indigo)",
  "islamic-studies": "var(--maroon)",
};
const INITIALS = { quran: "Q", arabic: "A", "islamic-studies": "I" };
const LETTERS = ["A", "B", "C", "D", "E"];

function safeStorage() {
  try {
    const k = "__test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch { return null; }
}

export default function PlacementTest() {
  const [data, setData] = useState(null);
  const [screen, setScreen] = useState('welcome');
  const [track, setTrack] = useState(null);
  const [program, setProgram] = useState(null);
  const [ageInput, setAgeInput] = useState("");
  const [session, setSession] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [stageInfo, setStageInfo] = useState(null);   // {kind:'start'|'up'|'down', level}
  const [resumeData, setResumeData] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetch('/questions.json')
      .then(r => r.json())
      .then(d => { setData(d); checkResume(d); })
      .catch(e => console.error("Error loading questions:", e));
  }, []);

  // deep links: ?track=quran&program=memorization  (age/audience params are ignored)
  useEffect(() => {
    if (!data || resumeData) return;
    const trackParam = searchParams.get('track');
    if (!trackParam) return;
    const trk = data.tracks.find(t => t.id === trackParam);
    if (!trk) return;
    applyAccent(trk);
    const programParam = searchParams.get('program');
    const prog = programParam && trk.programs.find(p => p.id === programParam);
    setTrack(trk);
    if (prog) { setProgram(prog); setScreen('testintro'); }
    else setScreen('program');
  }, [data, searchParams, resumeData]);

  function applyAccent(trk) {
    document.documentElement.style.setProperty('--accent', ACCENTS[trk.id] || 'var(--color-gold)');
    document.documentElement.style.setProperty('--accent-dim', ACCENTS[trk.id] || 'var(--color-gold-dim)');
  }

  // ---------------- persistence ----------------
  function saveProgress(sess) {
    const storage = safeStorage();
    if (!storage || !sess) return;
    try { storage.setItem(STORAGE_KEY, JSON.stringify(Engine.snapshotOf(sess))); } catch { /* storage unavailable */ }
  }
  function clearProgress() {
    const storage = safeStorage();
    if (!storage) return;
    try {
      storage.removeItem(STORAGE_KEY);
      LEGACY_KEYS.forEach(k => storage.removeItem(k));
    } catch { /* storage unavailable */ }
  }
  function checkResume(appData) {
    const storage = safeStorage();
    if (!storage) return;
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return;
      const snap = JSON.parse(raw);
      if (!snap || snap.v !== 2 || snap.finished) return;
      if (!snap.savedAt || Date.now() - snap.savedAt > MAX_SAVE_AGE_MS) return;
      const sess = Engine.rehydrate(appData, snap);
      if (!sess) return;
      const trk = appData.tracks.find(t => t.id === snap.trackId);
      const prog = trk.programs.find(p => p.id === snap.programId);
      setResumeData({ session: sess, track: trk, program: prog });
    } catch { /* storage unavailable */ }
  }

  function doResume() {
    if (!resumeData) return;
    const { session: sess, track: trk, program: prog } = resumeData;
    applyAccent(trk);
    setTrack(trk); setProgram(prog); setSession(sess); setResumeData(null);
    const st = sess.perLevel[sess.currentLevel];
    const i = Math.min(st.answers.filter(a => a !== undefined).length, st.slots.length);
    setQIndex(i);
    if (i >= st.slots.length && !st.done) { finishLevel(sess); return; }
    updateProgress(sess, i);
    setScreen('question');
  }
  function discardResume() { clearProgress(); setResumeData(null); }

  // ---------------- flow ----------------
  function resetAll() {
    clearProgress();
    setTrack(null); setProgram(null); setSession(null); setResultData(null);
    setQIndex(0); setStageInfo(null); setProgressVisible(false); setAgeInput("");
    document.documentElement.style.setProperty("--accent", "var(--color-gold)");
    document.documentElement.style.setProperty("--accent-dim", "var(--color-gold-dim)");
    checkResume(data);
    setScreen('welcome');
  }

  function handleTrackSelect(trk) {
    applyAccent(trk);
    setTrack(trk); setProgram(null);
    setScreen('program');
  }
  function handleProgramSelect(prog) { setProgram(prog); setScreen('testintro'); }

  function beginSelfReport() { setScreen('selfreport'); }

  function handleClaim(claimLevel) {
    clearProgress();
    const seed = (Date.now() ^ (Math.random() * 0xFFFFFFFF)) >>> 0;
    const sess = Engine.startSession(data, track.id, program.id, claimLevel, seed);
    const age = parseInt(ageInput, 10);
    sess.age = Number.isFinite(age) && age > 0 ? age : null;   // informational only
    setSession(sess);
    setQIndex(0);
    setStageInfo({ kind: 'start', level: sess.currentLevel });
    saveProgress(sess);
    setScreen('stage');
  }

  function updateProgress(sess, i) {
    const cfg = Engine.configOf(data);
    const lvl = Engine.levelsOf(Engine.resolve(data, sess).program).find(l => l.id === sess.currentLevel);
    setProgressPct(Engine.progressFraction(sess, i, cfg.questionsPerLevel));
    setProgressLabel(`Level ${sess.currentLevel} — ${lvl.name} · Question ${Math.min(i + 1, cfg.questionsPerLevel)} of ${sess.perLevel[sess.currentLevel].slots.length}`);
    setProgressVisible(true);
  }

  function startLevelQuestions() {
    setStageInfo(null);
    setQIndex(0);
    updateProgress(session, 0);
    setScreen('question');
  }

  function onAnswer(pickedIndex) {
    const sess = session;
    Engine.answerSlot(data, sess, qIndex, pickedIndex);
    const st = sess.perLevel[sess.currentLevel];
    const next = qIndex + 1;
    saveProgress(sess);
    if (next >= st.slots.length) { finishLevel(sess); return; }
    setQIndex(next);
    updateProgress(sess, next);
    setSession({ ...sess });
  }

  function finishLevel(sess) {
    Engine.gradeLevel(data, sess);
    const outcome = Engine.advance(data, sess);
    if (outcome.move === 'finish') {
      clearProgress();
      const res = Engine.finalizeResult(data, sess);
      setResultData(res);
      setSession({ ...sess });
      setProgressVisible(false);
      setScreen('results');
      return;
    }
    saveProgress(sess);
    setSession({ ...sess });
    setQIndex(0);
    setStageInfo({ kind: outcome.move, level: outcome.to });
    setScreen('stage');
  }

  // ---------------- screens ----------------
  const renderWelcome = () => (
    <div className="pt-screen">
      <div className="pt-card pt-card-hero">
        <h1 className="pt-display">Determine your path.</h1>
        <p className="pt-lede">Our adaptive assessment finds exactly where you should start in our curriculum — the same pathway for every student, placed purely by what you can do.</p>
        {resumeData && (
          <div className="pt-resume-banner">
            <p className="pt-resume-text">You have an assessment in progress.</p>
            <p className="pt-resume-summary">
              {resumeData.track.label} — {resumeData.program.label} · Level {resumeData.session.currentLevel}
            </p>
            <div className="pt-resume-actions">
              <button className="pt-btn pt-btn-primary" onClick={doResume}>Resume</button>
              <button className="pt-btn pt-btn-ghost" onClick={discardResume}>Start Fresh Instead</button>
            </div>
          </div>
        )}
        <button className="pt-btn pt-btn-primary pt-btn-lg" onClick={() => setScreen('track')}
          style={{ marginTop: '28px', padding: '16px 30px', fontSize: '1rem' }}>Begin Assessment</button>
      </div>
    </div>
  );

  const renderTrack = () => (
    <div className="pt-screen">
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

  const renderProgram = () => (
    <div className="pt-screen">
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
              {p.accessNote && <span className="cr-note">{p.accessNote}</span>}
            </span>
            <span className="cr-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTestIntro = () => {
    if (!program) return null;
    const cfg = Engine.configOf(data);
    const nLevels = program.levels.length;
    const minQ = cfg.questionsPerLevel;
    const maxQ = cfg.questionsPerLevel * Math.min(nLevels, 4);
    const minMin = Math.max(3, Math.round((minQ * 30) / 60));
    const maxMin = Math.max(minMin + 4, Math.round((maxQ * 35) / 60));
    return (
      <div className="pt-screen">
        <div className="pt-card pt-card-narrow">
          <div className="pt-eyebrow">{track?.label} · {program.label}</div>
          <h2 className="pt-display-sm">Ready when you are.</h2>
          <p className="pt-lede">You'll answer {cfg.questionsPerLevel} questions per level. Pass a level ({Math.round(cfg.masteryThreshold * 100)}% or more) and you move up; the test ends once your exact starting level is proven.</p>
          <div className="pt-intro-stats">
            <div><dt>Questions</dt><dd>{minQ}–{maxQ}</dd></div>
            <div><dt>Est. Time</dt><dd>{minMin}–{maxMin} min</dd></div>
            <div><dt>Levels</dt><dd>{nLevels}</dd></div>
          </div>
          <label className="pt-age-field">
            <span>Your age <em>(optional — saved for our records only; it never affects your placement)</em></span>
            <input type="number" min="3" max="120" inputMode="numeric" placeholder="e.g. 12"
              value={ageInput} onChange={e => setAgeInput(e.target.value)} />
          </label>
          <button className="pt-btn pt-btn-primary pt-btn-block" style={{ marginTop: '16px' }} onClick={beginSelfReport}>Start Test</button>
        </div>
      </div>
    );
  };

  const renderSelfReport = () => {
    if (!program) return null;
    const sr = program.selfReport;
    return (
      <div className="pt-screen">
        <div className="pt-step-head">
          <div className="pt-eyebrow">{track?.label} · {program.label}</div>
          <h1 className="pt-display-sm">{sr.prompt}</h1>
          <p className="pt-lede" style={{ margin: '10px auto 0' }}>This only chooses where the test begins — your answers decide your level.</p>
        </div>
        <div className="pt-choice-list">
          {sr.options.map((o, i) => (
            <button key={i} className="pt-choice-row" onClick={() => handleClaim(o.claimLevel)}>
              <span><span className="cr-title">{o.label}</span></span>
              <span className="cr-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStage = () => {
    if (!stageInfo || !session) return null;
    const lvl = program.levels.find(l => l.id === stageInfo.level);
    const msg = {
      start: { head: "Let's start here.", sub: "Answer a few short questions. Do well, and we'll move you up to the next level automatically." },
      up: { head: "Well done — moving up!", sub: "You passed that level. Let's see how you do one level higher." },
      down: { head: "Let's try a step back.", sub: "No problem at all — we'll check the level just below to find your perfect start." },
    }[stageInfo.kind];
    return (
      <div className="pt-screen">
        <div className="pt-card pt-card-narrow pt-stage-card">
          <div className="pt-eyebrow">{track?.label} · {program?.label}</div>
          <h2 className="pt-display-sm">{msg.head}</h2>
          <p className="pt-lede">{msg.sub}</p>
          <div className="pt-stage-level">
            <span className="pt-stage-tag">Level {lvl.id} of {program.levels.length}</span>
            <span className="pt-stage-name">{lvl.name}</span>
            <span className="pt-stage-desc">{lvl.desc}</span>
          </div>
          <button className="pt-btn pt-btn-primary pt-btn-block" onClick={startLevelQuestions}>
            {stageInfo.kind === 'start' ? 'Begin' : 'Continue'}
          </button>
        </div>
      </div>
    );
  };

  const MCQ = ({ q, onSubmit }) => {
    const [selected, setSelected] = useState(null);
    const ar = q.optionsArabic;
    return (
      <>
        <div className={`pt-q-options${ar ? ' pt-q-options-ar' : ''}`} role="group">
          {q.options.map((opt, i) => (
            <button key={i} type="button" className={`pt-q-option ${selected === i ? 'is-picked' : ''}`} onClick={() => setSelected(i)}>
              <span className="opt-mark">{LETTERS[i] || i + 1}</span>
              {ar ? <span className="opt-ar" lang="ar" dir="rtl">{opt}</span> : <span>{opt}</span>}
            </button>
          ))}
        </div>
        <div className="pt-q-actions">
          <button className="pt-btn pt-btn-ghost" onClick={() => onSubmit(undefined)}>Skip</button>
          <button className="pt-btn pt-btn-primary" disabled={selected === null} onClick={() => onSubmit(selected)}>Continue</button>
        </div>
      </>
    );
  };

  const renderQuestion = () => {
    if (!session) return null;
    const st = session.perLevel[session.currentLevel];
    if (!st || qIndex >= st.slots.length) return null;
    const q = Engine.presentSlot(data, session, qIndex);
    const lvl = program.levels.find(l => l.id === session.currentLevel);
    return (
      <div className="pt-screen" key={q.id}>
        <div className="pt-card pt-card-question">
          <div className="pt-q-stage">{track?.label} · Level {lvl.id}: {lvl.name}</div>
          <h2 className="pt-q-prompt">{q.prompt}</h2>
          {q.arabicParts ? (
            <div className="pt-q-stimulus-wrap">
              {q.arabicParts.map((part, pi) => (
                <div key={pi} className="pt-q-excerpt">
                  <div className="pt-q-excerpt-label">Excerpt {pi + 1}</div>
                  <div className="pt-q-stimulus pt-q-stimulus-part" lang="ar" dir="rtl">{part}</div>
                </div>
              ))}
            </div>
          ) : q.arabic && (
            <div className="pt-q-stimulus-wrap">
              <div className={`pt-q-stimulus ${q.arabic.length > 24 ? '' : 'small'}`} lang="ar" dir="rtl">{q.arabic}</div>
            </div>
          )}
          <MCQ q={q} onSubmit={onAnswer} />
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!resultData) return null;
    const accent = ACCENTS[track.id] || "var(--color-gold)";
    const r = resultData;
    return (
      <div className="pt-screen">
        <div className="pt-results-hero" style={{ '--card-accent': accent }}>
          <svg className="rh-motif" viewBox="0 0 100 100" aria-hidden="true">
            <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7"/>
            <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" transform="rotate(45 50 50)"/>
          </svg>
          <p className="pt-rh-eyebrow">Recommended Starting Level</p>
          <p className="pt-rh-level-tag">Level {r.level.id} of {r.totalLevels}</p>
          <h2 className="pt-rh-level">{r.level.name}</h2>
          <p className="pt-rh-program">{r.trackLabel} — {r.programLabel}</p>
          {r.level.desc && <p className="pt-rh-level-desc">“{r.level.desc}”</p>}
          <p className="pt-rh-basis">
            {r.highestMastered
              ? `You proved mastery up to Level ${r.highestMastered} — so this is where your learning begins.`
              : `We'll build you up from the very start — the fastest route to solid mastery.`}
          </p>
        </div>

        <div className="pt-level-rows">
          <h3>Your level-by-level results</h3>
          {r.levelScores.map(ls => (
            <div key={ls.level} className={`pt-level-row ${ls.mastered ? 'ok' : 'miss'}`}>
              <span className="lr-name">Level {ls.level} — {ls.name}</span>
              <span className="lr-bar"><span className="lr-fill" style={{ width: `${Math.round(ls.pct * 100)}%` }}></span></span>
              <span className="lr-score">{ls.correct}/{ls.of}</span>
              <span className={`lr-flag ${ls.mastered ? 'ok' : 'miss'}`}>{ls.mastered ? 'Passed' : 'Not yet'}</span>
            </div>
          ))}
        </div>

        <div className="pt-results-grid">
          <div className="pt-results-card">
            <h3>Strengths</h3>
            <ul>
              {r.strengths.length ? r.strengths.map(s => (
                <li key={s.skill}><span className="tag-dot ok"></span><span>{s.skill} <strong>({Math.round(s.pct * 100)}%)</strong></span></li>
              )) : <li>Building across the board — a full profile will sharpen as you continue.</li>}
            </ul>
          </div>
          <div className="pt-results-card">
            <h3>Areas to Build</h3>
            <ul>
              {r.weaknesses.length ? r.weaknesses.map(s => (
                <li key={s.skill}><span className="tag-dot watch"></span><span>{s.skill} <strong>({Math.round(s.pct * 100)}%)</strong></span></li>
              )) : <li>No specific gaps stood out — nicely balanced.</li>}
            </ul>
          </div>
          <div className="pt-results-card">
            <h3>Estimated Duration</h3>
            <div className="stat-big">{r.duration.label}</div>
            <div className="stat-sub">{r.duration.note}</div>
          </div>
          <div className="pt-results-card">
            <h3>Recommended Pace</h3>
            <div className="stat-big">{r.duration.lessonsPerWeek}</div>
            <div className="stat-sub">Suggested weekly lessons to progress steadily</div>
          </div>
        </div>
        <div className="pt-results-actions">
          <button className="pt-btn pt-btn-primary" onClick={resetAll}>Explore Another Program</button>
          <button className="pt-btn pt-btn-ghost" onClick={() => { setResultData(null); setScreen('selfreport'); }}>Retake This Assessment</button>
        </div>
      </div>
    );
  };

  if (!data) return <div className="placement-test-container"><div className="pt-main">Loading...</div></div>;

  return (
    <div className="placement-test-container">
      <div className="pt-topbar">
        <button className="pt-brand" onClick={() => navigate('/')}>
          <svg className="brand-mark" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2L2 12l10 10 10-10L12 2zm0 14.5L7.5 12 12 7.5 16.5 12 12 16.5z"/>
          </svg>
          Fosselat <em>Academy</em>
        </button>
        {progressVisible && (
          <div className="pt-progress-wrap">
            <div className="pt-progress-label">{progressLabel}</div>
            <div className="pt-progress-track">
              <div className="pt-progress-fill" style={{ width: `${Math.round(progressPct * 100)}%` }}></div>
            </div>
          </div>
        )}
      </div>

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
