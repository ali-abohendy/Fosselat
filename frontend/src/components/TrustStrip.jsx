import { GraduationCap, Award, Globe, ShieldCheck } from 'lucide-react';
import './SharedSections.css';

const TRUST_METRICS = [
  { icon: <GraduationCap size={17} />, label: 'Certified Teachers' },
  { icon: <Award size={17} />, label: 'Ijazah Scholars' },
  { icon: <Globe size={17} />, label: '1-on-1 Live in English' },
  { icon: <ShieldCheck size={17} />, label: '30-Day Refund Guarantee' },
];

export default function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Academy highlights">
      <div className="container">
        <div className="trust-strip-grid">
          {TRUST_METRICS.map((m, idx) => (
            <div className="trust-strip-item" key={idx}>
              <span className="trust-strip-icon">{m.icon}</span>
              <span className="trust-strip-value">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
