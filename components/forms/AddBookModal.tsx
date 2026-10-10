"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Sparkles,
  Star,
  Plus,
  AlertCircle,
  Bookmark,
  RotateCcw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { NormalizedBookMetadata } from "@/lib/books/normalize";

interface Department {
  id: string;
  name: string;
  slug: string;
  accentColor?: string | null;
}

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded?: () => void;
  departments: Department[];
  initialBook?: NormalizedBookMetadata | null;
}

export function AddBookModal({
  isOpen,
  onClose,
  onBookAdded,
  departments,
  initialBook,
}: AddBookModalProps) {
  // Mode: "search" | "edit_metadata" | "personal_info" | "manual"
  const [step, setStep] = useState<"search" | "customize">("search");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NormalizedBookMetadata[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [publicationYear, setPublicationYear] = useState<string>("");
  const [publisher, setPublisher] = useState("");
  const [isbn10, setIsbn10] = useState("");
  const [isbn13, setIsbn13] = useState("");
  const [pageCount, setPageCount] = useState<string>("");
  const [externalProvider, setExternalProvider] = useState<string>("manual");
  const [externalProviderId, setExternalProviderId] = useState<string>("");

  // Personal Fields
  const [readingStatus, setReadingStatus] = useState("WANT_TO_READ");
  const [rating, setRating] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>("0");
  const [personalReview, setPersonalReview] = useState("");
  const [favoriteCharacter, setFavoriteCharacter] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);
  const [spineColor, setSpineColor] = useState("#7B1FA2");

  // Duplicate Warning
  const [duplicateWarning, setDuplicateWarning] = useState<{
    message: string;
    existingBookId: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `/api/books/search?q=${encodeURIComponent(searchQuery.trim())}`
        );
        const data = await res.json();
        if (res.ok) {
          setSearchResults(data.results || []);
          if ((data.results || []).length === 0) {
            setSearchError("No ancient tomes answered this query. You may scribe it manually below.");
          }
        } else {
          setSearchError(data.error || "Search spell faltered.");
        }
      } catch {
        setSearchError("Network spell interrupted. Scribe manually below.");
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (book: NormalizedBookMetadata) => {
    setTitle(book.title);
    setAuthors(book.authors.join(", "));
    setDescription(book.description || "");
    setCoverUrl(book.coverUrl || "");
    setPublicationYear(book.publicationYear ? String(book.publicationYear) : "");
    setPublisher(book.publisher || "");
    setIsbn10(book.isbn10 || "");
    setIsbn13(book.isbn13 || "");
    setPageCount(book.pageCount ? String(book.pageCount) : "");
    setExternalProvider(book.externalProvider);
    setExternalProviderId(book.externalProviderId || "");
    setDuplicateWarning(null);
    setStep("customize");
  };

  useEffect(() => {
    if (initialBook) {
      handleSelectSearchResult(initialBook);
    }
  }, [initialBook]);

  const handleManualEntry = () => {
    setTitle(searchQuery.trim() || "");
    setAuthors("");
    setDescription("");
    setCoverUrl("");
    setPublicationYear("");
    setPublisher("");
    setIsbn10("");
    setIsbn13("");
    setPageCount("");
    setExternalProvider("manual");
    setExternalProviderId("");
    setDuplicateWarning(null);
    setStep("customize");
  };

  const toggleDepartment = (deptId: string) => {
    setSelectedDeptIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  const handleSaveBook = async (forceDuplicate = false) => {
    if (!title.trim()) {
      setSaveError("Tome Title is required.");
      return;
    }
    const authorsList = authors
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (authorsList.length === 0) {
      authorsList.push("Unknown Author");
    }

    setSaving(true);
    setSaveError(null);

    try {
      const payload = {
        title: title.trim(),
        authors: authorsList,
        description: description.trim() || null,
        coverUrl: coverUrl.trim() || null,
        publicationYear: publicationYear ? parseInt(publicationYear, 10) : null,
        publisher: publisher.trim() || null,
        isbn10: isbn10.trim() || null,
        isbn13: isbn13.trim() || null,
        pageCount: pageCount ? parseInt(pageCount, 10) : null,
        externalProvider,
        externalProviderId: externalProviderId || null,
        readingStatus,
        rating,
        isFavorite,
        currentPage: currentPage ? parseInt(currentPage, 10) : 0,
        personalReview: personalReview.trim() || null,
        favoriteCharacter: favoriteCharacter.trim() || null,
        notes: notes.trim() || null,
        departmentIds: selectedDeptIds,
        spineColor,
        forceDuplicate,
      };

      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409 && data.duplicate) {
        setDuplicateWarning({
          message: data.message,
          existingBookId: data.existingBookId,
        });
        setSaving(false);
        return;
      }

      if (!res.ok) {
        setSaveError(data.error || "Failed to scribe book into archives.");
        setSaving(false);
        return;
      }

      // Magical celebration sparkles!
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#C5A56A", "#F3D9A0", "#9370DB", "#E9DCC1"],
        });
      } catch {}

      onBookAdded?.();
      onClose();
      // Reset state
      setStep("search");
      setSearchQuery("");
      setDuplicateWarning(null);
    } catch (err) {
      console.error("Save error:", err);
      setSaveError("An unexpected magical surge prevented saving.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#140E1D] border-2 border-[#C5A56A]/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(197,165,106,0.15)] overflow-hidden text-[#E9DCC1]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#C5A56A]/20 bg-[#1C1328]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A56A] animate-pulse" />
              <span className="font-serif-magical text-base font-semibold tracking-wide text-[#F3D9A0]">
                {step === "search"
                  ? "Scribe a New Tome • Discovery Ritual"
                  : "Illuminating the Codex • Reading Record"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#B7ADBD] hover:text-[#E9DCC1] hover:bg-[#21162E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 1: SEARCH & DISCOVERY */}
          {step === "search" ? (
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-xs font-serif-magical text-[#C5A56A] mb-2 uppercase tracking-wider">
                  Invoke Title, Author, or ISBN
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A56A]" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Patrick Rothfuss, The Name of the Wind, or 9780756404741..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#100D18] border border-[#C5A56A]/35 rounded-xl pl-10 pr-4 py-3 text-sm text-[#E9DCC1] placeholder-[#8E8495] focus:outline-none focus:border-[#C5A56A]"
                  />
                  {searching && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#C5A56A] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>

              {/* Search Results Display */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-serif-magical text-[#F3D9A0] uppercase tracking-wider">
                    Discovered Volumes ({searchResults.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1">
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSearchResult(result)}
                        className="p-3 rounded-xl bg-[#21162E]/70 border border-[#C5A56A]/20 hover:border-[#C5A56A]/60 hover:bg-[#2A1B16]/80 cursor-pointer transition-all flex gap-3 group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-[#100D18] flex-shrink-0 border border-[#C5A56A]/20">
                          {result.coverUrl ? (
                            <img
                              src={result.coverUrl}
                              alt={result.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8E8495] font-serif-magical">
                              ✦
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-serif-magical text-sm font-semibold text-[#E9DCC1] group-hover:text-[#F3D9A0] line-clamp-1">
                            {result.title}
                          </h5>
                          <p className="text-xs text-[#B7ADBD] truncate mt-0.5">
                            {result.authors.join(", ")}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8E8495]">
                            {result.publicationYear && (
                              <span>Anno {result.publicationYear}</span>
                            )}
                            {result.pageCount && <span>{result.pageCount} pgs</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchError && (
                <div className="p-4 rounded-xl bg-[#2A1B16]/60 border border-amber-600/30 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-[#E9DCC1]">
                    <p>{searchError}</p>
                  </div>
                </div>
              )}

              {/* Manual Entry Fallback Banner */}
              <div className="pt-4 border-t border-[#C5A56A]/20 flex items-center justify-between">
                <span className="text-xs text-[#8E8495]">
                  Cannot find your volume in the external catalogs?
                </span>
                <button
                  type="button"
                  onClick={handleManualEntry}
                  className="px-4 py-2 rounded-xl bg-[#21162E] hover:bg-[#39251F] text-[#F3D9A0] border border-[#C5A56A]/40 text-xs font-serif-magical flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Scribe Tome Manually</span>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: CUSTOMIZE & COMPLETE RECORD */
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Duplicate Warning Prompt */}
              {duplicateWarning && (
                <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                    <span>{duplicateWarning.message}</span>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleSaveBook(true)}
                      className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-[#100D18] font-bold"
                    >
                      Collect Separate Edition
                    </button>
                  </div>
                </div>
              )}

              {saveError && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200">
                  {saveError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Book Identity Metadata */}
                <div className="space-y-4">
                  <h4 className="font-serif-magical text-xs uppercase tracking-wider text-[#C5A56A]">
                    Tome Identity & Metadata
                  </h4>

                  <div>
                    <label className="block text-xs text-[#E9DCC1] mb-1">
                      Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg px-3 py-2 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#E9DCC1] mb-1">
                      Authors (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={authors}
                      onChange={(e) => setAuthors(e.target.value)}
                      className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg px-3 py-2 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#E9DCC1] mb-1">
                        Publication Year
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 2007"
                        value={publicationYear}
                        onChange={(e) => setPublicationYear(e.target.value)}
                        className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg px-3 py-2 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#E9DCC1] mb-1">
                        Page Count
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 662"
                        value={pageCount}
                        onChange={(e) => setPageCount(e.target.value)}
                        className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg px-3 py-2 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#E9DCC1] mb-1">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg px-3 py-2 text-xs text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#E9DCC1] mb-1">
                      Spine Color on Bookshelf
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        "#7B1FA2",
                        "#B71C1C",
                        "#0D47A1",
                        "#1B5E20",
                        "#D97706",
                        "#004D40",
                        "#39251F",
                        "#4A148C",
                      ].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSpineColor(col)}
                          style={{ backgroundColor: col }}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            spineColor === col
                              ? "border-[#F3D9A0] scale-125"
                              : "border-transparent hover:scale-110"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#E9DCC1] mb-1">
                      Synopsis / Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg p-2 text-xs text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A] resize-none"
                    />
                  </div>
                </div>

                {/* Column 2: Personal Reading Record */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif-magical text-xs uppercase tracking-wider text-[#F3D9A0]">
                      Personal Sanctum Record
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`p-1 rounded text-xs flex items-center gap-1 transition-colors ${
                        isFavorite ? "text-[#C5A56A]" : "text-[#8E8495] hover:text-[#C5A56A]"
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? "fill-[#C5A56A]" : ""}`} />
                      <span>{isFavorite ? "Favorited" : "Favorite"}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-[#E9DCC1] mb-1">
                      Reading Status
                    </label>
                    <select
                      value={readingStatus}
                      onChange={(e) => setReadingStatus(e.target.value)}
                      className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg px-3 py-2 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                    >
                      <option value="WANT_TO_READ">Want to Read</option>
                      <option value="CURRENTLY_READING">Currently Reading</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="DID_NOT_FINISH">Did Not Finish</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#E9DCC1] mb-1">
                        Personal Rating
                      </label>
                      <div className="flex items-center gap-1 py-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(rating === s ? null : s)}
                            className="p-1"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                rating && s <= rating
                                  ? "text-[#C5A56A] fill-[#C5A56A]"
                                  : "text-zinc-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-[#E9DCC1] mb-1">
                        Current Page
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(e.target.value)}
                        className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg px-3 py-1.5 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                      />
                    </div>
                  </div>

                  {/* Assign Departments */}
                  <div>
                    <label className="block text-xs text-[#E9DCC1] mb-1.5">
                      Magical Departments
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {departments.map((dept) => {
                        const selected = selectedDeptIds.includes(dept.id);
                        return (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => toggleDepartment(dept.id)}
                            className={`px-2.5 py-1 rounded-full text-xs font-serif-magical transition-all ${
                              selected
                                ? "bg-[#C5A56A] text-[#100D18] font-bold shadow-sm"
                                : "bg-[#100D18] text-[#B7ADBD] border border-[#C5A56A]/20 hover:border-[#C5A56A]/50"
                            }`}
                          >
                            {dept.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#E9DCC1] mb-1">
                      Favorite Character
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kvothe, Victor, Daniel Sempere..."
                      value={favoriteCharacter}
                      onChange={(e) => setFavoriteCharacter(e.target.value)}
                      className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg px-3 py-2 text-xs text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#E9DCC1] mb-1">
                      Personal Thoughts & Review
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Impressions, soul impacts, reflections..."
                      value={personalReview}
                      onChange={(e) => setPersonalReview(e.target.value)}
                      className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg p-2 text-xs text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#E9DCC1] mb-1">
                      Private Reading Memories & Lore
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Where you were, atmospheric memories..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-lg p-2 text-xs text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#C5A56A]/20 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("search")}
                  className="text-xs text-[#8E8495] hover:text-[#E9DCC1] flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Back to Discovery</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveBook(false)}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-sm shadow-lg hover:from-[#DFCA9B] hover:to-[#C5A56A] disabled:opacity-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {saving ? "Inscribing Tome..." : "✦ Seal Tome into Library"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
