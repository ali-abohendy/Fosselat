import { Globe, Clock, Video, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl, trackWhatsAppClick } from '../utils/siteActions';
import './SharedSections.css';

export const SAMPLE_CLASS_VIDEO_URL = '/sample-session.mp4';
export const SAMPLE_CLASS_POSTER_URL = '/sample-session-poster.jpg';

export default function HowClassWorks({
  pageSource = 'Home',
  videoUrl = SAMPLE_CLASS_VIDEO_URL,
  posterUrl = SAMPLE_CLASS_POSTER_URL,
}) {
  const trialUrl = buildWhatsAppUrl({ page: pageSource, intent: 'trial' });

  const steps = [
    {
      num: '1',
      title: 'Book Your Free 30-Minute Trial Class',
      desc: 'Meet a qualified teacher live on Zoom or Google Meet, explore how classes work, and experience a real 1-on-1 lesson with zero commitment or payment upfront.',
    },
    {
      num: '2',
      title: 'Personal Level Assessment & Teacher Match',
      desc: 'We check your exact starting point (whether complete beginner or intermediate Tajweed) and match you with a dedicated teacher who fits your age and goals.',
    },
    {
      num: '3',
      title: 'Learn 1-on-1 in Clear English on Your Schedule',
      desc: 'Every lesson is private, interactive, and taught in English with clear step-by-step Arabic guidance. Earn progress milestones and official certificates after every level.',
    },
  ];

  const isDirectVideo = videoUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);

  return (
    <section className="section how-class-section" id="how-a-class-works">
      <div className="container">
        <div className="section-title">
          <h2>How a <span className="text-gold">Class Works</span></h2>
          <div className="gold-line" />
          <p>Clear English instruction, flexible global scheduling, and structured 1-on-1 lessons built around your pace.</p>
        </div>

        <div className="hcw-layout">
          <div>
            <div className="hcw-steps">
              {steps.map((s) => (
                <div className="hcw-step" key={s.num}>
                  <div className="hcw-step-num">{s.num}</div>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="hcw-facts-grid">
              <div className="hcw-fact-tile">
                <Globe size={18} />
                <strong>Taught in English</strong>
                <span>Clear bilingual support</span>
              </div>
              <div className="hcw-fact-tile">
                <Clock size={18} />
                <strong>All Time Zones</strong>
                <span>US, UK, EU, AU &amp; Gulf</span>
              </div>
              <div className="hcw-fact-tile">
                <Video size={18} />
                <strong>Zoom &amp; Meet</strong>
                <span>Live 1-on-1 sessions</span>
              </div>
            </div>
          </div>

          <div className="hcw-video-card" id="sample-class-video">
            <div className="hcw-video-badge">Real Live Session Clip</div>
            <div className="hcw-video-frame hcw-video-live">
              {isDirectVideo ? (
                <video
                  src={videoUrl}
                  poster={posterUrl}
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  preload="metadata"
                  playsInline
                >
                  Your browser does not support HTML5 video playback.
                </video>
              ) : (
                <iframe
                  src={videoUrl}
                  title="Fosselat Academy Real 1-on-1 Session"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <div className="hcw-video-caption">
              <h4>Inside a Real 1-on-1 Fosselat Session</h4>
              <p>
                Watch an actual live class recording to see our teaching style firsthand — patient pronunciation guidance, clear English explanation, and interactive 1-on-1 engagement.
              </p>
              <a
                href={trialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pb-whatsapp-btn"
                style={{ marginTop: '6px', padding: '11px 16px', fontSize: '0.92rem' }}
                onClick={() => trackWhatsAppClick(`${pageSource.toLowerCase()}_session_video_trial`)}
              >
                <MessageCircle size={17} />
                Book a Free Trial Class
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
