interface IllustrationProps {
  className?: string;
}

export function FridgeIllustration({ className = "h-32 w-32" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="80" cy="80" r="72" className="fill-forest-100/80" />
      <rect x="48" y="28" width="64" height="104" rx="12" className="fill-white" />
      <rect x="52" y="32" width="56" height="44" rx="8" className="fill-forest-100" />
      <rect x="52" y="82" width="56" height="46" rx="8" className="fill-sky-50" />
      <rect x="58" y="38" width="20" height="6" rx="3" className="fill-forest-300" />
      <rect x="58" y="88" width="16" height="5" rx="2.5" className="fill-sky-200" />
      <circle cx="98" cy="52" r="3" className="fill-forest-400" />
      <circle cx="98" cy="98" r="3" className="fill-sky-400" />
      <ellipse cx="118" cy="48" rx="14" ry="18" className="fill-emerald-200/90" />
      <ellipse cx="122" cy="44" rx="8" ry="10" className="fill-emerald-400" />
      <circle cx="30" cy="100" r="10" className="fill-orange-300" />
      <circle cx="26" cy="96" r="4" className="fill-orange-500/60" />
    </svg>
  );
}

export function RecipeIllustration({ className = "h-32 w-32" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="80" cy="80" r="72" className="fill-plum-100/70" />
      <ellipse cx="80" cy="108" rx="48" ry="14" className="fill-coffee-600/20" />
      <path
        d="M52 88c8-28 48-28 56 0"
        className="stroke-coffee-700"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="80" cy="72" r="28" className="fill-amber-100" />
      <path
        d="M68 72c4-8 20-8 24 0 2 4-2 10-12 10s-14-6-12-10z"
        className="fill-amber-400"
      />
      <path
        d="M58 48l-8-16M102 48l8-16"
        className="stroke-plum-600"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="48" cy="56" r="6" className="fill-forest-400" />
      <circle cx="112" cy="60" r="5" className="fill-red-400" />
      <path
        d="M72 118h16"
        className="stroke-navy-300"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ShoppingIllustration({ className = "h-32 w-32" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="80" cy="80" r="72" className="fill-forest-50" />
      <path
        d="M44 56h72l-8 64H52L44 56z"
        className="fill-white stroke-forest-600"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M56 56c0-12 8-20 24-20s24 8 24 20"
        className="stroke-forest-600"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="68" cy="88" r="6" className="fill-plum-400" />
      <circle cx="92" cy="88" r="6" className="fill-forest-400" />
      <rect x="100" y="36" width="28" height="36" rx="6" className="fill-amber-100" />
      <path d="M106 48h16M106 56h12" className="stroke-amber-500" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ScanIllustration({ className = "h-32 w-32" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="80" cy="80" r="72" className="fill-navy-50" />
      <rect x="44" y="52" width="72" height="56" rx="10" className="fill-white stroke-forest-600" strokeWidth="3" />
      <path d="M52 68h56M52 80h40M52 92h48" className="stroke-cream-400" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M44 72h72"
        className="stroke-forest-400"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <rect x="58" y="58" width="14" height="14" rx="2" className="stroke-forest-500" strokeWidth="2" />
      <rect x="88" y="58" width="14" height="14" rx="2" className="stroke-forest-500" strokeWidth="2" />
      <rect x="58" y="88" width="14" height="14" rx="2" className="stroke-forest-500" strokeWidth="2" />
      <rect x="88" y="88" width="14" height="14" rx="2" className="stroke-forest-500" strokeWidth="2" />
    </svg>
  );
}
