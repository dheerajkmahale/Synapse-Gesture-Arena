import React from "react";

export function SynapseEmblem({ size = 48, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30" stroke="#20D5FF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="32" cy="32" r="26" stroke="#A855F7" strokeWidth="1.2" opacity="0.8" />
      {/* Hexagonal nodes */}
      <polygon points="32,8 52,19 52,43 32,54 12,43 12,19" stroke="#20D5FF" strokeWidth="2" fill="rgba(32, 213, 255, 0.05)" />
      {/* Synapse connections */}
      <circle cx="32" cy="18" r="3" fill="#20D5FF" />
      <circle cx="21" cy="38" r="3" fill="#A855F7" />
      <circle cx="43" cy="38" r="3" fill="#20D5FF" />
      <line x1="32" y1="18" x2="21" y2="38" stroke="#20D5FF" strokeWidth="1.5" />
      <line x1="32" y1="18" x2="43" y2="38" stroke="#A855F7" strokeWidth="1.5" />
      <line x1="21" y1="38" x2="43" y2="38" stroke="#20D5FF" strokeWidth="1.2" />
      {/* Central energy core */}
      <circle cx="32" cy="32" r="4" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="7" stroke="#20D5FF" strokeWidth="1" opacity="0.75" />
    </svg>
  );
}

export function CyberBotEmblem({ size = 64, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="botGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#20D5FF" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <radialGradient id="visorGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#20D5FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      {/* Outer halo */}
      <circle cx="40" cy="40" r="36" stroke="url(#botGradient)" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 4" />
      {/* Bot Antennae */}
      <line x1="40" y1="16" x2="40" y2="8" stroke="#20D5FF" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="7" r="3" fill="#20D5FF" />
      <line x1="24" y1="20" x2="18" y2="14" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="13" r="2.5" fill="#A855F7" />
      <line x1="56" y1="20" x2="62" y2="14" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="63" cy="13" r="2.5" fill="#A855F7" />
      {/* Bot Head Chassis */}
      <rect x="20" y="20" width="40" height="34" rx="8" fill="#0C101B" stroke="#20D5FF" strokeWidth="2" />
      {/* Visor Area */}
      <rect x="25" y="28" width="30" height="15" rx="4" fill="url(#visorGlow)" stroke="#A855F7" strokeWidth="1.2" />
      {/* Visor eyes */}
      <rect x="29" y="33" width="7" height="5" rx="1.5" fill="#FFFFFF" />
      <rect x="44" y="33" width="7" height="5" rx="1.5" fill="#FFFFFF" />
      {/* Audio / Mic slits */}
      <line x1="32" y1="48" x2="48" y2="48" stroke="#20D5FF" strokeWidth="2" strokeLinecap="round" />
      {/* Neck & Collar */}
      <path d="M30 55 L30 65 L50 65 L50 55" stroke="#A855F7" strokeWidth="2" fill="#0C101B" />
      <line x1="22" y1="65" x2="58" y2="65" stroke="#20D5FF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CyberHandEmblem({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#20D5FF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}
