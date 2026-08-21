import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--color-text)' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--color-gold)' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ marginTop: '20px', color: 'var(--color-text-muted)' }}>The page you are looking for doesn't exist or you don't have access to it.</p>
      <div style={{ marginTop: '30px' }}>
        <Link to="/" className="btn btn-primary" style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-dark)', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Return to Home
        </Link>
      </div>
    </div>
  );
}
