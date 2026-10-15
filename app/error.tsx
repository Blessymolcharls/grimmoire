"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Castle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Grimmoire application error caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-12 min-h-[75vh]">
      <div className="parchment-card rounded-3xl p-8 sm:p-14 max-w-xl w-full border-2 border-rose-900/40 text-center shadow-2xl relative overflow-hidden space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#39251F]/80 border border-rose-700/50 mx-auto flex items-center justify-center text-rose-400 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-800/50 text-xs font-serif-magical uppercase tracking-wider text-rose-300">
            <span>A Magical Disruption Occurred</span>
          </div>

          <h1 className="font-serif-magical text-2xl sm:text-3xl font-extrabold text-[#E9DCC1] tracking-wide">
            The Enchantment Falters
          </h1>
          <p className="text-sm text-[#B7ADBD] leading-relaxed max-w-md mx-auto">
            An unforeseen anomaly disturbed the archives. You may attempt to recant the spell or
            return to the safety of the Grand Entrance.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs sm:text-sm shadow-md hover:from-[#DFCA9B] hover:to-[#C5A56A] transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Recant Spell (Retry)</span>
          </button>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-[#21162E] hover:bg-[#39251F] text-[#E9DCC1] border border-[#C5A56A]/30 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
          >
            <Castle className="w-4 h-4 text-[#C5A56A]" />
            <span>Grand Entrance</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
