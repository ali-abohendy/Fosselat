import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PlacementTest.css';

const STORAGE_KEY = "fosselat_placement_progress_v1";
const MAX_SAVE_AGE_MS = 7 * 24 * 3600 * 1000;

const ACCENTS = {
  quran: "var(--emerald)",
  arabic: "var(--indigo)",
  "islamic-studies": "var(--maroon)",
};
const INITIALS = { quran: "Q", arabic: "A", "islamic-studies": "I" };
const LETTERS = ["A", "B", "C", "D", "E"];

// --- Scoring Module ---
const Scoring = {
  filterQuestionsForAudience(questions, audience) {
    return questions.filter(q => !q.audience || q.audience === "both" || q.audience === audience);
  },
  gradeAnswer(question, response) {
    const max = question.points || 0;
    if (response === undefined || response === null) return { earned: 0, max };
    if (question.type === "mcq") {
      if (Array.isArray(question.scoreMap)) {
        const w = question.scoreMap[response] ?? 0;
        return { earned: +(max * w).toFixed(3), max };
      }
      return { earned: response === question.correct ? max : 0, max };
    }
    if (question.type === "shortAnswer") {
      if (question.freeform) {
        const attempted = typeof response === "string" && response.trim().length > 0;
        return { earned: attempted ? max : 0, max };
      }
      const text = (typeof response === "string" ? response : "").toLowerCase().trim();
      const hit = (question.acceptable || []).some(k => text.includes(k.toLowerCase()));
      return { earned: hit ? max : 0, max };
    }
    if (question.type === "timedRead") {
      const seconds = Number(response);
      if (!isFinite(seconds) || seconds <= 0) return { earned: 0, max };
      const ratio = seconds / (question.benchmarkSeconds || 20);
      let w;
      if (ratio <= 1.2) w = 1.0;
      else if (ratio <= 1.8) w = 0.7;
      else if (ratio <= 2.5) w = 0.4;
      else w = 0.15;
      return { earned: +(max * w).toFixed(3), max };
    }
    return { earned: 0, max };
  },
  pct(earned, max) {
    if (!max) return 0;
    return earned / max;
  },
  routeNext(block, blockPct) {
    const r = block.routing;
    const order = ["pass", "mid", "fail"];
    for (const key of order) {
      const rule = r[key];
      if (!rule) continue;
      if (blockPct >= (rule.minScore ?? 0)) {
        return rule.next ? { terminal: false, next: rule.next } : { terminal: true };
      }
    }
    return { terminal: true };
  },
  pickLevelFromBands(bands, overallPct) {
    for (const b of bands) {
      if (overallPct >= b.minScore) return b.levelId;
    }
    return bands[bands.length - 1].levelId;
  },
  aggregateSkills(answerLog) {
    const map = {};
    for (const a of answerLog) {
      if (!map[a.skill]) map[a.skill] = { skill: a.skill, earned: 0, max: 0 };
      map[a.skill].earned += a.earned;
      map[a.skill].max += a.max;
    }
    return Object.values(map).map(s => ({ ...s, pct: Scoring.pct(s.earned, s.max) }));
  },
  buildStrengthsWeaknesses(skillArr) {
    const withScores = skillArr.filter(s => s.max > 0);
    const descByPct = [...withScores].sort((a, b) => b.pct - a.pct);
    const ascByPct = [...withScores].sort((a, b) => a.pct - b.pct);
    let strengths = descByPct.filter(s => s.pct >= 0.65).slice(0, 3);
    if (strengths.length === 0 && descByPct.length && descByPct[0].pct >= 0.4) {
      strengths = descByPct.slice(0, Math.min(2, descByPct.length));
    }
    const strengthSkills = new Set(strengths.map(s => s.skill));
    let weaknesses = ascByPct.filter(s => s.pct < 0.5 && !strengthSkills.has(s.skill)).slice(0, 3);
    if (weaknesses.length === 0 && withScores.length) {
      const lowest = ascByPct[0];
      if (lowest && !strengthSkills.has(lowest.skill) && lowest.pct < 0.6) {
        weaknesses = [lowest];
      }
    }
    return { strengths, weaknesses };
  },
  estimateDuration(level, program) {
    const fastPace = program.fastPaceNote;
    if (!level.weeks) {
      return {
        label: level.durationText || "Individualized pace",
        note: "Paced with your teacher based on personal progress",
        lessonsPerWeek: fastPace || "2x / week (standard pace)",
      };
    }
    const label = level.weeks % 4.345 < 1 || level.weeks < 14
      ? `${level.weeks} weeks`
      : `${Math.round(level.weeks / 4.345)} months`;
    return {
      label,
      note: `${level.lessons || Math.round(level.weeks * 2)} lessons to complete this level`,
      lessonsPerWeek: fastPace || "2x / week (standard pace)",
    };
  },
  finalizeResult({ program, audience, path, terminalOutcome }) {
    const answerLog = [];
    let totalEarned = 0, totalMax = 0;
    path.forEach(block => {
      block.answers.forEach(a => {
        const skill = a.question.skillOverride || block.skill;
        answerLog.push({ skill, earned: a.earned, max: a.max });
        totalEarned += a.earned;
        totalMax += a.max;
      });
    });
    const overallPct = Scoring.pct(totalEarned, totalMax);
    const levels = program.levelsByAudience[audience];
    const bands = program.placementBandsByAudience[audience];
    const levelId = Scoring.pickLevelFromBands(bands, overallPct);
    const level = levels.find(l => l.id === levelId) || levels[0];
    const sortedLevels = [...levels].sort((a, b) => a.id - b.id);
    const levelPosition = sortedLevels.findIndex(l => l.id === level.id) + 1;
    const skillAgg = Scoring.aggregateSkills(answerLog);
    const { strengths, weaknesses } = Scoring.buildStrengthsWeaknesses(skillAgg);
    const duration = Scoring.estimateDuration(level, program);
    return {
      programId: program.id,
      programLabel: program.label,
      level,
      levelPosition,
      totalLevels: sortedLevels.length,
      overallPct,
      totalEarned,
      totalMax,
      skillAgg,
      strengths,
      weaknesses,
      duration,
      blocksVisited: path.map(p => p.blockName),
    };
  }
};

export default function PlacementTest() {
  const [data, setData] = useState(null);
  const [screen, setScreen] = useState('welcome');
  const [state, setState] = useState({
    audience: null,
    track: null,
    program: null,
    blockId: null,
    path: [],
    currentBlockQuestions: [],
    currentBlockAnswers: [],
    currentQIndex: 0,
  });
  const [resumeData, setResumeData] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (resumeData) return;
    if (!data) return;
    const trackParam = searchParams.get('track');
    const programParam = searchParams.get('program');
    const audienceParam = searchParams.get('audience');
    
    if (trackParam) {
      const track = data.tracks.find(t => t.id === trackParam);
      if (track) {
        document.documentElement.style.setProperty('--accent', ACCENTS[track.id] || 'var(--color-gold)');
        document.documentElement.style.setProperty('--accent-dim', ACCENTS[track.id] || 'var(--color-gold-dim)');
        
        if (programParam) {
          const program = track.programs.find(p => p.id === programParam);
          if (program && audienceParam) {
            // Direct to test intro with everything selected
            setState(prev => ({ ...prev, audience: audienceParam, track, program }));
            setScreen('testintro');
            return;
          } else if (program) {
            // Have track+program, need audience
            setState(prev => ({ ...prev, track, program }));
            setScreen('audience'); // Ask audience first, but we'll need to handle this
            return;
          }
        }
        if (audienceParam) {
          // Have track+audience, need program
          setState(prev => ({ ...prev, audience: audienceParam, track }));
          setScreen('program');
          return;
        }
        // Just track - go to audience selection
        setState(prev => ({ ...prev, track }));
        setScreen('audience');
      }
    }
  }, [data, searchParams, resumeData]);

  useEffect(() => {
    fetch('/questions.json')
      .then(r => r.json())
      .then(d => {
        setData(d);
        checkResume(d);
      })
      .catch(e => console.error("Error loading questions:", e));
  }, []);

  // --- Persistence ---
  function safeStorage() {
    try {
      const testKey = "__test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }

  function saveProgress(currentState) {
    const storage = safeStorage();
    if (!storage || !currentState.program) return;
    try {
      const snapshot = {
        v: 1,
        audience: currentState.audience,
        trackId: currentState.track.id,
        programId: currentState.program.id,
        blockId: currentState.blockId,
        path: currentState.path.map(b => ({
          blockId: b.blockId,
          answers: b.answers.map(a => ({ qid: a.question.id, response: a.response }))
        })),
        currentBlockAnswers: currentState.currentBlockAnswers.map(a => ({ qid: a.question.id, response: a.response })),
        currentQIndex: currentState.currentQIndex,
        savedAt: Date.now(),
      };
      storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { }
  }

  function clearProgress() {
    const storage = safeStorage();
    if (!storage) return;
    try { storage.removeItem(STORAGE_KEY); } catch (e) { }
  }

  function checkResume(appData) {
    const storage = safeStorage();
    if (!storage) return;
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return;
      const snap = JSON.parse(raw);
      if (!snap || snap.v !== 1 || !snap.trackId || !snap.programId || !snap.audience || !snap.blockId) return;
      if (!snap.savedAt || Date.now() - snap.savedAt > MAX_SAVE_AGE_MS) return;
      
      const track = appData.tracks.find(t => t.id === snap.trackId);
      const program = track && track.programs.find(p => p.id === snap.programId);
      if (!track || !program || !program.blocks[snap.blockId]) return;
      
      setResumeData({ snap, track, program });
    } catch (e) { }
  }

  function findQuestion(program, blockId, qid) {
    const block = program.blocks[blockId];
    return block && block.questions.find(q => q.id === qid);
  }

  function rebuildAnswers(program, blockId, plainAnswers) {
    return plainAnswers
      .map(a => {
        const q = findQuestion(program, blockId, a.qid);
        if (!q) return null;
        const g = Scoring.gradeAnswer(q, a.response);
        return { question: q, response: a.response, earned: g.earned, max: g.max };
      })
      .filter(Boolean);
  }

  function doResume() {
    if (!resumeData) return;
    const { snap, track, program } = resumeData;
    
    document.documentElement.style.setProperty("--accent", ACCENTS[track.id] || "var(--color-gold)");
    document.documentElement.style.setProperty("--accent-dim", ACCENTS[track.id] || "var(--color-gold-dim)");

    const rebuiltPath = snap.path.map(b => {
      const block = program.blocks[b.blockId];
      return {
        blockId: b.blockId,
        blockName: block.name,
        skill: block.skill,
        difficulty: block.difficulty,
        answers: rebuildAnswers(program, b.blockId, b.answers),
      };
    });

    const currentBlock = program.blocks[snap.blockId];
    const filteredQ = Scoring.filterQuestionsForAudience(currentBlock.questions, snap.audience);
    const currentAnswers = rebuildAnswers(program, snap.blockId, snap.currentBlockAnswers);
    
    const newState = {
      audience: snap.audience,
      track: track,
      program: program,
      blockId: snap.blockId,
      path: rebuiltPath,
      currentBlockQuestions: filteredQ,
      currentBlockAnswers: currentAnswers,
      currentQIndex: Math.min(snap.currentQIndex, filteredQ.length),
    };
    
    setState(newState);
    setResumeData(null);
    runBlockLoop(newState);
  }

  function discardResume() {
    clearProgress();
    setResumeData(null);
  }

  // --- Flow Actions ---
  function resetAll() {
    clearProgress();
    setState({
      audience: null, track: null, program: null, blockId: null,
      path: [], currentBlockQuestions: [], currentBlockAnswers: [], currentQIndex: 0
    });
    setResultData(null);
    setProgressVisible(false);
    document.documentElement.style.setProperty("--accent", "var(--color-gold)");
    document.documentElement.style.setProperty("--accent-dim", "var(--color-gold-dim)");
    checkResume(data);
    setScreen('welcome');
  }

  function updateProgressUI(st) {
    if (!st.program || !st.blockId) return;
    const order = Object.keys(st.program.blocks);
    const idx = order.indexOf(st.blockId);
    const total = order.length;
    const withinFrac = st.currentBlockQuestions.length ? st.currentQIndex / st.currentBlockQuestions.length : 0;
    const pct = Math.min(0.97, (idx + withinFrac) / total);
    const label = `Stage ${idx + 1} of ${total} · Question ${st.currentQIndex + 1} of ${st.currentBlockQuestions.length}`;
    setProgressPct(pct);
    setProgressLabel(label);
    setProgressVisible(true);
  }

  function runBlockLoop(st) {
    if (st.currentQIndex >= st.currentBlockQuestions.length) {
      finishBlock(st);
    } else {
      updateProgressUI(st);
      setState({ ...st });
      setScreen('question');
    }
  }

  function startTest(prog = state.program, aud = state.audience, trk = state.track) {
    clearProgress();
    const st = {
      ...state,
      program: prog,
      audience: aud,
      track: trk,
      blockId: prog.startBlock,
      path: [],
    };
    const block = prog.blocks[prog.startBlock];
    st.currentBlockQuestions = Scoring.filterQuestionsForAudience(block.questions, aud);
    st.currentBlockAnswers = [];
    st.currentQIndex = 0;
    runBlockLoop(st);
  }

  function onAnswer(response) {
    const q = state.currentBlockQuestions[state.currentQIndex];
    const g = Scoring.gradeAnswer(q, response);
    const newAnswers = [...state.currentBlockAnswers, { question: q, response, earned: g.earned, max: g.max }];
    
    const st = {
      ...state,
      currentBlockAnswers: newAnswers,
      currentQIndex: state.currentQIndex + 1
    };
    saveProgress(st);
    runBlockLoop(st);
  }

  function finishBlock(st) {
    const block = st.program.blocks[st.blockId];
    const earned = st.currentBlockAnswers.reduce((s, a) => s + a.earned, 0);
    const max = st.currentBlockAnswers.reduce((s, a) => s + a.max, 0);
    const blockPct = Scoring.pct(earned, max);

    const newPath = [...st.path, {
      blockId: st.blockId,
      blockName: block.name,
      skill: block.skill,
      difficulty: block.difficulty,
      answers: st.currentBlockAnswers,
    }];
    
    const outcome = Scoring.routeNext(block, blockPct);
    
    if (outcome.terminal) {
      finalize(st, newPath, outcome);
    } else {
      const nextBlockId = outcome.next;
      const nextBlock = st.program.blocks[nextBlockId];
      const nextSt = {
        ...st,
        path: newPath,
        blockId: nextBlockId,
        currentBlockQuestions: Scoring.filterQuestionsForAudience(nextBlock.questions, st.audience),
        currentBlockAnswers: [],
        currentQIndex: 0
      };
      saveProgress(nextSt);
      runBlockLoop(nextSt);
    }
  }

  function finalize(st, finalPath, terminalOutcome) {
    clearProgress();
    const res = Scoring.finalizeResult({
      program: st.program,
      audience: st.audience,
      path: finalPath,
      terminalOutcome,
    });
    setResultData(res);
    setState({ ...st, path: finalPath });
    setProgressVisible(false);
    setScreen('results');
  }

  function handleAudienceSelect(aud) {
    setState({ ...state, audience: aud });
    setScreen('track');
  }

  function handleTrackSelect(trk) {
    document.documentElement.style.setProperty("--accent", ACCENTS[trk.id] || "var(--color-gold)");
    document.documentElement.style.setProperty("--accent-dim", ACCENTS[trk.id] || "var(--color-gold-dim)");
    setState({ ...state, track: trk, program: null });
    setScreen('program');
  }

  function handleProgramSelect(prog) {
    setState({ ...state, program: prog });
    setScreen('testintro');
  }

  // --- Render Helpers ---
  const renderWelcome = () => (
    <div className="pt-screen">
      <div className="pt-card pt-card-hero">
        <h1 className="pt-display">Determine your path.</h1>
        <p className="pt-lede">Our adaptive assessment finds exactly where you should start in our curriculum.</p>
        
        {resumeData && (
          <div className="pt-resume-banner">
            <p className="pt-resume-text">You have an assessment in progress.</p>
            <p className="pt-resume-summary">
              {resumeData.track.label} — {resumeData.program.label} ({resumeData.snap.audience === "kids" ? "Kids" : "Adults"})
            </p>
            <div className="pt-resume-actions">
              <button className="pt-btn pt-btn-primary" onClick={doResume}>Resume</button>
              <button className="pt-btn pt-btn-ghost" onClick={discardResume}>Start Fresh Instead</button>
            </div>
          </div>
        )}
        
        <button className="pt-btn pt-btn-primary pt-btn-lg" onClick={() => setScreen('audience')} style={{ marginTop: '28px', padding: '16px 30px', fontSize: '1rem' }}>Begin Assessment</button>
      </div>
    </div>
  );

  const renderAudience = () => (
    <div className="pt-screen">
      <div className="pt-step-head">
        <div className="pt-eyebrow">Step 1</div>
        <h1 className="pt-display-sm">Who is taking the test?</h1>
      </div>
      <div className="pt-choice-grid pt-choice-grid-2">
        <button className="pt-choice-card" onClick={() => handleAudienceSelect('kids')}>
          <span className="cc-icon">K</span>
          <span className="cc-title">Kids</span>
          <span className="cc-desc">Ages roughly 5–12. Simpler wording, shorter tasks.</span>
        </button>
        <button className="pt-choice-card" onClick={() => handleAudienceSelect('adults')}>
          <span className="cc-icon">A</span>
          <span className="cc-title">Adults</span>
          <span className="cc-desc">Teens and adults. Full-length assessment.</span>
        </button>
      </div>
    </div>
  );

  const renderTrack = () => (
    <div className="pt-screen">
      <div className="pt-step-head">
        <div className="pt-eyebrow">Step 2</div>
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
        <div className="pt-eyebrow">Step 3</div>
        <h1 className="pt-display-sm">Choose a program — {state.track?.label}</h1>
      </div>
      <div className="pt-choice-list">
        {state.track?.programs.map(p => (
          <button key={p.id} className="pt-choice-row" style={{ '--card-accent': ACCENTS[state.track.id] }} onClick={() => handleProgramSelect(p)}>
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

  const renderTestIntro = () => {
    if (!state.program) return null;
    const allBlocks = Object.values(state.program.blocks);
    const minQ = allBlocks[0].questions.length;
    const maxQ = allBlocks.reduce((s, b) => s + b.questions.length, 0);
    const minMin = Math.max(2, Math.round((minQ * 35) / 60));
    const maxMin = Math.max(minMin + 3, Math.round((maxQ * 40) / 60));
    
    return (
      <div className="pt-screen">
        <div className="pt-card pt-card-narrow">
          <div className="pt-eyebrow">{state.track?.label} · {state.program.label}</div>
          <h2 className="pt-display-sm">Ready when you are.</h2>
          <p className="pt-lede">This assessment adapts as you go — strong answers move you ahead faster, so you won't repeat what you already know.</p>
          <div className="pt-intro-stats">
            <div><dt>Questions</dt><dd>{minQ}–{maxQ}</dd></div>
            <div><dt>Est. Time</dt><dd>{minMin}–{maxMin} min</dd></div>
            <div><dt>Format</dt><dd>Adaptive</dd></div>
          </div>
          <button className="pt-btn pt-btn-primary pt-btn-block" style={{ marginTop: '20px' }} onClick={() => startTest()}>Start Test</button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!resultData) return null;
    const accent = ACCENTS[state.track.id] || "var(--color-gold)";
    
    return (
      <div className="pt-screen">
        <div className="pt-results-hero" style={{ '--card-accent': accent }}>
          <svg className="rh-motif" viewBox="0 0 100 100" aria-hidden="true">
            <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7"/>
            <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" transform="rotate(45 50 50)"/>
          </svg>
          <p className="pt-rh-eyebrow">Recommended Starting Level</p>
          <p className="pt-rh-level-tag">Level {resultData.level.id} of {resultData.totalLevels}</p>
          <h2 className="pt-rh-level">{resultData.level.name}</h2>
          <p className="pt-rh-program">{state.track.label} — {resultData.programLabel}</p>
          {resultData.level.desc && <p className="pt-rh-level-desc">“{resultData.level.desc}”</p>}
          <div className="pt-rh-score">
            <span className="num">{Math.round(resultData.overallPct * 100)}</span><span className="pct">%</span>
          </div>
          <p className="pt-rh-score-label">Overall Score</p>
        </div>
        <div className="pt-results-grid">
          <div className="pt-results-card">
            <h3>Strengths</h3>
            <ul>
              {resultData.strengths.length ? resultData.strengths.map(s => (
                <li key={s.skill}><span className="tag-dot ok"></span><span>{s.skill} <strong>({Math.round(s.pct * 100)}%)</strong></span></li>
              )) : <li>Building across the board — a full profile will sharpen as you continue.</li>}
            </ul>
          </div>
          <div className="pt-results-card">
            <h3>Areas to Build</h3>
            <ul>
              {resultData.weaknesses.length ? resultData.weaknesses.map(s => (
                <li key={s.skill}><span className="tag-dot watch"></span><span>{s.skill} <strong>({Math.round(s.pct * 100)}%)</strong></span></li>
              )) : <li>No specific gaps stood out — nicely balanced.</li>}
            </ul>
          </div>
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
        <div className="pt-results-actions">
          <button className="pt-btn pt-btn-primary" onClick={() => { clearProgress(); setScreen('track'); }}>Explore Another Program</button>
          <button className="pt-btn pt-btn-ghost" onClick={() => startTest()}>Retake This Assessment</button>
        </div>
      </div>
    );
  };

  // --- Sub-components for Question types ---
  const MCQ = ({ q, onSubmit }) => {
    const [selected, setSelected] = useState(null);
    return (
      <>
        <div className="pt-q-options" role="group">
          {q.options.map((opt, i) => (
            <button key={i} type="button" className={`pt-q-option ${selected === i ? 'is-picked' : ''}`} onClick={() => setSelected(i)}>
              <span className="opt-mark">{LETTERS[i] || i + 1}</span><span>{opt}</span>
            </button>
          ))}
        </div>
        <div className="pt-q-actions">
          <button className="pt-btn pt-btn-primary" disabled={selected === null} onClick={() => onSubmit(selected)}>Continue</button>
        </div>
      </>
    );
  };

  const ShortAnswer = ({ q, onSubmit }) => {
    const [val, setVal] = useState("");
    return (
      <>
        <textarea className="pt-q-textarea" placeholder="Type your answer…" value={val} onChange={e => setVal(e.target.value)} />
        <div className="pt-q-actions">
          <button className="pt-btn pt-btn-primary" onClick={() => onSubmit(val)}>Continue</button>
        </div>
      </>
    );
  };

  const TimedRead = ({ q, onSubmit }) => {
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [started, setStarted] = useState(false);
    const startTs = useRef(null);
    const rafId = useRef(null);

    const updateClock = () => {
      if (startTs.current) {
        setElapsed((performance.now() - startTs.current) / 1000);
        rafId.current = requestAnimationFrame(updateClock);
      }
    };

    const start = () => {
      startTs.current = performance.now();
      setStarted(true);
      setRunning(true);
      rafId.current = requestAnimationFrame(updateClock);
    };

    const finish = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      setRunning(false);
      const finalTime = (performance.now() - startTs.current) / 1000;
      onSubmit(finalTime);
    };

    return (
      <div className="pt-timed-panel">
        <div className="pt-timed-clock">{elapsed.toFixed(1)}s</div>
        {!started ? (
          <button className="pt-btn pt-btn-primary" onClick={start}>Start Reading</button>
        ) : (
          <button className="pt-btn pt-btn-primary" onClick={finish} disabled={!running}>I've Finished</button>
        )}
        <p className="pt-timed-hint">Read the passage above at your natural pace, then press the button.</p>
      </div>
    );
  };

  const renderQuestion = () => {
    const q = state.currentBlockQuestions[state.currentQIndex];
    if (!q || !state.program) return null;
    const block = state.program.blocks[state.blockId];
    const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

    const speak = (text) => {
      if (!canSpeak) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ar-SA";
      u.rate = 0.82;
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("ar"));
      if (arVoice) u.voice = arVoice;
      window.speechSynthesis.speak(u);
    };

    return (
      <div className="pt-screen" key={q.id}>
        <div className="pt-card pt-card-question">
          <div className="pt-q-stage">{state.track?.label} · {block.name}</div>
          <h2 className="pt-q-prompt">{q.prompt}</h2>
          
          {q.arabic && (
            <div className="pt-q-stimulus-wrap">
              <div className={`pt-q-stimulus ${q.arabic.length > 24 ? '' : 'small'}`}>{q.arabic}</div>
              {q.allowListen && canSpeak && (
                <button type="button" className="pt-listen-btn" onClick={() => speak(q.arabic)}>🔊 Listen</button>
              )}
            </div>
          )}
          
          {q.type === 'mcq' && <MCQ q={q} onSubmit={onAnswer} />}
          {q.type === 'shortAnswer' && <ShortAnswer q={q} onSubmit={onAnswer} />}
          {q.type === 'timedRead' && <TimedRead q={q} onSubmit={onAnswer} />}
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
        {screen === 'audience' && renderAudience()}
        {screen === 'track' && renderTrack()}
        {screen === 'program' && renderProgram()}
        {screen === 'testintro' && renderTestIntro()}
        {screen === 'question' && renderQuestion()}
        {screen === 'results' && renderResults()}
      </main>
    </div>
  );
}
