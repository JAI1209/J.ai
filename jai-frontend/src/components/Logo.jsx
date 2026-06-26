// src/components/Logo.jsx
import React from 'react';

export const Logo = ({ size = 52, className = '' }) => {
  return (
    <svg 
      viewBox="0 0 120 120" 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="logGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5e5ce6" />
          <stop offset="100%" stopColor="#4b49c6" />
        </linearGradient>
        
        <linearGradient id="logAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7F77DD" />
          <stop offset="100%" stopColor="#5e5ce6" />
        </linearGradient>
        
        <filter id="logGlow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <style>{`
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        
        @keyframes logoPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .logo-float { animation: logoFloat 3s ease-in-out infinite; }
        .logo-pulse { animation: logoPulse 2s ease-in-out infinite; }
      `}</style>
      
      {/* Background square with rounded corners */}
      <rect x="20" y="20" width="80" height="80" rx="20" fill="url(#logGrad)" filter="url(#logGlow)" />
      <rect x="20" y="20" width="80" height="80" rx="20" fill="white" opacity="0.06" />
      
      {/* J Letter */}
      <g className="logo-float">
        <path 
          d="M 40 38 L 40 55 C 40 70 50 82 65 82 C 78 82 82 72 82 60 L 82 50" 
          stroke="white" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
          filter="url(#logGlow)"
        />
        <circle cx="40" cy="38" r="3.5" fill="white" filter="url(#logGlow)" />
        
        {/* AI sparkle accent */}
        <line x1="82" y1="42" x2="82" y2="48" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <line x1="79" y1="45" x2="85" y2="45" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      </g>
      
      {/* Corner sparkles */}
      <circle className="logo-pulse" cx="60" cy="22" r="2" fill="url(#logAccent)" />
      <circle className="logo-pulse" cx="98" cy="60" r="2" fill="url(#logAccent)" style={{ animationDelay: '0.5s' }} />
      <circle className="logo-pulse" cx="60" cy="98" r="2" fill="url(#logAccent)" style={{ animationDelay: '1s' }} />
      <circle className="logo-pulse" cx="22" cy="60" r="2" fill="url(#logAccent)" style={{ animationDelay: '1.5s' }} />
    </svg>
  );
};

export default Logo;