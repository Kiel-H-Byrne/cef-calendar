import React from 'react';

/**
 * Masonic Square and Compasses Vector Emblem
 * Styled with Imperial Gold (#D4AF37) and Fraternal Navy (#0B2545)
 */
export function MasonicEmblem({
  className = 'w-7 h-7',
  color = '#D4AF37',
  strokeWidth = 2,
}: {
  className?: string;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Masonic Square and Compasses Emblem"
    >
      {/* Compasses (points downward, hinge at top) */}
      <circle cx="50" cy="18" r="5" fill={color} />
      <path
        d="M 50 18 L 18 84"
        stroke={color}
        strokeWidth={strokeWidth * 2.2}
        strokeLinecap="round"
      />
      <path
        d="M 50 18 L 82 84"
        stroke={color}
        strokeWidth={strokeWidth * 2.2}
        strokeLinecap="round"
      />
      {/* Square (legs extending upward at 90 degrees) */}
      <path
        d="M 22 42 L 50 78 L 78 42"
        stroke={color}
        strokeWidth={strokeWidth * 2.5}
        strokeLinecap="round"
        strokeLinejoin="miter"
      />
      {/* Letter 'G' in center */}
      <text
        x="50"
        y="56"
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontFamily="Cinzel, Georgia, serif"
        fontWeight="bold"
        fontSize="24"
        letterSpacing="0"
      >
        G
      </text>
    </svg>
  );
}

/**
 * Order of the Eastern Star (O.E.S.) Five-Pointed Star
 * Incorporating the five emblematic colors:
 * Blue (#2980B9), Yellow (#F39C12), White (#FFFFFF), Green (#27AE60), Red (#C0392B)
 * with Imperial Gold outline
 */
export function EasternStarEmblem({
  className = 'w-7 h-7',
  size = 100,
}: {
  className?: string;
  size?: number;
}) {
  // 5 points of the star (pointing downward in Prince Hall OES tradition)
  // Center is (50, 50). Outer radius 44, inner radius 18.
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Order of the Eastern Star Emblem"
    >
      {/* Gold outer border ring */}
      <circle cx="50" cy="50" r="47" stroke="#D4AF37" strokeWidth="2.5" fill="#0B2545" />

      {/* Point 1 (Top Left): Blue (Adah / Jephthah's Daughter) */}
      <polygon
        points="50,50 38,36 16,34 32,48"
        fill="#2980B9"
        stroke="#D4AF37"
        strokeWidth="1"
      />

      {/* Point 2 (Top Right): Yellow (Ruth) */}
      <polygon
        points="50,50 62,36 84,34 68,48"
        fill="#F39C12"
        stroke="#D4AF37"
        strokeWidth="1"
      />

      {/* Point 3 (Bottom Right): White (Esther) */}
      <polygon
        points="50,50 64,57 72,80 50,66"
        fill="#F8F9FA"
        stroke="#D4AF37"
        strokeWidth="1"
      />

      {/* Point 4 (Bottom Point): Green (Martha) */}
      <polygon
        points="50,50 50,66 50,92 40,68"
        fill="#27AE60"
        stroke="#D4AF37"
        strokeWidth="1"
      />

      {/* Point 5 (Bottom Left): Red (Electa) */}
      <polygon
        points="50,50 36,57 28,80 50,66"
        fill="#C0392B"
        stroke="#D4AF37"
        strokeWidth="1"
      />

      {/* Center Pentagram / Altar */}
      <polygon
        points="50,42 58,47 55,56 45,56 42,47"
        fill="#D4AF37"
        stroke="#B8952E"
        strokeWidth="1"
      />
      <circle cx="50" cy="50" r="3" fill="#0B2545" />
    </svg>
  );
}

/**
 * Official PHFAMOESCEF Combined Seal
 * Uniting MWPHGLDC (Masonic) and GTGC (Eastern Star)
 */
export function PhfSeal({ className = 'w-11 h-11' }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-ph-navy border-2 border-ph-gold shadow-gold-glow flex-shrink-0 p-1 ${className}`}
      title="Prince Hall Masonic Temple &amp; PHFAMOESCEF - 1000 U Street NW"
    >
      <div className="flex items-center justify-center gap-0.5">
        <MasonicEmblem className="w-5 h-5" color="#D4AF37" strokeWidth={2} />
        <EasternStarEmblem className="w-4 h-4" />
      </div>
    </div>
  );
}

/**
 * Refined 5-Color Eastern Star Accent Strip
 * Used for GTGC badges, cards, and accent dividers
 */
export function FiveColorOesStrip({ className = 'h-1 w-full rounded-full' }: { className?: string }) {
  return (
    <div
      className={`grid grid-cols-5 overflow-hidden ${className}`}
      aria-hidden="true"
      title="OES Five Colors"
    >
      <div className="bg-[#2980B9]" title="Blue - Fidelity" />
      <div className="bg-[#F39C12]" title="Yellow - Constancy" />
      <div className="bg-[#FFFFFF]" title="White - Light & Purity" />
      <div className="bg-[#27AE60]" title="Green - Faith" />
      <div className="bg-[#C0392B]" title="Red - Fervency" />
    </div>
  );
}

/**
 * 501(c)(3) Tax-Exempt Status Badge
 * Compliant with Brand Spec Section 5.D
 */
export function TaxExemptBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] shadow-xs ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" aria-hidden="true" />
      501(c)(3) Tax-Exempt
    </span>
  );
}

/**
 * Landmark Location Badge (1000 U St NW)
 * Compliant with Brand Spec Section 5.D
 */
export function LocationBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] shadow-xs ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF]" aria-hidden="true" />
      1000 U Street NW • Washington, D.C.
    </span>
  );
}
