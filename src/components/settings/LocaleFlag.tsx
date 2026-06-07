"use client";

import Image from "next/image";
import { localeCountryCodes, type Locale } from "@/i18n/config";

interface LocaleFlagProps {
  locale: Locale;
  size?: number;
  className?: string;
}

export function LocaleFlag({
  locale,
  size = 32,
  className = "",
}: LocaleFlagProps) {
  const countryCode = localeCountryCodes[locale];

  return (
    <span
      className={[
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-black/8",
        className,
      ].join(" ")}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src={`/flags/${countryCode}.svg`}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
        unoptimized
      />
    </span>
  );
}
