"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  flagCode: string | null; // ISO 3166-1 alpha-2, e.g. "ar"
  shortName: string;
  size: number;
  className?: string;
  fallbackClassName?: string;
};

export default function TeamFlag({
  flagCode,
  shortName,
  size,
  className = "",
  fallbackClassName = "",
}: Props) {
  const [error, setError] = useState(false);

  if (!flagCode || error) {
    return (
      <div
        className={`rounded-full flex items-center justify-center font-bold shrink-0 ${
          fallbackClassName || "bg-slate-200 text-slate-600 border border-slate-300"
        }`}
        style={{ width: size, height: size, fontSize: Math.floor(size * 0.28) }}
      >
        {shortName.slice(0, 3)}
      </div>
    );
  }

  return (
    <Image
      src={`https://flagcdn.com/w80/${flagCode}.png`}
      alt={shortName}
      width={size}
      height={size}
      className={`rounded-full object-cover shrink-0 ${className}`}
      onError={() => setError(true)}
    />
  );
}
