// src/components/AnimatedLogo.jsx
import React from 'react';

export const AnimatedLogo = ({ size = 64, className = '' }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size}
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        {/* Premium gradient - J.ai signature */}
        <linearGradient id="jGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5e5ce6" stopOpacity="1" />
          <stop offset="50%" stopColor="#6c6af0" stopOpacity="1" />
          <stop offset="100%" stopColor="#4b49c6" stopOpacity="1" />
        </linearGradient>

        {/* Letter gradient - white to subtle purple */}
        <linearGradient id="jLetter" x1="20%" y1="20%" x2="80%" y2="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#e8e6ff" stopOpacity="0.8" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="jGlow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <filter id="jSoftGlow">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <style>{`
          @keyframes logoFloat {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
            }
            50% { 
              transform: translateY(-8px) rotate(2deg); 
            }
          }

          @keyframes logoPulse {
            0%, 100% { 
              opacity: 0.15;
              transform: scale(1);
            }
            50% { 
              opacity: 0.3;
              transform: scale(1.05);
            }
          }

          @keyframes sparkleFloat {
            0%, 100% { 
              opacity: 0.3;
              transform: translate(0, 0) scale(1);
            }
            50% { 
              opacity: 0.8;
              transform: translate(2px, -4px) scale(1.2);
            }
          }

          @keyframes ringRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .logo-float {
            animation: logoFloat 4s ease-in-out infinite;
          }

          .logo-pulse {
            animation: logoPulse 3s ease-in-out infinite;
          }

          .sparkle-1 {
            animation: sparkleFloat 2.5s ease-in-out infinite;
          }

          .sparkle-2 {
            animation: sparkleFloat 3s ease-in-out infinite 0.8s;
          }

          .ring-rotate {
            animation: ringRotate 20s linear infinite;
          }

          .ring-rotate-reverse {
            animation: ringRotate 25s linear infinite reverse;
          }

          .letter-path {
            stroke-dasharray: 200;
            stroke-dashoffset: 200;
            animation: drawLetter 1.2s ease-out forwards;
          }

          @keyframes drawLetter {
            to {
              stroke-dashoffset: 0;
            }
          }

          .dot-pulse {
            animation: dotPulse 2s ease-in-out infinite;
          }

          @keyframes dotPulse {
            0%, 100% { r: 4; opacity: 0.8; }
            50% { r: 6; opacity: 1; }
          }
        `}</style>
      </defs>

      {/* Outer decorative rings */}
      <g className="ring-rotate">
        <circle 
          cx="100" cy="100" 
          r="88" 
          fill="none" 
          stroke="url(#jGrad)" 
          strokeWidth="0.5" 
          opacity="0.15"
          strokeDasharray="4 8"
        />
      </g>

      <g className="ring-rotate-reverse">
        <circle 
          cx="100" cy="100" 
          r="78" 
          fill="none" 
          stroke="url(#jGrad)" 
          strokeWidth="0.5" 
          opacity="0.1"
          strokeDasharray="2 12"
        />
      </g>

      {/* Pulsing glow ring */}
      <circle 
        className="logo-pulse"
        cx="100" cy="100" 
        r="65" 
        fill="none" 
        stroke="url(#jGrad)" 
        strokeWidth="1"
      />

      {/* Main logo group */}
      <g className="logo-float">
        {/* Background circle with gradient */}
        <circle cx="100" cy="100" r="52" fill="url(#jGrad)" />
        <circle cx="100" cy="100" r="52" fill="white" opacity="0.06" />

        {/* Inner highlight */}
        <ellipse cx="85" cy="75" rx="30" ry="20" fill="white" opacity="0.08" transform="rotate(-30, 85, 75)" />

        {/* J Letter - Premium monogram */}
        <path 
          className="letter-path"
          d="M 72 65 
             L 72 95 
             C 72 118 85 135 108 135 
             C 131 135 142 118 142 95 
             L 142 75"
          stroke="url(#jLetter)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#jGlow)"
        />

        {/* Dot on J */}
        <circle 
          className="dot-pulse"
          cx="72" 
          cy="65" 
          r="4" 
          fill="white" 
          opacity="0.9"
          filter="url(#jGlow)"
        />

        {/* AI accent - small sparkle */}
        <g opacity="0.6">
          <path 
            d="M 142 50 L 142 58 M 138 54 L 146 54" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />
          <path 
            d="M 145 55 L 148 52 M 145 52 L 148 55" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.5"
          />
        </g>

        {/* Small accent dot */}
        <circle cx="140" cy="100" r="2" fill="white" opacity="0.3" />
        <circle cx="100" cy="148" r="2" fill="white" opacity="0.2" />
      </g>

      {/* Orbiting sparkles */}
      <g className="sparkle-1">
        <circle cx="100" cy="32" r="3" fill="white" filter="url(#jSoftGlow)" />
        <circle cx="168" cy="100" r="3" fill="white" filter="url(#jSoftGlow)" />
        <circle cx="100" cy="168" r="2.5" fill="white" opacity="0.7" />
        <circle cx="32" cy="100" r="2.5" fill="white" opacity="0.7" />
      </g>

      <g className="sparkle-2">
        <circle cx="140" cy="45" r="2" fill="url(#jGrad)" opacity="0.6" />
        <circle cx="155" cy="130" r="2" fill="url(#jGrad)" opacity="0.6" />
        <circle cx="60" cy="155" r="2" fill="url(#jGrad)" opacity="0.6" />
        <circle cx="45" cy="70" r="2" fill="url(#jGrad)" opacity="0.6" />
      </g>

      {/* Light rays - subtle */}
      <g opacity="0.15">
        <line x1="100" y1="30" x2="100" y2="15" stroke="url(#jGrad)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="155" y1="100" x2="170" y2="100" stroke="url(#jGrad)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="100" y1="170" x2="100" y2="185" stroke="url(#jGrad)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="45" y1="100" x2="30" y2="100" stroke="url(#jGrad)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="140" y1="45" x2="150" y2="35" stroke="url(#jGrad)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="155" y1="155" x2="165" y2="165" stroke="url(#jGrad)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="45" y1="140" x2="35" y2="150" stroke="url(#jGrad)" strokeWidth="1" strokeLinecap="round"/>
        <line x1="60" y1="60" x2="50" y2="50" stroke="url(#jGrad)" strokeWidth="1" strokeLinecap="round"/>
      </g>
    </svg>
  );
};

export default AnimatedLogo;