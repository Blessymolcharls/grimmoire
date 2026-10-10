"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  BookOpen,
  Quote as QuoteIcon,
  Bookmark,
  Sparkles,
  ExternalLink,
  Save,
  Trash2,
  Plus,
} from "lucide-react";

interface BookDetailData {
  id: string;
  title: string;
  authors: string[];
  description?: string | null;
  coverUrl?: string | null;
  publicationYear?: number | null;
  publisher?: string | null;
  isbn10?: string | null;
  isbn13?: string | null;
  pageCount?: number | null;
  readingStatus: string;
  rating?: number | null;
  isFavorite?: boolean;
  dateStarted?: string | null;
  dateCompleted?: string | null;
  currentPage?: number | null;
  personalReview?: string | null;
  favoriteCharacter?: string | null;
  notes?: string | null;
  spineColor?: string | null;
  departments?: Array<{ id: string; name: string; accentColor?: string | null }>;
  quotes?: Array<{ id: string; text: string; pageNumber?: number | null; personalNote?: string | null }>;
}

interface BookOpeningModalProps {
  bookId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onBookUpdated?: () => void;
  onBookDeleted?: () => void;
}

export function BookOpeningModal({
  bookId,
  isOpen,
  onClose,
  onBookUpdated,
  onBookDeleted,
}: BookOpeningModalProps) {
  const [book, setBook] = useState<BookDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields in modal
  const [status, setStatus] = useState("WANT_TO_READ");
  const [rating, setRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [personalReview, setPersonalReview] = useState("");
  const [notes, setNotes] = useState("");
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuotePage, setNewQuotePage] = useState("");
  const [showAddQuote, setShowAddQuote] = useState(false);

  useEffect(() => {
    if (!bookId || !isOpen) {
      setBook(null);
      return;
    }

    setLoading(true);
    fetch(`/api/books/${bookId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.book) {
          setBook(data.book);
          setStatus(data.book.readingStatus);
          setRating(data.book.rating);
          setCurrentPage(data.book.currentPage || 0);
          setIsFavorite(data.book.isFavorite || false);
          setPersonalReview(data.book.personalReview || "");
          setNotes(data.book.notes || "");
        }
      })
      .catch((err) => console.error("Error loading book:", err))
      .finally(() => setLoading(false));
  }, [bookId, isOpen]);

  const handleSaveQuickUpdates = async () => {
    if (!book) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readingStatus: status,
          rating,
          currentPage,
          isFavorite,
          personalReview,
          notes,
          ...(status === "COMPLETED" && !book.dateCompleted
            ? { dateCompleted: new Date().toISOString() }
            : {}),
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        onBookUpdated?.();
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuote = async () => {
    if (!book || !newQuoteText.trim()) return;
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          text: newQuoteText.trim(),
          pageNumber: newQuotePage ? parseInt(newQuotePage, 10) : null,
        }),
      });
      if (res.ok) {
        const { quote } = await res.json();
        setBook((prev) =>
          prev ? { ...prev, quotes: [quote, ...(prev.quotes || [])] } : null
        );
        setNewQuoteText("");
        setNewQuotePage("");
        setShowAddQuote(false);
      }
    } catch (err) {
      console.error("Error adding quote:", err);
    }
  };

  const handleDelete = async () => {
    if (!book) return;
    if (confirm(`Are you certain you wish to purge "${book.title}" from the archives?`)) {
      try {
        const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
        if (res.ok) {
          onBookDeleted?.();
          onClose();
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#140E1D] border-2 border-[#C5A56A]/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(197,165,106,0.15)] overflow-hidden text-[#E9DCC1]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#C5A56A]/20 bg-[#1C1328]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A56A] animate-pulse" />
              <span className="font-serif-magical text-sm font-semibold tracking-wider text-[#F3D9A0]">
                Tome of Wisdom • Open Record
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#B7ADBD] hover:text-[#E9DCC1] hover:bg-[#21162E] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-2 border-[#C5A56A] border-t-transparent rounded-full animate-spin" />
              <p className="font-serif-magical text-[#C5A56A] text-sm animate-pulse">
                Unsealing the ancient tome...
              </p>
            </div>
          ) : book ? (
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#C5A56A]/20">
              {/* LEFT PAGE: Physical Identity & Literary Essence */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-[#1C1328]/60 to-[#140E1D] flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex gap-5">
                    {/* Cover */}
                    <div className="w-28 sm:w-36 h-40 sm:h-52 flex-shrink-0 rounded-lg overflow-hidden border-2 border-[#C5A56A]/30 shadow-xl bg-[#100D18] relative">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center -z-10 bg-gradient-to-b from-[#39251F] to-[#100D18]">
                        <BookOpen className="w-6 h-6 text-[#C5A56A]/60 mb-2" />
                        <span className="font-serif-magical text-[11px] text-[#E9DCC1] line-clamp-3">
                          {book.title}
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsFavorite(!isFavorite)}
                            className={`p-1 rounded transition-colors ${
                              isFavorite
                                ? "text-[#C5A56A]"
                                : "text-[#8E8495] hover:text-[#C5A56A]"
                            }`}
                            title={isFavorite ? "Favorited Tome" : "Mark as Favorite"}
                          >
                            <Bookmark
                              className={`w-4 h-4 ${isFavorite ? "fill-[#C5A56A]" : ""}`}
                            />
                          </button>
                          <span className="text-xs uppercase tracking-widest text-[#C5A56A]/80 font-semibold">
                            {book.publicationYear ? `Anno ${book.publicationYear}` : "Archived Tome"}
                          </span>
                        </div>

                        <h2 className="font-serif-magical text-xl sm:text-2xl font-bold text-[#E9DCC1] mt-1 leading-snug">
                          {book.title}
                        </h2>

                        <p className="text-sm text-[#C5A56A] mt-1 font-medium">
                          By {book.authors.join(", ")}
                        </p>

                        {book.publisher && (
                          <p className="text-xs text-[#8E8495] mt-1">
                            Published by {book.publisher}
                          </p>
                        )}
                        {book.pageCount && (
                          <p className="text-xs text-[#8E8495] mt-0.5">
                            {book.pageCount} parchment pages
                          </p>
                        )}
                      </div>

                      {/* Department Tags */}
                      {book.departments && book.departments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {book.departments.map((dept) => (
                            <span
                              key={dept.id}
                              className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#21162E] text-[#F3D9A0] border border-[#C5A56A]/30 font-serif-magical"
                            >
                              ✦ {dept.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Synopsis / Description */}
                  {book.description && (
                    <div className="mt-6 pt-5 border-t border-[#C5A56A]/15">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A56A]/90 font-serif-magical mb-2">
                        Summary of the Work
                      </h4>
                      <p className="text-xs sm:text-sm text-[#B7ADBD] leading-relaxed line-clamp-6 italic">
                        &quot;{book.description}&quot;
                      </p>
                    </div>
                  )}

                  {/* Quotes Excerpt */}
                  {book.quotes && book.quotes.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-[#C5A56A]/15">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A56A]/90 font-serif-magical flex items-center gap-1.5">
                          <QuoteIcon className="w-3 h-3" /> Excerpted Lines ({book.quotes.length})
                        </span>
                      </div>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {book.quotes.map((q) => (
                          <div
                            key={q.id}
                            className="p-2.5 rounded bg-[#21162E]/70 border border-[#C5A56A]/15 text-xs text-[#E9DCC1]"
                          >
                            <p className="italic font-serif-magical leading-relaxed">
                              &ldquo;{q.text}&rdquo;
                            </p>
                            {q.pageNumber && (
                              <p className="text-[10px] text-[#C5A56A] text-right mt-1">
                                — Page {q.pageNumber}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <Link
                    href={`/books/${book.id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#C5A56A] hover:text-[#F3D9A0] font-medium transition-colors"
                  >
                    <span>Inspect Full Sanctum Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1 text-xs text-rose-400/80 hover:text-rose-300 transition-colors"
                    title="Delete Tome"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {/* RIGHT PAGE: Personal Reading Record & Reflections */}
              <div className="p-6 sm:p-8 bg-[#171022]/90 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#C5A56A]/20">
                    <span className="font-serif-magical text-sm font-semibold tracking-wider text-[#F3D9A0]">
                      Your Reading Chronicle
                    </span>
                    {saveSuccess && (
                      <span className="text-xs text-emerald-400 font-medium animate-pulse flex items-center gap-1">
                        ✦ Changes preserved!
                      </span>
                    )}
                  </div>

                  {/* Reading Status Selector */}
                  <div>
                    <label className="block text-xs font-serif-magical text-[#C5A56A] mb-1.5">
                      Current Standing in Your Journey
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg px-3 py-2 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                    >
                      <option value="WANT_TO_READ">Want to Read</option>
                      <option value="CURRENTLY_READING">Currently Reading</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="DID_NOT_FINISH">Did Not Finish</option>
                    </select>
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className="block text-xs font-serif-magical text-[#C5A56A] mb-1.5">
                      Personal Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(rating === star ? null : star)}
                          className="p-1 focus:outline-none transition-transform hover:scale-125"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              rating && star <= rating
                                ? "text-[#C5A56A] fill-[#C5A56A]"
                                : "text-zinc-600 hover:text-[#C5A56A]"
                            }`}
                          />
                        </button>
                      ))}
                      {rating ? (
                        <span className="text-xs text-[#C5A56A] font-semibold ml-2">
                          {rating} / 5 Stars
                        </span>
                      ) : (
                        <span className="text-xs text-[#8E8495] ml-2">Unrated</span>
                      )}
                    </div>
                  </div>

                  {/* Current Page Progress */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <label className="font-serif-magical text-[#C5A56A]">
                        Current Page
                      </label>
                      <span className="text-[#8E8495]">
                        {book.pageCount
                          ? `Total: ${book.pageCount} pages (${Math.min(
                              100,
                              Math.round((currentPage / book.pageCount) * 100)
                            )}%)`
                          : "Unknown total pages"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max={book.pageCount || 9999}
                        value={currentPage}
                        onChange={(e) => setCurrentPage(parseInt(e.target.value, 10) || 0)}
                        className="w-28 bg-[#100D18] border border-[#C5A56A]/30 rounded-lg px-3 py-1.5 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                      />
                      {book.pageCount && (
                        <div className="flex-1 bg-[#100D18] h-2 rounded-full overflow-hidden border border-[#C5A56A]/20">
                          <div
                            className="h-full bg-gradient-to-r from-[#C5A56A] to-[#F3D9A0] transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                (currentPage / book.pageCount) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Review */}
                  <div>
                    <label className="block text-xs font-serif-magical text-[#C5A56A] mb-1.5">
                      Personal Review & Impressions
                    </label>
                    <textarea
                      rows={3}
                      value={personalReview}
                      onChange={(e) => setPersonalReview(e.target.value)}
                      placeholder="What thoughts stirred your soul as you journeyed through these pages?"
                      className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg p-2.5 text-xs text-[#E9DCC1] placeholder-[#8E8495] focus:outline-none focus:border-[#C5A56A] resize-none"
                    />
                  </div>

                  {/* Private Reading Memories */}
                  <div>
                    <label className="block text-xs font-serif-magical text-[#C5A56A] mb-1.5">
                      Private Reading Memories
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Where were you? What season was it? Who was in your heart?"
                      className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg p-2.5 text-xs text-[#E9DCC1] placeholder-[#8E8495] focus:outline-none focus:border-[#C5A56A] resize-none"
                    />
                  </div>

                  {/* Quick Add Quote Toggle */}
                  <div className="pt-2">
                    {showAddQuote ? (
                      <div className="p-3 rounded-lg bg-[#21162E] border border-[#C5A56A]/30 space-y-2">
                        <textarea
                          rows={2}
                          value={newQuoteText}
                          onChange={(e) => setNewQuoteText(e.target.value)}
                          placeholder="Type an excerpt to preserve..."
                          className="w-full bg-[#100D18] border border-[#C5A56A]/20 rounded p-2 text-xs text-[#E9DCC1] focus:outline-none"
                        />
                        <div className="flex items-center justify-between">
                          <input
                            type="number"
                            placeholder="Page #"
                            value={newQuotePage}
                            onChange={(e) => setNewQuotePage(e.target.value)}
                            className="w-20 bg-[#100D18] border border-[#C5A56A]/20 rounded px-2 py-1 text-xs text-[#E9DCC1]"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAddQuote(false)}
                              className="text-xs text-[#8E8495] hover:text-[#E9DCC1]"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleAddQuote}
                              className="px-3 py-1 bg-[#C5A56A] text-[#100D18] font-semibold text-xs rounded hover:bg-[#F3D9A0]"
                            >
                              Save Quote
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddQuote(true)}
                        className="text-xs text-[#C5A56A] hover:text-[#F3D9A0] flex items-center gap-1 font-serif-magical"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Scribe a Quote from this Tome</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Save Changes Button */}
                <div className="pt-4 border-t border-[#C5A56A]/20 flex justify-end">
                  <button
                    onClick={handleSaveQuickUpdates}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-sm shadow-lg hover:from-[#DFCA9B] hover:to-[#C5A56A] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Binding Parchment..." : "Seal & Preserve Updates"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
