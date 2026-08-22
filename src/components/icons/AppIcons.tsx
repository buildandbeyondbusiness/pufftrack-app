import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
  glow?: boolean;
}

// 🫁 1. Ultra-Creative Anatomical Stylized Lungs Icon with Bronchial Glow
export const LungsIcon: React.FC<IconProps> = ({ className = "h-6 w-6", glow = true }) => {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="lungLeftGrad" x1="8" y1="12" x2="22" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="lungRightGrad" x1="40" y1="12" x2="26" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="tracheaGrad" x1="24" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <filter id="lungGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Trachea & Airway Pipe */}
      <path
        d="M22 5C22 4.44772 22.4477 4 23 4H25C25.5523 4 26 4.44772 26 5V18C26 18.5523 25.5523 19 25 19H23C22.4477 19 22 18.5523 22 18V5Z"
        fill="url(#tracheaGrad)"
      />
      {/* Trachea cartilage rings */}
      <line x1="22" y1="8" x2="26" y2="8" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
      <line x1="22" y1="12" x2="26" y2="12" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
      <line x1="22" y1="16" x2="26" y2="16" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />

      {/* Left Bronchus */}
      <path
        d="M23 18C20 20 16 23 14 26"
        stroke="#93c5fd"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Right Bronchus */}
      <path
        d="M25 18C28 20 32 23 34 26"
        stroke="#93c5fd"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Left Lung Lobe */}
      <path
        d="M20 21C18 16 11 15 8 19C5 23 4 33 7 38C9.5 42 16 44 20 40C22 38 22 30 22 26C22 23 21 22 20 21Z"
        fill="url(#lungLeftGrad)"
        fillOpacity="0.85"
        stroke="#7dd3fc"
        strokeWidth="1.2"
        filter={glow ? "url(#lungGlowFilter)" : undefined}
      />

      {/* Right Lung Lobe */}
      <path
        d="M28 21C30 16 37 15 40 19C43 23 44 33 41 38C38.5 42 32 44 28 40C26 38 26 30 26 26C26 23 27 22 28 21Z"
        fill="url(#lungRightGrad)"
        fillOpacity="0.85"
        stroke="#7dd3fc"
        strokeWidth="1.2"
        filter={glow ? "url(#lungGlowFilter)" : undefined}
      />

      {/* Internal Bronchial Tree Glow Lines (Left) */}
      <path d="M14 26C11 28 9 32 10 36" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />
      <path d="M15 28C17 31 16 35 15 38" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />

      {/* Internal Bronchial Tree Glow Lines (Right) */}
      <path d="M34 26C37 28 39 32 38 36" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />
      <path d="M33 28C31 31 32 35 33 38" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />

      {/* Alveolar Micro Particles */}
      <circle cx="11" cy="24" r="1" fill="#ffffff" opacity="0.8" />
      <circle cx="37" cy="24" r="1" fill="#ffffff" opacity="0.8" />
      <circle cx="9" cy="34" r="1.2" fill="#ffffff" opacity="0.8" />
      <circle cx="39" cy="34" r="1.2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
};

// 🔥 2. Apple iOS 18 Glowing Aura Hearth / Home Icon
export const HomeAuraIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="homeAuraOuter" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="homeAuraCore" x1="16" y1="12" x2="16" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      {/* Orbital Aura Ring */}
      <circle cx="16" cy="16" r="13.5" stroke="rgba(59, 130, 246, 0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Outer Flame / Spark */}
      <path
        d="M16 5C16 5 22 11 22 17.5C22 21.6421 19.3137 25 16 25C12.6863 25 10 21.6421 10 17.5C10 12 16 5 16 5Z"
        fill="url(#homeAuraOuter)"
      />
      {/* Radiant Inner Core */}
      <path
        d="M16 13C16 13 19 16.5 19 19.5C19 21.433 17.6569 23 16 23C14.3431 23 13 21.433 13 19.5C13 16.5 16 13 16 13Z"
        fill="url(#homeAuraCore)"
      />
    </svg>
  );
};

// 🔋 3. Isometric Vape Pod Model Icon
export const VapeModelIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="vapeBodyGrad" x1="8" y1="6" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="50%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>
        <linearGradient id="vapeJuiceGrad" x1="11" y1="12" x2="21" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      {/* Tip Mouthpiece */}
      <rect x="13" y="4" width="6" height="4" rx="2" fill="#71717a" stroke="#a1a1aa" strokeWidth="0.8" />
      {/* Device Body Frame */}
      <rect x="9" y="8" width="14" height="20" rx="4" fill="url(#vapeBodyGrad)" stroke="#52525b" strokeWidth="1" />
      {/* E-Liquid Window */}
      <rect x="11" y="11" width="10" height="7" rx="2" fill="#09090b" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <path d="M11 14C13 13 19 15 21 14V17C21 17.5523 20.5523 18 20 18H12C11.4477 18 11 17.5523 11 17V14Z" fill="url(#vapeJuiceGrad)" />
      {/* LED Power Dot */}
      <circle cx="16" cy="23" r="1.5" fill="#34d399" />
    </svg>
  );
};

// 📊 4. Apple Health Activity Wave / Analytics Icon
export const AnalyticsWaveIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bar1" x1="8" y1="16" x2="8" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff375f" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
        <linearGradient id="bar2" x1="14" y1="8" x2="14" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#30d158" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="bar3" x1="20" y1="12" x2="20" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64d2ff" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="bar4" x1="26" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#bf5af2" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
      </defs>
      {/* 4 Dynamic Glowing Activity Columns */}
      <rect x="5" y="16" width="4.5" height="10" rx="2.25" fill="url(#bar1)" />
      <rect x="11.5" y="9" width="4.5" height="17" rx="2.25" fill="url(#bar2)" />
      <rect x="18" y="13" width="4.5" height="13" rx="2.25" fill="url(#bar3)" />
      <rect x="24.5" y="6" width="4.5" height="20" rx="2.25" fill="url(#bar4)" />
      {/* Trend connecting line */}
      <path d="M7 16L14 9L20 13L27 6" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ⌛️ 5. Chronos Orbital Timeline / History Icon
export const ChronosHistoryIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="chronoRing" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {/* Outer Dial */}
      <circle cx="16" cy="16" r="12" stroke="url(#chronoRing)" strokeWidth="2" strokeDasharray="5 3" />
      {/* Inner Dial Face */}
      <circle cx="16" cy="16" r="8" fill="rgba(168, 85, 247, 0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      {/* Precision Chrono Hands */}
      <path d="M16 16V10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 16L20 18" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1.5" fill="#ffffff" />
      {/* Orbiting Satellite Node */}
      <circle cx="26" cy="10" r="2" fill="#c084fc" />
    </svg>
  );
};

// ⚡️ 6. Hyper-Charge Spark Quick Hit Icon
export const SparkHitIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="sparkGrad" x1="8" y1="2" x2="24" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      <path
        d="M18 3L6 17H15L14 29L26 15H17L18 3Z"
        fill="url(#sparkGrad)"
        stroke="#fef08a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// 🧪 7. Nicotine Molecular Hex Drop Icon
export const NicotineMoleculeIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="nicHexGrad" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      {/* Molecular Hexagon Ring */}
      <polygon
        points="16,4 26,10 26,22 16,28 6,22 6,10"
        fill="rgba(56, 189, 248, 0.15)"
        stroke="url(#nicHexGrad)"
        strokeWidth="1.8"
      />
      {/* Inner Nitrogen Node Drop */}
      <circle cx="16" cy="16" r="4" fill="#38bdf8" />
      <circle cx="16" cy="16" r="2" fill="#ffffff" />
      {/* Orbiting Carbon Bonds */}
      <circle cx="6" cy="10" r="1.5" fill="#93c5fd" />
      <circle cx="26" cy="10" r="1.5" fill="#93c5fd" />
      <circle cx="16" cy="28" r="1.5" fill="#93c5fd" />
    </svg>
  );
};

// ⏱️ 8. Chronometer Precision Session Timer Icon
export const SessionTimerIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="sessionTimerGrad" x1="6" y1="6" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Top Push Button */}
      <rect x="14" y="2" width="4" height="3" rx="1" fill="#34d399" />
      {/* Watch Crown Case */}
      <circle cx="16" cy="18" r="11" fill="rgba(52, 211, 153, 0.15)" stroke="url(#sessionTimerGrad)" strokeWidth="2" />
      {/* Watch Hand */}
      <path d="M16 18L16 11" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 18L21 21" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="18" r="2" fill="#ffffff" />
    </svg>
  );
};
