const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/PlacementTest.jsx', 'utf8');

// 1. Remove renderUserInfo screen string
const renderUserInfoStr = `  const renderUserInfo = () => {
    if (user) {
      return (
        <div className="pt-screen">
          <div className="pt-card" style={{ maxWidth: 480 }}>
            <p className="pt-step-label">Before we begin</p>
            <h2 className="pt-card-title">Who is taking this test?</h2>
            <div className="pt-userinfo-form" style={{ marginTop: '24px' }}>
              <button 
                className="pt-btn pt-btn-ghost pt-btn-lg" 
                style={{ width: '100%', marginBottom: '12px', justifyContent: 'flex-start', padding: '16px' }}
                onClick={() => handleAudienceSelect(true)}
              >
                <strong>Myself (Adult, 16+)</strong>
              </button>
              <button 
                className="pt-btn pt-btn-ghost pt-btn-lg" 
                style={{ width: '100%', justifyContent: 'flex-start', padding: '16px' }}
                onClick={() => handleAudienceSelect(false)}
              >
                <strong>My Child (Under 16)</strong>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="pt-screen">
        <div className="pt-card" style={{ maxWidth: 480 }}>
          <p className="pt-step-label">Before we begin</p>
          <h2 className="pt-card-title">Tell us about yourself</h2>
          <div className="pt-userinfo-form">
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
            <button
              className="pt-btn pt-btn-primary pt-btn-lg"
              onClick={handleUserInfoSubmit}
              style={{ marginTop: '16px', width: '100%' }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };`;
code = code.replace(renderUserInfoStr, '');

code = code.replace("{screen === 'userinfo' && renderUserInfo()}\n", "");

const handleUserInfoSubmitStr = `  function handleUserInfoSubmit() {
    if (!validateUserInfo()) return;
    const ageNum = userInfo.age.trim() ? parseInt(userInfo.age, 10) : 25;
    const determinedAudience = ageNum < 16 ? 'kids' : 'adults';
    setPendingAudience(determinedAudience);

    if (!track) {
      setScreen('track');
    } else if (!program) {
      setScreen('program');
    } else {
      setScreen('testintro');
    }
  }`;
code = code.replace(handleUserInfoSubmitStr, "");

// 2. Rewrite renderTestIntro
const renderTestIntroStr = `  const renderTestIntro = () => {
    const qpl = Placement.serveCount(pendingAudience);
    const levels = program ? Placement.levelsOf(program, pendingAudience) : [];
    const minQ = 1 + qpl;
    const maxQ = 1 + qpl * Math.min(levels.length, 4);
    const hasProgramParam = searchParams.get('program');
    const handleBack = () => {
      if (hasProgramParam) (user && user.age) ? setScreen('welcome') : setScreen('userinfo');
      else setScreen('program');
    };
    return (
      <div className="pt-screen">
        <div style={{ width: '100%', maxWidth: 480, marginBottom: '20px' }}>
          <button className="pt-btn pt-btn-ghost pt-back-btn" style={{ padding: '4px 12px', marginLeft: '-12px' }} onClick={handleBack}>← Back</button>
        </div>
        <div className="pt-card" style={{ maxWidth: 480 }}>
          <p className="pt-step-label">{track?.label} · {program?.label}</p>
          <h2 className="pt-card-title">Ready when you are.</h2>
          <p className="pt-lede" style={{ fontSize: '0.95rem', marginBottom: '24px' }}>
            A short adaptive test. Each level has its own small set of questions — the system adjusts as you go.
          </p>
          <div className="pt-intro-stats">
            <div><dt>Questions</dt><dd>{minQ}–{maxQ}</dd></div>
            <div><dt>Est. Time</dt><dd>{Math.max(2, Math.round(minQ * 0.4))}–{Math.max(4, Math.round(maxQ * 0.5))} min</dd></div>
            <div><dt>Choices</dt><dd>Multiple choice</dd></div>
          </div>
          <button className="pt-btn pt-btn-primary pt-btn-block" onClick={startTest}>
            Start Test
          </button>
        </div>
      </div>
    );
  };`;

const newRenderTestIntroStr = `  const renderTestIntro = () => {
    const qpl = Placement.serveCount(pendingAudience || 'adults');
    const levels = program ? Placement.levelsOf(program, pendingAudience || 'adults') : [];
    const minQ = 1 + qpl;
    const maxQ = 1 + qpl * Math.min(levels.length, 4);
    const hasProgramParam = searchParams.get('program');
    
    return (
      <div className="pt-screen">
        {!hasProgramParam && (
          <div style={{ width: '100%', maxWidth: 480, marginBottom: '20px' }}>
            <button className="pt-btn pt-btn-ghost pt-back-btn" style={{ padding: '4px 12px', marginLeft: '-12px' }} onClick={() => setScreen('program')}>← Back</button>
          </div>
        )}
        <div className="pt-card" style={{ maxWidth: 480 }}>
          <p className="pt-step-label">{track?.label} · {program?.label}</p>
          <h2 className="pt-card-title">Ready when you are.</h2>
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
  };`;
code = code.replace(renderTestIntroStr, newRenderTestIntroStr);

code = code.replace("function startTest() {\n    if (!track || !program || !pendingAudience) { resetAll(); return; }\n    clearProgress();\n    const sess = Placement.startPlacement(track.id, program.id, pendingAudience, program);", 
"function startTest(aud) {\n    if (!track || !program || !aud) { resetAll(); return; }\n    setPendingAudience(aud);\n    clearProgress();\n    const sess = Placement.startPlacement(track.id, program.id, aud, program);");

// Fix session isolate
code = code.replace("try { s.setItem(STORAGE_KEY, JSON.stringify({ v: 2, savedAt: Date.now(), session: sess })); }", 
"try { s.setItem(STORAGE_KEY, JSON.stringify({ v: 2, savedAt: Date.now(), session: sess, userId: user?.id || null })); }");
code = code.replace("if (!snap.savedAt || Date.now() - snap.savedAt > MAX_SAVE_AGE_MS) return null;", 
"if (!snap.savedAt || Date.now() - snap.savedAt > MAX_SAVE_AGE_MS) return null;\n      if (snap.userId !== (user?.id || null)) return null;");


// Bypass stage
code = code.replace(`    setStageInfo({
      eyebrow: "Thanks!",
      title: "Let's start here.",
      message: "Answer a few short questions. If you do well, we'll move you up to the next level automatically.",
      focus: focusLine(updated, program),
      cta: "Start",
    });
    setScreen('stage');`, `    setScreen('question');`);

code = code.replace(`    setStageInfo({ ...pick, focus, cta: "Continue" });
    setScreen('stage');`, `    setScreen('question');`);

// Update Routing logic
code = code.replace(`      if (tr) { setTrack(tr); setAccent(tr.id); }
      if (pr) { setProgram(pr); setScreen('userinfo'); }`, 
`      if (tr) { setTrack(tr); setAccent(tr.id); }
      if (pr) { setProgram(pr); setScreen('testintro'); }`);

code = code.replace(`    if (!program) { setScreen('program'); }
    else { setScreen('userinfo'); }`,
`    if (!program) { setScreen('program'); }
    else { setScreen('testintro'); }`);

code = code.replace(`  function handleProgramSelect(p) {
    setProgram(p);
    setScreen('userinfo');
  }`,
`  function handleProgramSelect(p) {
    setProgram(p);
    setScreen('testintro');
  }`);

// Welcome screen 'Start' button
code = code.replace(`          <button className="pt-btn pt-btn-primary pt-btn-lg" onClick={() => {
            if (user && user.age) {
              handleAudienceSelect(parseInt(user.age) >= 15, true);
            } else {
              setScreen('userinfo');
            }
          }}>`,
`          <button className="pt-btn pt-btn-primary pt-btn-lg" onClick={() => {
            setScreen('track');
          }}>`);

// Results screen - hide recommended level for users
const recommendedBlock = `        <div className="pt-rh-card pt-rh-card-highlight">
          <svg viewBox="0 0 100 100" className="pt-rh-icon" aria-hidden="true">
            <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" />
            <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" transform="rotate(45 50 50)" />
          </svg>
          <p className="pt-rh-eyebrow">Recommended Starting Level</p>
          <p className="pt-rh-level-tag">Level {resultData.recommendedLevelId} of {resultData.totalLevels}</p>
          <h2 className="pt-rh-level">{resultData.recommendedLevel?.name || \`Level \${resultData.recommendedLevelId}\`}</h2>
          <p className="pt-rh-program">{resultData.trackLabel} — {resultData.programLabel}</p>
          {resultData.recommendedLevel?.desc && (
            <p className="pt-rh-level-desc">"{resultData.recommendedLevel.desc}"</p>
          )}
        </div>`;
const newRecommendedBlock = `        {!user ? (
          <div className="pt-rh-card pt-rh-card-highlight">
            <svg viewBox="0 0 100 100" className="pt-rh-icon" aria-hidden="true">
              <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" />
              <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" transform="rotate(45 50 50)" />
            </svg>
            <p className="pt-rh-eyebrow">Recommended Starting Level</p>
            <p className="pt-rh-level-tag">Level {resultData.recommendedLevelId} of {resultData.totalLevels}</p>
            <h2 className="pt-rh-level">{resultData.recommendedLevel?.name || \`Level \${resultData.recommendedLevelId}\`}</h2>
            <p className="pt-rh-program">{resultData.trackLabel} — {resultData.programLabel}</p>
            {resultData.recommendedLevel?.desc && (
              <p className="pt-rh-level-desc">"{resultData.recommendedLevel.desc}"</p>
            )}
          </div>
        ) : (
          <div className="pt-rh-card pt-rh-card-highlight">
            <svg viewBox="0 0 100 100" className="pt-rh-icon" aria-hidden="true">
              <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" />
              <rect x="14" y="14" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="0.7" transform="rotate(45 50 50)" />
            </svg>
            <h2 className="pt-rh-level">Assessment Complete</h2>
            <p className="pt-rh-program">{resultData.trackLabel} — {resultData.programLabel}</p>
          </div>
        )}`;
code = code.replace(recommendedBlock, newRecommendedBlock);

// Hide duration / pace
const paceBlock = `          <div className="pt-results-card">
            <h3>Estimated Duration</h3>
            <div className="stat-big">{resultData.duration.label}</div>
            <div className="stat-sub">{resultData.duration.note}</div>
          </div>
          <div className="pt-results-card">
            <h3>Recommended Pace</h3>
            <div className="stat-big">{resultData.duration.lessonsPerWeek}</div>
            <div className="stat-sub">Suggested weekly lessons to progress steadily</div>
          </div>`;
const newPaceBlock = `          {!user && (
            <>
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
            </>
          )}`;
code = code.replace(paceBlock, newPaceBlock);


fs.writeFileSync('frontend/src/pages/PlacementTest.jsx', code);
console.log('Transformation complete!');
