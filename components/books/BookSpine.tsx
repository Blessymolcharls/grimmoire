"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Bookmark } from "lucide-react";

export interface BookSpineData {
  id: string;
  title: string;
  authors: string[];
  pageCount?: number | null;
  currentPage?: number | null;
  readingStatus: string;
  rating?: number | null;
  spineColor?: string | null;
  isFavorite?: boolean;
}

interface BookSpineProps {
  book: BookSpineData;
  onSelect: (bookId: string) => void;
  index?: number;
}

export function BookSpine({ book, onSelect, index = 0 }: BookSpineProps) {
  // Deterministic spine height and width based on page count or title length
  const pages = book.pageCount || 300;
  // Height between 190px and 245px
  const height = Math.min(250, Math.max(185, 190 + (pages % 55)));
  // Width between 34px and 54px
  const width = Math.min(56, Math.max(34, 34 + Math.floor(pages / 50)));

  const spineBg = book.spineColor || "#39251F";

  const getStatusBadge = () => {
    switch (book.readingStatus) {
      case "COMPLETED":
        return "bg-emerald-600/80 text-emerald-100";
      case "CURRENTLY_READING":
        return "bg-amber-600/80 text-amber-100";
      case "WANT_TO_READ":
        return "bg-indigo-600/80 text-indigo-100";
      default:
        return "bg-zinc-600/80 text-zinc-100";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(0.5, index * 0.03) }}
      whileHover={{ y: -16, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(book.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(book.id);
        }
      }}
      aria-label={`Inspect tome: ${book.title} by ${book.authors.join(", ")}`}
      style={{
        height: `${height}px`,
        width: `${width}px`,
        backgroundColor: spineBg,
      }}
      className="book-spine relative flex-shrink-0 cursor-pointer rounded-t-sm shadow-md border-t border-r border-[#C5A56A]/30 overflow-hidden flex flex-col justify-between items-center py-2 px-1 select-none focus:outline-none focus:ring-2 focus:ring-[#C5A56A]"
    >
      {/* Antique Texture & Spine Ribs Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-white/10 to-black/45 pointer-events-none" />
      <div className="absolute top-3 left-0 right-0 h-[1.5px] bg-[#C5A56A]/50 pointer-events-none shadow-sm" />
      <div className="absolute top-5 left-0 right-0 h-[1px] bg-[#C5A56A]/30 pointer-events-none" />
      <div className="absolute bottom-6 left-0 right-0 h-[1px] bg-[#C5A56A]/30 pointer-events-none" />
      <div className="absolute bottom-4 left-0 right-0 h-[1.5px] bg-[#C5A56A]/50 pointer-events-none shadow-sm" />

      {/* Ribbon Bookmark if favorite or in-progress */}
      {book.isFavorite && (
        <div className="absolute -top-1 right-2 z-10 text-[#C5A56A] drop-shadow-md">
          <Bookmark className="w-3.5 h-3.5 fill-[#C5A56A]" />
        </div>
      )}

      {/* Top Spine Ornament */}
      <div className="z-10 text-[9px] text-[#C5A56A]/80 font-serif-magical pt-3">
        {book.rating ? (
          <div className="flex items-center gap-0.5 justify-center">
            <Star className="w-2.5 h-2.5 fill-[#C5A56A] text-[#C5A56A]" />
            <span className="text-[9px] font-bold">{book.rating}</span>
          </div>
        ) : (
          <span>✦</span>
        )}
      </div>

      {/* Spine Title (Vertical writing mode) */}
      <div className="z-10 flex-1 flex items-center justify-center my-1 w-full overflow-hidden">
        <p
          className="font-serif-magical text-[#E9DCC1] text-xs font-semibold tracking-wider text-center line-clamp-1 whitespace-nowrap rotate-180 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          style={{
            writingMode: "vertical-rl",
            maxHeight: `${height - 70}px`,
          }}
        >
          {book.title}
        </p>
      </div>

      {/* Bottom Spine Author / Crest */}
      <div className="z-10 text-[8px] text-[#E9DCC1]/70 font-sans tracking-tight pb-1 truncate max-w-full text-center">
        {book.authors[0]?.split(" ").pop() || "Tome"}
      </div>

      {/* Reading Status Indicator Notch */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${getStatusBadge()}`}
        title={book.readingStatus.replace(/_/g, " ")}
      />
    </motion.div>
  );
}
