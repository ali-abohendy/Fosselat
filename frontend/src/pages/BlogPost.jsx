import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import './BlogPost.css';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const post = blogPosts.find(p => p.slug === slug);
  const relatedPosts = blogPosts.filter(p => p.category === post?.category && p.id !== post?.id).slice(0, 3);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — Fosselat Academy`;
    } else {
      navigate('/blog');
    }
    window.scrollTo(0, 0);
  }, [post, navigate]);

  if (!post) return null;

  return (
    <div className="page-enter blog-post-page">
      <article className="container blog-post-container">
        <Link to="/blog" className="back-link">← Back to Blog</Link>
        
        <header className="blog-post-header">
          <div className="blog-post-meta">
            <span className="blog-category-badge">{post.category}</span>
            <span className="blog-time-badge">{post.readTime}</span>
            <span className="blog-date-badge">{post.date}</span>
          </div>
          <h1 className="blog-post-title text-gold">{post.title}</h1>
        </header>

        <div className="blog-post-content">
          <post.content />
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="related-posts-section section">
          <div className="container">
            <h2 className="related-title">Related <span className="text-gold">Articles</span></h2>
            <div className="blog-grid">
              {relatedPosts.map(p => (
                <article className="blog-card" key={p.id}>
                  <div className="blog-card-category">{p.category}</div>
                  <h3 className="blog-card-title">{p.title}</h3>
                  <p className="blog-card-excerpt">{p.excerpt}</p>
                  <div className="blog-card-footer">
                    <span className="blog-card-time">{p.readTime}</span>
                    <Link to={`/blog/${p.slug}`} className="blog-card-link">Read More →</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
