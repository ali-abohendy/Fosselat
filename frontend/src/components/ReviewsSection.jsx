import { STUDENT_REVIEWS } from '../data/reviewsData';
import './SharedSections.css';

export default function ReviewsSection({ limit, altBg = false, id = 'reviews' }) {
  const items = limit ? STUDENT_REVIEWS.slice(0, limit) : STUDENT_REVIEWS;

  return (
    <section className={`section reviews-section ${altBg ? 'alt-bg' : ''}`} id={id}>
      <div className="container">
        <div className="section-title">
          <h2>What Parents <span className="text-gold">Say About Us</span></h2>
          <div className="gold-line" />
          <p>Real Feedback from Our Students &amp; Their Families</p>
        </div>

        <div className="reviews-grid">
          {items.map((rev) => (
            <article className="review-card" key={rev.id}>
              <div>
                <div className="review-quote-mark" aria-hidden="true">&ldquo;</div>
                <p className="review-text">{rev.quote}</p>
              </div>
              <div className="review-author">
                <div className="review-monogram" aria-hidden="true">
                  {rev.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="review-author-name">{rev.name}</div>
                  <div className="review-author-tag">Verified Student / Family Feedback</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
