import Link from "next/link";
import { Castle, BookOpen, Compass, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-12 min-h-[75vh]">
      <div className="parchment-card rounded-3xl p-8 sm:p-14 max-w-xl w-full border-2 border-[#C5A56A]/35 text-center shadow-2xl relative overflow-hidden space-y-6">
        {/* Ambient atmospheric glow */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#C5A56A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-[#39251F]/80 border border-[#C5A56A]/40 mx-auto flex items-center justify-center text-[#F3D9A0] shadow-inner">
          <Castle className="w-8 h-8 text-[#C5A56A]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#100D18]/80 border border-[#C5A56A]/30 text-xs font-serif-magical uppercase tracking-widest text-[#C5A56A]">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>The Vanishing Corridor</span>
          </div>

          <h1 className="font-serif-magical text-3xl sm:text-4xl font-extrabold text-[#E9DCC1] tracking-wide">
            Tome Unfound
          </h1>
          <p className="text-sm text-[#B7ADBD] leading-relaxed max-w-md mx-auto">
            The archive chamber you seek does not exist or has been sealed away in the Restricted
            Section. Return to the familiar light of the library halls.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs sm:text-sm shadow-md hover:from-[#DFCA9B] hover:to-[#C5A56A] transition-all flex items-center gap-2"
          >
            <Castle className="w-4 h-4" />
            <span>Grand Entrance</span>
          </Link>

          <Link
            href="/library"
            className="px-5 py-2.5 rounded-xl bg-[#21162E] hover:bg-[#39251F] text-[#E9DCC1] border border-[#C5A56A]/30 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-[#C5A56A]" />
            <span>Browse Shelves</span>
          </Link>

          <Link
            href="/discover"
            className="px-5 py-2.5 rounded-xl bg-[#21162E] hover:bg-[#39251F] text-[#E9DCC1] border border-[#C5A56A]/30 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#C5A56A]" />
            <span>Discover Tomes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
