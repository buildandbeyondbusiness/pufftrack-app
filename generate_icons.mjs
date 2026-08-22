import sharp from 'sharp';

const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stopColor="#1e1b4b" />
      <stop offset="60%" stopColor="#09090b" />
      <stop offset="100%" stopColor="#000000" />
    </radialGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#38bdf8" />
      <stop offset="50%" stopColor="#6366f1" />
      <stop offset="100%" stopColor="#ec4899" />
    </linearGradient>
    <linearGradient id="vaporGrad" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
      <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- iOS App Icon Squircle Background -->
  <rect width="512" height="512" rx="115" fill="url(#bgGrad)" />
  <rect width="510" height="510" x="1" y="1" rx="114" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />

  <!-- Outer Neon Orbital Aura -->
  <circle cx="256" cy="256" r="175" stroke="url(#ringGrad)" stroke-width="8" stroke-dasharray="24 12" opacity="0.6" filter="url(#glow)" />
  <circle cx="256" cy="256" r="145" stroke="rgba(56, 189, 248, 0.25)" stroke-width="4" />

  <!-- Center Apple Draw Vapor Cloud Silhouette -->
  <g transform="translate(136, 136)" filter="url(#glow)">
    <!-- Main Center Plume -->
    <path
      d="M120 40C85 40 55 68 55 102C55 106 55.6 110 56.7 113.8C35.2 121.2 20 141.5 20 165C20 195.4 44.6 220 75 220H170C197.6 220 220 197.6 220 170C220 145.4 202.4 125 178.5 120.8C176.2 75.6 138.8 40 120 40Z"
      fill="url(#vaporGrad)"
    />
    <!-- Dynamic Inner Spark Swirl -->
    <path
      d="M120 85C100 85 82 102 82 122C82 125 82.5 128 83.2 130.5C69 135.5 60 149 60 164C60 184 76 200 96 200H150C168 200 182 186 182 168C182 152 170 138 155 135C153 107 132 85 120 85Z"
      fill="#ffffff"
      opacity="0.9"
    />
  </g>

  <!-- Spark Accent -->
  <circle cx="340" cy="150" r="8" fill="#38bdf8" filter="url(#glow)" />
  <circle cx="160" cy="350" r="6" fill="#ec4899" filter="url(#glow)" />
</svg>
`);

async function generate() {
  await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(svgBuffer).resize(192, 192).png().toFile('public/icon-192.png');
  await sharp(svgBuffer).resize(512, 512).png().toFile('public/icon-512.png');
  console.log('✨ High-fidelity Apple PWA & App Icons created successfully!');
}

generate().catch(console.error);
