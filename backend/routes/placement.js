import { Router } from 'express';
import { createTransport } from 'nodemailer';
import { getDB } from '../db.js';

const router = Router();

router.post('/send-results', async (req, res) => {
  try {
    const { userInfo, results } = req.body;
    if (!userInfo || !results) {
      return res.status(400).json({ success: false, message: 'Missing data' });
    }

    const { name, age, email, student_id } = userInfo;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const {
      trackLabel, programLabel, audienceLabel,
      recommendedLevel, recommendedLevelId, highestMasteredId, totalLevels,
      score, levelScores, strengths, weaknesses,
      duration, summary, nextStep
    } = results;

    // Build level scores rows
    const levelRows = (levelScores || []).map(ls => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #1a365d;color:#F0E6D3;font-size:14px;">${ls.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #1a365d;color:#F0E6D3;font-size:14px;">${ls.correct}/${ls.total}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #1a365d;font-size:14px;font-weight:600;color:${ls.passed ? '#2F7A5E' : '#B0453B'};">${Math.round(ls.pct * 100)}% ${ls.passed ? '✓' : '✗'}</td>
      </tr>`).join('');

    // Build strengths list
    const strengthsList = (strengths || []).map(s =>
      `<li style="padding:4px 0;color:#2F7A5E;">✓ ${s.skill} (${s.pct}%)</li>`
    ).join('') || '<li style="padding:4px 0;color:#888;">Building across the board</li>';

    // Build weaknesses list
    const weaknessesList = (weaknesses || []).map(s =>
      `<li style="padding:4px 0;color:#B0453B;">△ ${s.skill} (${s.pct}%)</li>`
    ).join('') || '<li style="padding:4px 0;color:#888;">No specific gaps — nicely balanced</li>';

    const durationLabel = duration?.label || 'Individualized';
    const durationNote = duration?.note || '';
    const durationPace = duration?.lessonsPerWeek || '2x / week';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background-color:#070E18;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background-color:#0A1A28;border:1px solid rgba(200,167,99,0.3);border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0d2235,#0A1A28);padding:32px 24px;text-align:center;border-bottom:1px solid rgba(200,167,99,0.2);">
          <img src="https://fosselatacademy.com/logo.png" alt="Fosselat Academy" style="max-width:120px;margin-bottom:16px;" />
          <h1 style="color:#C8A763;font-size:22px;margin:0 0 4px;">Placement Test Results</h1>
          <p style="color:rgba(240,230,211,0.6);font-size:13px;margin:0;">${trackLabel} · ${programLabel} · ${audienceLabel}</p>
        </div>

        <!-- Student Info -->
        <div style="padding:24px;">
          <p style="color:#F0E6D3;font-size:16px;margin:0 0 4px;">Hello <strong>${name}</strong>,</p>
          <p style="color:rgba(240,230,211,0.6);font-size:14px;margin:0;">Age: ${age} · ${email}</p>
        </div>

        <!-- Recommended Level Card -->
        <div style="margin:0 24px 20px;background:rgba(200,167,99,0.08);border:1px solid rgba(200,167,99,0.2);border-radius:10px;padding:20px;text-align:center;">
          <p style="color:rgba(240,230,211,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Recommended Starting Level</p>
          <h2 style="color:#C8A763;font-size:24px;margin:0 0 4px;">${recommendedLevel}</h2>
          <p style="color:rgba(240,230,211,0.5);font-size:13px;margin:0;">Level ${recommendedLevelId} of ${totalLevels}</p>
        </div>

        <!-- Level Scores Table -->
        ${levelScores && levelScores.length ? `
        <div style="padding:0 24px 20px;">
          <h3 style="color:#F0E6D3;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">Level-by-Level Breakdown</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px 12px;border-bottom:2px solid rgba(200,167,99,0.2);color:#C8A763;font-size:12px;text-transform:uppercase;">Level</th>
                <th style="text-align:left;padding:8px 12px;border-bottom:2px solid rgba(200,167,99,0.2);color:#C8A763;font-size:12px;text-transform:uppercase;">Score</th>
                <th style="text-align:left;padding:8px 12px;border-bottom:2px solid rgba(200,167,99,0.2);color:#C8A763;font-size:12px;text-transform:uppercase;">Result</th>
              </tr>
            </thead>
            <tbody>${levelRows}</tbody>
          </table>
        </div>` : ''}

        <!-- Strengths & Weaknesses -->
        <div style="padding:0 24px 20px;display:flex;">
          <table style="width:100%;"><tr>
            <td style="width:50%;vertical-align:top;padding-right:10px;">
              <h3 style="color:#2F7A5E;font-size:13px;text-transform:uppercase;margin:0 0 8px;">Strengths</h3>
              <ul style="list-style:none;padding:0;margin:0;font-size:13px;">${strengthsList}</ul>
            </td>
            <td style="width:50%;vertical-align:top;padding-left:10px;">
              <h3 style="color:#B0453B;font-size:13px;text-transform:uppercase;margin:0 0 8px;">Areas to Build</h3>
              <ul style="list-style:none;padding:0;margin:0;font-size:13px;">${weaknessesList}</ul>
            </td>
          </tr></table>
        </div>

        <!-- Duration -->
        <div style="margin:0 24px 20px;background:rgba(200,167,99,0.05);border:1px solid rgba(200,167,99,0.12);border-radius:8px;padding:16px;text-align:center;">
          <p style="color:#C8A763;font-size:18px;font-weight:bold;margin:0 0 4px;">${durationLabel}</p>
          <p style="color:rgba(240,230,211,0.5);font-size:13px;margin:0 0 6px;">${durationNote}</p>
          <p style="color:rgba(240,230,211,0.5);font-size:12px;margin:0;">Pace: ${durationPace}</p>
        </div>

        <!-- Summary -->
        <div style="padding:0 24px 24px;">
          <p style="color:#F0E6D3;font-size:14px;line-height:1.6;margin:0 0 12px;">${summary}</p>
          <p style="color:rgba(240,230,211,0.5);font-size:13px;line-height:1.5;margin:0;">${nextStep}</p>
        </div>

        <!-- CTA -->
        <div style="padding:0 24px 28px;text-align:center;">
          <a href="https://wa.me/966595796177" style="display:inline-block;background:#25D366;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
            💬 Contact us on WhatsApp
          </a>
        </div>

        <!-- Footer -->
        <div style="background:rgba(0,0,0,0.2);padding:20px 24px;text-align:center;border-top:1px solid rgba(200,167,99,0.1);">
          <p style="color:rgba(240,230,211,0.3);font-size:11px;margin:0 0 4px;">© 2026 Fosselat Academy. All rights reserved.</p>
          <p style="color:rgba(240,230,211,0.3);font-size:11px;margin:0;">info@fosselatacademy.com · fosselatacademy.com</p>
        </div>
      </div>
    </body>
    </html>`;

    // Send email
    const transporter = createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: 'info@fosselatacademy.com',
        pass: 'Fosselat@20012001',
      },
    });

    const mailOptions = {
      from: '"Fosselat Academy" <info@fosselatacademy.com>',
      to: email,
      cc: 'info@fosselatacademy.com',
      subject: `Placement Test Results — ${trackLabel} · ${programLabel}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    // Save to DB if student is logged in
    if (student_id) {
      try {
        const db = getDB();
        await db.collection('placement_tests').insertOne({
          student_id,
          name,
          email,
          age,
          track: trackLabel,
          program: programLabel,
          recommended_level: recommendedLevel,
          highest_mastered_id: highestMasteredId,
          total_levels: totalLevels,
          score,
          level_scores: levelScores,
          created_at: new Date()
        });
      } catch (dbErr) {
        console.error('Failed to save placement test to DB:', dbErr);
      }
    }

    return res.json({ success: true, message: 'Results sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
