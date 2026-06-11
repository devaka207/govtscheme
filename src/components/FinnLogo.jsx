import React from 'react';

export default function FinnLogo({ className = "h-8 w-auto" }) {
  return (
    <svg 
      viewBox="0 0 75 28" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <text 
        x="0" 
        y="21" 
        fontFamily="'Outfit', 'Inter', sans-serif" 
        fontWeight="800" 
        fontSize="24" 
        fill="currentColor" 
        letterSpacing="-0.5px"
      >
        Finn
      </text>
      <circle cx="58" cy="19" r="3.5" fill="#81D460" />
    </svg>
  );
}
