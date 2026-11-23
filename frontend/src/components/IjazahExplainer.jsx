import { Award } from 'lucide-react';
import './SharedSections.css';

export default function IjazahExplainer() {
  return (
    <div className="ijazah-explainer">
      <div className="ijazah-explainer-header">
        <div className="ijazah-explainer-icon">
          <Award size={20} />
        </div>
        <h4>What Is an &ldquo;Ijazah&rdquo;?</h4>
      </div>
      <p>
        An <strong>Ijazah</strong> is a formal Islamic certification granted to a teacher who has mastered Qur&apos;an recitation and Tajweed under a qualified scholar, connecting through an unbroken chain of teachers all the way back to Prophet Muhammad ﷺ. It assures you that you or your child are learning authentic pronunciation from a vetted specialist.
      </p>
    </div>
  );
}
