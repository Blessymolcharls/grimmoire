"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, BookOpen, Bookmark, CheckCircle2, Clock, Sparkles } from "lucide-react";

export interface BookCardData {
  id: string;
  title: string;
  authors: string[];
  coverUrl?: string | null;
  publicationYear?: number | null;
  pageCount?: number | null;
  currentPage?: number | null;
  readingStatus: string;
  rating?: number | null;
  isFavorite?: boolean;
  departments?: Array<{ id: string; name: string; accentColor?: string | null }>;
  personalReview?: string | null;
}

interface BookCardProps {
  book: BookCardData;
  onSelect?: (id: string) => void;
}

export function BookCard({ book, onSelect }: BookCardProps) {
  const progressPercent =
    book.pageCount && book.currentPage
      ? Math.min(100, Math.round((book.currentPage / book.pageCount) * 100))
      : 0;

  const renderStatus = () => {
    switch (book.readingStatus) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "CURRENTLY_READING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-700/50">
            <Clock className="w-3 h-3" /> Reading ({progressPercent}%)
          </span>
        );
      case "WANT_TO_READ":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
            <BookOpen className="w-3 h-3" /> Want to Read
          </span>
        );
      case "ON_HOLD":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 text-zinc-300 border border-zinc-700/50">
            On Hold
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 text-zinc-400">
            Did Not Finish
          </span>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="parchment-card rounded-xl p-4 flex flex-col justify-between group transition-shadow hover:shadow-[0_8px_30px_rgba(197,165,106,0.15)] relative overflow-hidden"
    >
      {/* Decorative top corner accent */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#C5A56A]/20 to-transparent pointer-events-none" />

      <div>
        <div className="flex gap-4">
          {/* Book Cover */}
          <div className="relative w-20 h-28 flex-shrink-0 bg-[#171120] rounded-md overflow-hidden border border-[#C5A56A]/25 shadow-md group-hover:border-[#C5A56A]/60 transition-colors">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : null}
            {/* Fallback book design when no cover or cover fails */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center -z-10 bg-gradient-to-b from-[#2A1B16] to-[#100D18]">
              <Sparkles className="w-5 h-5 text-[#C5A56A]/60 mb-1" />
              <p className="text-[9px] font-serif-magical text-[#E9DCC1] line-clamp-2">
                {book.title}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-1">
                <h3 className="font-serif-magical text-[#E9DCC1] font-semibold text-base line-clamp-2 leading-snug group-hover:text-[#F3D9A0] transition-colors">
                  {book.title}
                </h3>
                {book.isFavorite && (
                  <Bookmark className="w-4 h-4 text-[#C5A56A] fill-[#C5A56A] flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-[#B7ADBD] truncate mt-1">
                {book.authors.join(", ")}
              </p>
              {book.publicationYear && (
                <p className="text-[11px] text-[#8E8495] mt-0.5">
                  Anno {book.publicationYear}
                </p>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between">
              {renderStatus()}
              {book.rating ? (
                <div className="flex items-center gap-0.5 text-[#C5A56A]">
                  <Star className="w-3.5 h-3.5 fill-[#C5A56A]" />
                  <span className="text-xs font-semibold">{book.rating}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Departments badges */}
        {book.departments && book.departments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[#C5A56A]/10">
            {book.departments.slice(0, 3).map((dept) => (
              <span
                key={dept.id}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#100D18] text-[#E9DCC1]/90 border border-[#C5A56A]/20"
                style={{
                  borderColor: dept.accentColor ? `${dept.accentColor}40` : undefined,
                }}
              >
                {dept.name}
              </span>
            ))}
          </div>
        )}

        {/* Progress Bar for Reading */}
        {book.readingStatus === "CURRENTLY_READING" && book.pageCount && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-[#B7ADBD] mb-1">
              <span>Progress</span>
              <span>
                {book.currentPage || 0} / {book.pageCount} pages ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-[#100D18] h-1.5 rounded-full overflow-hidden border border-[#C5A56A]/20">
              <div
                className="h-full bg-gradient-to-r from-[#C5A56A] to-[#F3D9A0] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="mt-4 pt-3 border-t border-[#C5A56A]/15 flex items-center justify-between">
        {onSelect ? (
          <button
            onClick={() => onSelect(book.id)}
            className="text-xs text-[#C5A56A] hover:text-[#F3D9A0] font-medium flex items-center gap-1 transition-colors"
          >
            <span>Open Tome</span> ✦
          </button>
        ) : (
          <Link
            href={`/books/${book.id}`}
            className="text-xs text-[#C5A56A] hover:text-[#F3D9A0] font-medium flex items-center gap-1 transition-colors"
          >
            <span>Open Tome</span> ✦
          </Link>
        )}

        <Link
          href={`/books/${book.id}`}
          className="text-[11px] text-[#B7ADBD] hover:text-[#E9DCC1] transition-colors"
        >
          View Full Details →
        </Link>
      </div>
    </motion.div>
  );
}
