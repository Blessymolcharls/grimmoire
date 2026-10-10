"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  BookOpen,
  Quote as QuoteIcon,
  Bookmark,
  Save,
  Trash2,
  Plus,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface BookDetailClientProps {
  initialBook: any;
  allDepartments: any[];
}

export function BookDetailClient({
  initialBook,
  allDepartments,
}: BookDetailClientProps) {
  const router = useRouter();
  const [book, setBook] = useState(initialBook);

  // Form states
  const [status, setStatus] = useState(book.readingStatus);
  const [rating, setRating] = useState<number | null>(book.rating);
  const [currentPage, setCurrentPage] = useState<number>(book.currentPage || 0);
  const [isFavorite, setIsFavorite] = useState(book.isFavorite || false);
  const [personalReview, setPersonalReview] = useState(book.personalReview || "");
  const [favoriteCharacter, setFavoriteCharacter] = useState(book.favoriteCharacter || "");
  const [notes, setNotes] = useState(book.notes || "");
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>(
    book.departments.map((d: any) => d.id)
  );

  // Quote form state
  const [quoteText, setQuoteText] = useState("");
  const [quotePage, setQuotePage] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // Reading Session state
  const [sessionMinutes, setSessionMinutes] = useState("30");
  const [sessionPages, setSessionPages] = useState("25");
  const [sessionNote, setSessionNote] = useState("");
  const [showSessionForm, setShowSessionForm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const progressPercent =
    book.pageCount && currentPage
      ? Math.min(100, Math.round((currentPage / book.pageCount) * 100))
      : 0;

  const handleSave = async () => {
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
          favoriteCharacter,
          notes,
          departmentIds: selectedDeptIds,
          ...(status === "COMPLETED" && !book.dateCompleted
            ? { dateCompleted: new Date().toISOString() }
            : {}),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBook((prev: any) => ({
          ...prev,
          ...data.book,
        }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim()) return;

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          text: quoteText.trim(),
          pageNumber: quotePage ? parseInt(quotePage, 10) : null,
          personalNote: quoteNote.trim() || null,
        }),
      });

      if (res.ok) {
        const { quote } = await res.json();
        setBook((prev: any) => ({
          ...prev,
          quotes: [quote, ...(prev.quotes || [])],
        }));
        setQuoteText("");
        setQuotePage("");
        setQuoteNote("");
        setShowQuoteForm(false);
      }
    } catch (err) {
      console.error("Error adding quote:", err);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm("Excise this quote from the records?")) return;
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, { method: "DELETE" });
      if (res.ok) {
        setBook((prev: any) => ({
          ...prev,
          quotes: prev.quotes.filter((q: any) => q.id !== quoteId),
        }));
      }
    } catch (err) {
      console.error("Delete quote error:", err);
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          durationMinutes: sessionMinutes ? parseInt(sessionMinutes, 10) : null,
          pagesRead: sessionPages ? parseInt(sessionPages, 10) : null,
          note: sessionNote.trim() || null,
        }),
      });

      if (res.ok) {
        const { session } = await res.json();
        setBook((prev: any) => ({
          ...prev,
          readingSessions: [session, ...(prev.readingSessions || [])],
          currentPage: Math.min(
            book.pageCount || 9999,
            currentPage + (session.pagesRead || 0)
          ),
        }));
        setCurrentPage((prev) =>
          Math.min(book.pageCount || 9999, prev + (session.pagesRead || 0))
        );
        setShowSessionForm(false);
        setSessionNote("");
      }
    } catch (err) {
      console.error("Error recording session:", err);
    }
  };

  const handleDeleteBook = async () => {
    if (
      confirm(
        `Are you certain you wish to purge "${book.title}" forever from the Hogwarts Library archives?`
      )
    ) {
      try {
        const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
        if (res.ok) {
          router.push("/library");
        }
      } catch (err) {
        console.error("Delete book error:", err);
      }
    }
  };

  const toggleDepartment = (deptId: string) => {
    setSelectedDeptIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-12 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#C5A56A] hover:text-[#F3D9A0] font-serif-magical transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shelves</span>
        </Link>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-medium animate-pulse flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Preserved in Archives!
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs sm:text-sm shadow-lg hover:from-[#DFCA9B] hover:to-[#C5A56A] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Binding..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* OPEN MAGICAL TOME CONTAINER */}
      <div className="parchment-card rounded-3xl border-2 border-[#C5A56A]/35 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#C5A56A]/20">
        {/* LEFT PAGE: Physical Book Identity (5 cols on lg) */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 bg-[#160F22]/80 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              {/* Cover */}
              <div className="w-32 sm:w-40 h-48 sm:h-60 rounded-xl overflow-hidden bg-[#100D18] border-2 border-[#C5A56A]/35 shadow-2xl flex-shrink-0 relative group">
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
                  <BookOpen className="w-8 h-8 text-[#C5A56A]/50 mb-2" />
                  <span className="font-serif-magical text-xs text-[#E9DCC1] line-clamp-3">
                    {book.title}
                  </span>
                </div>
              </div>

              {/* Title & Core Authors */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-serif-magical uppercase tracking-wider text-[#C5A56A]">
                    {book.publicationYear ? `Anno ${book.publicationYear}` : "Archived Tome"}
                  </span>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-1 text-[#C5A56A] hover:scale-110 transition-transform"
                    title={isFavorite ? "Favorited Tome" : "Mark as Favorite"}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${isFavorite ? "fill-[#C5A56A]" : ""}`}
                    />
                  </button>
                </div>

                <h1 className="font-serif-magical text-2xl sm:text-3xl font-extrabold text-[#E9DCC1] leading-tight">
                  {book.title}
                </h1>

                <p className="text-sm text-[#C5A56A] font-semibold">
                  By {book.authors.join(", ")}
                </p>

                <div className="text-xs text-[#8E8495] space-y-1 pt-1">
                  {book.publisher && <p>Publisher: {book.publisher}</p>}
                  {book.pageCount && <p>Length: {book.pageCount} parchment pages</p>}
                  {book.isbn13 && <p>ISBN-13: {book.isbn13}</p>}
                  <p>Inscribed: {new Date(book.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Department Badges Selection */}
            <div>
              <label className="block text-xs font-serif-magical text-[#C5A56A] uppercase tracking-wider mb-2">
                Assigned Magical Departments
              </label>
              <div className="flex flex-wrap gap-2">
                {allDepartments.map((dept) => {
                  const active = selectedDeptIds.includes(dept.id);
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => toggleDepartment(dept.id)}
                      className={`px-3 py-1 rounded-full text-xs font-serif-magical transition-all ${
                        active
                          ? "bg-[#C5A56A] text-[#100D18] font-bold shadow-md"
                          : "bg-[#100D18] text-[#B7ADBD] border border-[#C5A56A]/20 hover:border-[#C5A56A]/60"
                      }`}
                    >
                      {dept.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description / Synopsis */}
            {book.description && (
              <div className="pt-4 border-t border-[#C5A56A]/15">
                <h4 className="text-xs font-serif-magical uppercase tracking-wider text-[#C5A56A] mb-2">
                  Synopsis of the Work
                </h4>
                <p className="text-xs sm:text-sm text-[#B7ADBD] leading-relaxed italic">
                  &quot;{book.description}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Danger zone delete */}
          <div className="pt-6 border-t border-[#C5A56A]/15 flex justify-end">
            <button
              onClick={handleDeleteBook}
              className="text-xs text-rose-400/80 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge Tome from Sanctum</span>
            </button>
          </div>
        </div>

        {/* RIGHT PAGE: Personal Reading Record & Chronicle (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 bg-[#191124]/95 space-y-8">
          {/* Status & Rating Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-[#C5A56A]/20">
            <div>
              <label className="block text-xs font-serif-magical text-[#C5A56A] uppercase tracking-wider mb-2">
                Reading Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-xl px-3.5 py-2.5 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
              >
                <option value="WANT_TO_READ">Want to Read</option>
                <option value="CURRENTLY_READING">Currently Reading</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="DID_NOT_FINISH">Did Not Finish</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif-magical text-[#C5A56A] uppercase tracking-wider mb-2">
                Personal Rating
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(rating === s ? null : s)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        rating && s <= rating
                          ? "text-[#C5A56A] fill-[#C5A56A]"
                          : "text-zinc-700 hover:text-[#C5A56A]"
                      }`}
                    />
                  </button>
                ))}
                {rating ? (
                  <span className="text-xs text-[#C5A56A] font-bold ml-2">
                    {rating} / 5 Stars
                  </span>
                ) : (
                  <span className="text-xs text-[#8E8495] ml-2">Unrated</span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-serif-magical text-[#C5A56A] uppercase tracking-wider">
                Reading Progress
              </span>
              <span className="text-[#B7ADBD]">
                {book.pageCount
                  ? `${currentPage} of ${book.pageCount} pages (${progressPercent}%)`
                  : `Page ${currentPage}`}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max={book.pageCount || 9999}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value, 10) || 0)}
                className="w-28 bg-[#100D18] border border-[#C5A56A]/30 rounded-xl px-3 py-2 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
              />
              {book.pageCount && (
                <div className="flex-1 bg-[#100D18] h-3 rounded-full overflow-hidden border border-[#C5A56A]/20">
                  <div
                    className="h-full bg-gradient-to-r from-[#C5A56A] to-[#F3D9A0] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Personal Review */}
          <div>
            <label className="block text-xs font-serif-magical text-[#C5A56A] uppercase tracking-wider mb-2">
              Personal Review & Literary Reflections
            </label>
            <textarea
              rows={3}
              value={personalReview}
              onChange={(e) => setPersonalReview(e.target.value)}
              placeholder="What lingering thoughts or feelings did this volume leave upon your spirit?"
              className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-xl p-3 text-xs sm:text-sm text-[#E9DCC1] placeholder-[#8E8495] focus:outline-none focus:border-[#C5A56A] resize-none"
            />
          </div>

          {/* Favorite Character & Private Memories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif-magical text-[#C5A56A] uppercase tracking-wider mb-2">
                Memorable Character
              </label>
              <input
                type="text"
                value={favoriteCharacter}
                onChange={(e) => setFavoriteCharacter(e.target.value)}
                placeholder="e.g. Kvothe, Victor Frankenstein..."
                className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
              />
            </div>
            <div>
              <label className="block text-xs font-serif-magical text-[#C5A56A] uppercase tracking-wider mb-2">
                Reading Memories
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Where were you? What season?"
                className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
              />
            </div>
          </div>

          {/* EXCERPTED QUOTES SECTION */}
          <div className="pt-4 border-t border-[#C5A56A]/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-magical text-sm font-bold text-[#E9DCC1] flex items-center gap-2">
                <QuoteIcon className="w-4 h-4 text-[#C5A56A]" />
                <span>Excerpted Quotes ({book.quotes?.length || 0})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowQuoteForm(!showQuoteForm)}
                className="text-xs text-[#C5A56A] hover:text-[#F3D9A0] flex items-center gap-1 font-serif-magical"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Quote</span>
              </button>
            </div>

            {showQuoteForm && (
              <form onSubmit={handleAddQuote} className="p-4 rounded-xl bg-[#100D18] border border-[#C5A56A]/30 space-y-3">
                <textarea
                  rows={2}
                  required
                  placeholder="Inscribe a quote from this tome..."
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  className="w-full bg-[#160F22] border border-[#C5A56A]/20 rounded-lg p-2.5 text-xs text-[#E9DCC1] focus:outline-none"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Page #"
                    value={quotePage}
                    onChange={(e) => setQuotePage(e.target.value)}
                    className="w-24 bg-[#160F22] border border-[#C5A56A]/20 rounded-lg px-2.5 py-1.5 text-xs text-[#E9DCC1]"
                  />
                  <input
                    type="text"
                    placeholder="Personal note (optional)"
                    value={quoteNote}
                    onChange={(e) => setQuoteNote(e.target.value)}
                    className="flex-1 bg-[#160F22] border border-[#C5A56A]/20 rounded-lg px-2.5 py-1.5 text-xs text-[#E9DCC1]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#C5A56A] text-[#100D18] font-bold text-xs rounded-lg hover:bg-[#F3D9A0]"
                  >
                    Save Quote
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {book.quotes && book.quotes.length > 0 ? (
                book.quotes.map((q: any) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-[#100D18]/80 border border-[#C5A56A]/15 text-xs text-[#E9DCC1] flex justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <p className="italic font-serif-magical text-sm text-[#F3D9A0] leading-relaxed">
                        &ldquo;{q.text}&rdquo;
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-[#8E8495]">
                        {q.pageNumber && <span>Page {q.pageNumber}</span>}
                        {q.personalNote && <span>• {q.personalNote}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteQuote(q.id)}
                      className="text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity self-start"
                      title="Delete quote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8E8495] italic font-serif-magical">
                  No quotes have been excerpted from this volume yet.
                </p>
              )}
            </div>
          </div>

          {/* READING SESSIONS SECTION */}
          <div className="pt-4 border-t border-[#C5A56A]/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-magical text-sm font-bold text-[#E9DCC1] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5A56A]" />
                <span>Reading Sessions ({book.readingSessions?.length || 0})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSessionForm(!showSessionForm)}
                className="text-xs text-[#C5A56A] hover:text-[#F3D9A0] flex items-center gap-1 font-serif-magical"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Session</span>
              </button>
            </div>

            {showSessionForm && (
              <form onSubmit={handleAddSession} className="p-4 rounded-xl bg-[#100D18] border border-[#C5A56A]/30 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#8E8495] mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={sessionMinutes}
                      onChange={(e) => setSessionMinutes(e.target.value)}
                      className="w-full bg-[#160F22] border border-[#C5A56A]/20 rounded-lg px-2.5 py-1.5 text-xs text-[#E9DCC1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8E8495] mb-1">Pages Read</label>
                    <input
                      type="number"
                      value={sessionPages}
                      onChange={(e) => setSessionPages(e.target.value)}
                      className="w-full bg-[#160F22] border border-[#C5A56A]/20 rounded-lg px-2.5 py-1.5 text-xs text-[#E9DCC1]"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Notes about this session..."
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                  className="w-full bg-[#160F22] border border-[#C5A56A]/20 rounded-lg px-2.5 py-1.5 text-xs text-[#E9DCC1]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSessionForm(false)}
                    className="text-xs text-[#8E8495] hover:text-[#E9DCC1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#C5A56A] text-[#100D18] font-bold text-xs rounded-lg hover:bg-[#F3D9A0]"
                  >
                    Record Session
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {book.readingSessions && book.readingSessions.length > 0 ? (
                book.readingSessions.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl bg-[#100D18]/70 border border-[#C5A56A]/15 text-xs text-[#E9DCC1] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-[#F3D9A0]">
                        {new Date(s.startedAt).toLocaleDateString()}
                      </span>
                      {s.pagesRead && <span className="ml-2">• {s.pagesRead} pages read</span>}
                      {s.durationMinutes && (
                        <span className="ml-2">• {s.durationMinutes} minutes</span>
                      )}
                      {s.note && <p className="text-[11px] text-[#8E8495] mt-0.5">{s.note}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8E8495] italic font-serif-magical">
                  No reading sessions logged yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
