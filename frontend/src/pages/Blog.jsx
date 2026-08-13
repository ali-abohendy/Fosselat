import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import './Blog.css';

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    document.title = 'Blog — Fosselat Academy';
  }, []);

  const categories = ['All', 'Quran', 'Arabic', 'Islamic Studies', 'Parents & Kids'];

  const filteredPosts = activeCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  return (
    <div className="page-enter blog-page">
      <section className="hero blog-hero">
        <div className="blog-hero-overlay" aria-hidden="true" />
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Blog</h1>
            <p className="hero-subtitle">Insights on Quran, Arabic, and Islamic Studies</p>
          </div>
        </div>
      </section>

      <section className="section blog-content-section">
        <div className="container">
          <div className="blog-filters">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="blog-grid">
            {filteredPosts.map(post => (
              <article className="blog-card" key={post.id}>
                <div className="blog-card-category">{post.category}</div>
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-footer">
                  <span className="blog-card-time">{post.readTime}</span>
                  <Link to={`/blog/${post.slug}`} className="blog-card-link">Read More →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
