import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ className = '', size = 48 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]"
      >
        {/* Tire wheel outer rim */}
        <circle cx="100" cy="100" r="75" fill="#111827" stroke="#374151" strokeWidth="8" />
        
        {/* Tire tread / Wheel spokes pattern */}
        <circle cx="100" cy="100" r="50" fill="#030712" stroke="#E5E7EB" strokeWidth="12" />
        
        {/* Center rim wheel structure */}
        <circle cx="100" cy="100" r="28" fill="#1F2937" stroke="#F3F4F6" strokeWidth="4" />
        <circle cx="100" cy="100" r="14" fill="#111827" />

        {/* Wheel spokes */}
        <path d="M100 25 L100 50" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M100 150 L100 175" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M25 100 L50 100" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M150 100 L175 100" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M47 47 L65 65" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M135 135 L153 153" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M153 47 L135 65" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M65 135 L47 153" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

        {/* Red speed swoops / stripes swooping across the tire */}
        <path
          d="M 10 170 Q 70 80, 190 60 L 190 75 Q 75 95, 15 180 Z"
          fill="url(#redGlowGrad1)"
        />
        <path
          d="M 25 155 Q 85 85, 192 82 L 192 95 Q 88 100, 30 165 Z"
          fill="url(#redGlowGrad2)"
        />
        <path
          d="M 40 140 Q 95 95, 180 108 L 180 118 Q 98 108, 45 148 Z"
          fill="url(#redGlowGrad3)"
        />

        <defs>
          <linearGradient id="redGlowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id="redGlowGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>
          <linearGradient id="redGlowGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#991B1B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
