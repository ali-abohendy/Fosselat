import { useState, useEffect, useRef } from 'react';
import './StatCounter.css';

function AnimatedNumber({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let start = 0;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function StatCounter({ number, suffix = '+', label }) {
  return (
    <div className="stat-counter">
      <div className="stat-number">
        <AnimatedNumber end={number} suffix={suffix} />
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
