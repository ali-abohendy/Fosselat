import { Link } from 'react-router-dom';
import './Button.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = '', 
  to, 
  href, 
  onClick, 
  type = 'button', 
  disabled = false, 
  block = false,
  className = '',
  ...props 
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size && `btn-${size}`,
    block && 'btn-block',
    className
  ].filter(Boolean).join(' ');

  // Render as React Router Link
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  // Render as external anchor
  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  // Render as button
  return (
    <button 
      type={type} 
      className={classes} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
