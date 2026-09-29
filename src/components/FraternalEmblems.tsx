import Image from "next/image";

export interface OrgLogoInfo {
  src: string;
  alt: string;
}

/**
 * Official brand logos provided directly by the organizations:
 * - mwphgldc_logo.png: Most Worshipful Prince Hall Grand Lodge of DC
 * - gtgc_logo.jpg: Georgiana Thomas Grand Chapter O.E.S.
 * - cef_logo.jpeg: PHFAMOESCEF
 * - cef_thc_logo.png: CEF THC (Title Holding Corporation)
 */
export const ORG_LOGOS: Record<string, OrgLogoInfo> = {
  "org-alpha": {
    src: "/mwphgldc_logo.png",
    alt: "Most Worshipful Prince Hall Grand Lodge of DC",
  },
  "org-beta": { src: "/cef_logo.jpeg", alt: "PHFAMOESCEF" },
  "org-gamma": {
    src: "/cef_thc_logo.png",
    alt: "CEF THC - Title Holding Corporation",
  },
  "org-delta": {
    src: "/gtgc_logo.jpg",
    alt: "Georgiana Thomas Grand Chapter O.E.S.",
  },
  "org-epsilon": {
    src: "/mwphgldc_logo.png",
    alt: "MWPHGLDC Constituent Organizations",
  },
  "org-zeta": {
    src: "/cef_thc_logo.png",
    alt: "Prince Hall Masonic Temple - 1000 U St NW",
  },
};

/**
 * Renders the official brand logo for any calendar organization
 */
export function OrgLogo({
  orgId,
  className = "w-5 h-5",
  size = 24,
}: {
  orgId: string;
  className?: string;
  size?: number;
}) {
  const logo = ORG_LOGOS[orgId];
  if (!logo) return null;
  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={size}
      height={size}
      className={`rounded-full object-contain bg-white shadow-2xs ${className}`}
    />
  );
}

/**
 * Refined 5-Color Eastern Star Accent Strip
 * Used for GTGC badges, cards, and accent dividers
 */
export function FiveColorOesStrip({
  className = "h-1 w-full rounded-full",
}: {
  className?: string;
}) {
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
export function TaxExemptBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] shadow-xs ${className}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
        aria-hidden="true"
      />
      501(c)(3) Tax-Exempt
    </span>
  );
}

/**
 * Landmark Location Badge (1000 U St NW)
 * Compliant with Brand Spec Section 5.D
 */
export function LocationBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] shadow-xs ${className}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-[#1E40AF]"
        aria-hidden="true"
      />
      1000 U Street NW • Washington, D.C.
    </span>
  );
}

/**
 * Official Website Link Badge for phfamoescef.com
 */
export function WebsiteLinkBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://www.phfamoescef.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-white dark:bg-[#0B2545] text-[#003366] dark:text-[#D4AF37] border border-slate-300 dark:border-slate-700 hover:border-[#D4AF37] transition-colors shadow-2xs ${className}`}
      title="Visit official website: phfamoescef.com"
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
        aria-hidden="true"
      />
      phfamoescef.com
    </a>
  );
}

/**
 * Fallback Masonic Square and Compasses Vector Emblem
 */
export function MasonicEmblem({
  className = "w-7 h-7",
  color = "#D4AF37",
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
      <path
        d="M 22 42 L 50 78 L 78 42"
        stroke={color}
        strokeWidth={strokeWidth * 2.5}
        strokeLinecap="round"
        strokeLinejoin="miter"
      />
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
 * Fallback Order of the Eastern Star (O.E.S.) Five-Pointed Star
 */
export function EasternStarEmblem({
  className = "w-7 h-7",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Order of the Eastern Star Emblem"
    >
      <circle
        cx="50"
        cy="50"
        r="47"
        stroke="#D4AF37"
        strokeWidth="2.5"
        fill="#0B2545"
      />
      <polygon
        points="50,50 38,36 16,34 32,48"
        fill="#2980B9"
        stroke="#D4AF37"
        strokeWidth="1"
      />
      <polygon
        points="50,50 62,36 84,34 68,48"
        fill="#F39C12"
        stroke="#D4AF37"
        strokeWidth="1"
      />
      <polygon
        points="50,50 64,57 72,80 50,66"
        fill="#F8F9FA"
        stroke="#D4AF37"
        strokeWidth="1"
      />
      <polygon
        points="50,50 50,66 50,92 40,68"
        fill="#27AE60"
        stroke="#D4AF37"
        strokeWidth="1"
      />
      <polygon
        points="50,50 36,57 28,80 50,66"
        fill="#C0392B"
        stroke="#D4AF37"
        strokeWidth="1"
      />
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
