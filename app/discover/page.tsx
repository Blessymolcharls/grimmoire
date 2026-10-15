"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Sparkles,
  Plus,
  AlertCircle,
} from "lucide-react";
import { AddBookModal } from "@/components/forms/AddBookModal";
import { NormalizedBookMetadata } from "@/lib/books/normalize";

const CURATED_SUGGESTIONS: NormalizedBookMetadata[] = [
  {
    title: "The Hobbit",
    normalizedTitle: "the hobbit",
    authors: ["J.R.R. Tolkien"],
    description: "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, but a hobbit-hole, and that means comfort.",
    coverUrl: "https://covers.openlibrary.org/b/id/12818862-L.jpg",
    publicationYear: 1937,
    publisher: "George Allen & Unwin",
    pageCount: 310,
    externalProvider: "openlibrary",
    externalProviderId: "OL27479W",
  },
  {
    title: "Dune",
    normalizedTitle: "dune",
    authors: ["Frank Herbert"],
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange.",
    coverUrl: "https://covers.openlibrary.org/b/id/11153218-L.jpg",
    publicationYear: 1965,
    publisher: "Chilton Books",
    pageCount: 658,
    externalProvider: "openlibrary",
    externalProviderId: "OL893415W",
  },
  {
    title: "Piranesi",
    normalizedTitle: "piranesi",
    authors: ["Susanna Clarke"],
    description: "Piranesi lives in the House. Perhaps he always has. In his notebooks, day after day, he makes a clear and careful record of its wonders: the labyrinth of halls, the thousands upon thousands of statues.",
    coverUrl: "https://covers.openlibrary.org/b/id/10398687-L.jpg",
    publicationYear: 2020,
    publisher: "Bloomsbury",
    pageCount: 245,
    externalProvider: "openlibrary",
    externalProviderId: "OL20857945W",
  },
  {
    title: "The Ocean at the End of the Lane",
    normalizedTitle: "the ocean at the end of the lane",
    authors: ["Neil Gaiman"],
    description: "A middle-aged man returns to his childhood home to attend a funeral. Although the house he lived in is long gone, he is drawn to the farm at the end of the road, where, forty years earlier, he met a remarkable girl.",
    coverUrl: "https://covers.openlibrary.org/b/id/7289578-L.jpg",
    publicationYear: 2013,
    publisher: "William Morrow",
    pageCount: 181,
    externalProvider: "openlibrary",
    externalProviderId: "OL16805096W",
  },
  {
    title: "Jonathan Strange & Mr Norrell",
    normalizedTitle: "jonathan strange and mr norrell",
    authors: ["Susanna Clarke"],
    description: "English magicians were once the wonder of the world. Two men, the reclusive Mr Norrell and the dashing Jonathan Strange, return magic to England in 1806 during the Napoleonic wars.",
    coverUrl: "https://covers.openlibrary.org/b/id/8315808-L.jpg",
    publicationYear: 2004,
    publisher: "Bloomsbury",
    pageCount: 782,
    externalProvider: "openlibrary",
    externalProviderId: "OL262451W",
  },
  {
    title: "Cosmos",
    normalizedTitle: "cosmos",
    authors: ["Carl Sagan"],
    description: "The story of fifteen billion years of cosmic evolution transforming matter and life into consciousness, of how science and civilization grew up together.",
    coverUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    publicationYear: 1980,
    publisher: "Random House",
    pageCount: 365,
    externalProvider: "openlibrary",
    externalProviderId: "OL2163473W",
  },
];

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<NormalizedBookMetadata[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Add Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBookToAdd, setSelectedBookToAdd] = useState<NormalizedBookMetadata | null>(null);
  const [inscribedMessage, setInscribedMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments || []))
      .catch((err) => console.error("Error loading departments:", err));

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `/api/books/search?q=${encodeURIComponent(query.trim())}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      if (res.ok) {
        setResults(data.results || []);
        if ((data.results || []).length === 0) {
          setSearchError("No ancient volumes matched this query in the global registry.");
        }
      } else {
        setSearchError(data.error || "Search ritual failed.");
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setSearchError("Failed to reach external archives. You may scribe this book manually.");
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setSearching(false);
      }
    }
  };

  const handleOpenAddModal = (book?: NormalizedBookMetadata) => {
    setSelectedBookToAdd(book || null);
    setModalOpen(true);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-10 space-y-10 max-w-7xl mx-auto w-full">
      {/* Success Notification Banner */}
      {inscribedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-200 text-sm flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{inscribedMessage}</span>
          </div>
          <Link
            href="/library"
            className="px-3 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 text-xs font-semibold underline"
          >
            Go to My Shelves →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C5A56A]/20">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-serif-magical uppercase tracking-widest text-[#C5A56A] mb-1">
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
            <span>Realm of External Tomes</span>
          </div>
          <h1 className="font-serif-magical text-2xl sm:text-4xl font-extrabold text-[#E9DCC1] tracking-wide">
            Discover & Scribe Tomes
          </h1>
          <p className="text-xs sm:text-sm text-[#B7ADBD] mt-1">
            Search millions of published books across human history and bring them into your
            personal castle library.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs sm:text-sm shadow-md hover:from-[#DFCA9B] hover:to-[#C5A56A] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Search Bar Banner */}
      <div className="parchment-card rounded-2xl p-6 sm:p-8 shadow-xl border border-[#C5A56A]/30">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="block text-xs font-serif-magical text-[#C5A56A] uppercase tracking-wider">
            Search by Title, Author, or ISBN
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C5A56A]/70" />
              <input
                type="text"
                placeholder="e.g. Neil Gaiman, The Hobbit, Mary Shelley, 9780143034902..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-xl pl-12 pr-4 py-3 text-sm text-[#E9DCC1] placeholder-[#8E8495] focus:outline-none focus:border-[#C5A56A]"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-sm shadow hover:from-[#DFCA9B] hover:to-[#C5A56A] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {searching ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#100D18] border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Seek Tomes</span>
                </>
              )}
            </button>
          </div>
        </form>

        {searchError && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-950/70 border border-amber-600/40 text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{searchError}</span>
            </div>
            <button
              onClick={() => handleOpenAddModal()}
              className="text-xs text-[#F3D9A0] underline hover:text-white"
            >
              Scribe Manually
            </button>
          </div>
        )}
      </div>

      {/* SEARCH RESULTS SECTION */}
      {results.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-magical text-xl font-bold text-[#E9DCC1] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A56A]" />
              <span>Matching Volumes ({results.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((book, idx) => (
              <div
                key={idx}
                className="parchment-card rounded-2xl p-5 border border-[#C5A56A]/20 flex flex-col justify-between hover:border-[#C5A56A]/50 transition-all h-full"
              >
                <div>
                  <div className="flex gap-4">
                    <div className="relative w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 rounded-md overflow-hidden bg-[#171120] border border-[#C5A56A]/30 shadow-md">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center -z-10 bg-gradient-to-b from-[#2A1B16] to-[#100D18]">
                        <Sparkles className="w-4 h-4 text-[#C5A56A]/60 mb-1" />
                        <p className="text-[9px] font-serif-magical text-[#E9DCC1] line-clamp-2 leading-tight">
                          {book.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-serif-magical text-[#E9DCC1] font-bold text-base line-clamp-2 leading-snug break-words"
                        title={book.title}
                      >
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#C5A56A] mt-1 truncate font-medium">
                        {book.authors.join(", ")}
                      </p>
                      <div className="text-[11px] text-[#8E8495] mt-1 space-y-0.5">
                        {book.publicationYear && <p>Anno {book.publicationYear}</p>}
                        {book.pageCount && <p>{book.pageCount} pages</p>}
                      </div>
                    </div>
                  </div>

                  {book.description ? (
                    <p className="text-xs text-[#B7ADBD] mt-3 line-clamp-3 italic leading-relaxed">
                      &ldquo;{book.description}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs text-[#8E8495]/60 mt-3 italic">
                      Awaiting scholarly annotation.
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-[#C5A56A]/15 flex items-center justify-between">
                  <span className="text-[10px] text-[#8E8495] uppercase tracking-wider">
                    Global Registry
                  </span>
                  <button
                    onClick={() => handleOpenAddModal(book)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs shadow hover:from-[#DFCA9B] hover:to-[#C5A56A] transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inscribe into Library</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CURATED STARTER SUGGESTIONS */}
      <section className="space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#C5A56A] font-serif-magical uppercase tracking-wider mb-1">
            <span>Curated Starter Suggestions</span>
          </div>
          <h2 className="font-serif-magical text-xl sm:text-2xl font-bold text-[#E9DCC1]">
            Celebrated Volumes of the Realms
          </h2>
          <p className="text-xs text-[#8E8495]">
            Hand-selected masterpieces across fantasy, philosophy, science, and the dark arts to inspire your collection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CURATED_SUGGESTIONS.map((book, idx) => (
            <div
              key={idx}
              className="parchment-card rounded-2xl p-5 border border-[#C5A56A]/20 flex flex-col justify-between hover:border-[#C5A56A]/60 transition-all group h-full"
            >
              <div>
                <div className="flex gap-4">
                  <div className="relative w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 rounded-md overflow-hidden bg-[#171120] border border-[#C5A56A]/30 shadow-md group-hover:border-[#C5A56A]/60 transition-colors">
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center -z-10 bg-gradient-to-b from-[#2A1B16] to-[#100D18]">
                      <Sparkles className="w-4 h-4 text-[#C5A56A]/60 mb-1" />
                      <p className="text-[9px] font-serif-magical text-[#E9DCC1] line-clamp-2 leading-tight">
                        {book.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-serif-magical text-[#E9DCC1] font-bold text-base line-clamp-2 leading-snug break-words group-hover:text-[#F3D9A0] transition-colors"
                      title={book.title}
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#C5A56A] mt-1 truncate font-medium">
                      {book.authors.join(", ")}
                    </p>
                    <div className="text-[11px] text-[#8E8495] mt-1 flex items-center gap-1.5">
                      <span>Anno {book.publicationYear}</span>
                      <span>•</span>
                      <span>{book.pageCount} pages</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#B7ADBD] mt-3 line-clamp-3 italic leading-relaxed">
                  &ldquo;{book.description}&rdquo;
                </p>
              </div>

              <div className="mt-auto pt-3 border-t border-[#C5A56A]/15 flex items-center justify-between">
                <span className="text-[10px] text-[#8E8495] uppercase tracking-wider">
                  Curated Suggestion
                </span>
                <button
                  onClick={() => handleOpenAddModal(book)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#21162E] hover:bg-[#C5A56A] text-[#F3D9A0] hover:text-[#100D18] border border-[#C5A56A]/40 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Shelves</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBookToAdd(null);
        }}
        departments={departments}
        initialBook={selectedBookToAdd}
        onBookAdded={() => {
          setInscribedMessage("✦ Tome successfully inscribed into your library shelves!");
          setTimeout(() => setInscribedMessage(null), 5000);
        }}
      />
    </div>
  );
}
