"use client";

import React, { useState, useMemo } from "react";
import { BookSpine } from "@/components/books/BookSpine";
import { BookCard } from "@/components/books/BookCard";
import { BookOpeningModal } from "@/components/books/BookOpeningModal";
import {
  Library,
  LayoutGrid,
  Search,
  BookOpen,
  PlusCircle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface DepartmentData {
  id: string;
  name: string;
  slug: string;
  accentColor?: string | null;
}

interface BookshelfProps {
  initialBooks: any[];
  departments: DepartmentData[];
  onRefresh?: () => void;
}

export function Bookshelf({ initialBooks, departments, onRefresh }: BookshelfProps) {
  const [books, setBooks] = useState<any[]>(initialBooks);
  const [viewMode, setViewMode] = useState<"shelf" | "grid">("shelf");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recently_added");

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = b.title.toLowerCase().includes(query);
        const matchesAuthors = Array.isArray(b.authors)
          ? b.authors.some((a: string) => a.toLowerCase().includes(query))
          : String(b.authors).toLowerCase().includes(query);
        if (!matchesTitle && !matchesAuthors) return false;
      }

      // Department
      if (selectedDepartment !== "all") {
        const hasDept = b.departments?.some(
          (d: any) => d.slug === selectedDepartment || d.id === selectedDepartment
        );
        if (!hasDept) return false;
      }

      // Status
      if (selectedStatus !== "all" && b.readingStatus !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "rating_desc":
          return (b.rating || 0) - (a.rating || 0);
        case "pages_desc":
          return (b.pageCount || 0) - (a.pageCount || 0);
        case "recently_completed":
          return (
            new Date(b.dateCompleted || 0).getTime() -
            new Date(a.dateCompleted || 0).getTime()
          );
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });
  }, [books, searchQuery, selectedDepartment, selectedStatus, sortBy]);

  // Group books into shelves of 7-9 books per shelf row
  const BOOKS_PER_SHELF = 8;
  const shelves = useMemo(() => {
    const rows: any[][] = [];
    for (let i = 0; i < filteredBooks.length; i += BOOKS_PER_SHELF) {
      rows.push(filteredBooks.slice(i, i + BOOKS_PER_SHELF));
    }
    // If empty or fewer than 1 shelf, always render at least 1 shelf row
    if (rows.length === 0) {
      rows.push([]);
    }
    return rows;
  }, [filteredBooks]);

  const handleRefreshData = async () => {
    try {
      const res = await fetch("/api/books?limit=100");
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("all");
    setSelectedStatus("all");
    setSortBy("recently_added");
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search, Filters, View Mode */}
      <div className="parchment-card rounded-2xl p-4 sm:p-5 shadow-xl border border-[#C5A56A]/25">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A56A]/70" />
            <input
              type="text"
              placeholder="Search by title, author, or secret lore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search library tomes by title or author"
              className="w-full bg-[#100D18]/90 border border-[#C5A56A]/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#E9DCC1] placeholder-[#8E8495] focus:outline-none focus:border-[#C5A56A] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search input"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8E8495] hover:text-[#E9DCC1]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Selectors */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Department */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              aria-label="Filter by magical department"
              className="bg-[#100D18] border border-[#C5A56A]/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.slug}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Reading Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by reading status"
              className="bg-[#100D18] border border-[#C5A56A]/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
            >
              <option value="all">All Statuses</option>
              <option value="CURRENTLY_READING">Currently Reading</option>
              <option value="COMPLETED">Completed</option>
              <option value="WANT_TO_READ">Want to Read</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="DID_NOT_FINISH">Did Not Finish</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort books order"
              className="bg-[#100D18] border border-[#C5A56A]/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
            >
              <option value="recently_added">Recently Added</option>
              <option value="title_asc">Title A–Z</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="pages_desc">Thickest Tomes</option>
              <option value="recently_completed">Recently Completed</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#100D18] rounded-xl p-1 border border-[#C5A56A]/30">
              <button
                onClick={() => setViewMode("shelf")}
                className={`p-2 rounded-lg text-xs font-serif-magical flex items-center gap-1.5 transition-colors ${
                  viewMode === "shelf"
                    ? "bg-[#21162E] text-[#F3D9A0] shadow-sm border border-[#C5A56A]/40"
                    : "text-[#B7ADBD] hover:text-[#E9DCC1]"
                }`}
                title="Grand Bookshelf View"
              >
                <Library className="w-4 h-4 text-[#C5A56A]" />
                <span className="hidden sm:inline">Shelves</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg text-xs font-serif-magical flex items-center gap-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#21162E] text-[#F3D9A0] shadow-sm border border-[#C5A56A]/40"
                    : "text-[#B7ADBD] hover:text-[#E9DCC1]"
                }`}
                title="Archive Grid View"
              >
                <LayoutGrid className="w-4 h-4 text-[#C5A56A]" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Summary & Active Counts */}
        <div className="mt-3 pt-3 border-t border-[#C5A56A]/15 flex items-center justify-between text-xs text-[#B7ADBD]">
          <div className="flex items-center gap-2">
            <span>
              Preserving <strong className="text-[#F3D9A0]">{filteredBooks.length}</strong> of{" "}
              {books.length} tomes
            </span>
            {(searchQuery || selectedDepartment !== "all" || selectedStatus !== "all") && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[#C5A56A] hover:underline ml-2"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>

          <Link
            href="/discover"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#C5A56A] hover:text-[#F3D9A0] font-serif-magical"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add a Tome to this Shelf</span>
          </Link>
        </div>
      </div>

      {/* Main Display: 2D Bookshelf vs Grid View */}
      {filteredBooks.length === 0 ? (
        <div className="parchment-card rounded-2xl p-12 text-center border-2 border-dashed border-[#C5A56A]/30">
          <BookOpen className="w-12 h-12 text-[#C5A56A]/60 mx-auto mb-3" />
          <h3 className="font-serif-magical text-xl font-bold text-[#E9DCC1] mb-2">
            The Shelf Stands Empty
          </h3>
          <p className="text-sm text-[#B7ADBD] max-w-md mx-auto mb-6">
            No enchanted tomes match your current searching incantations. Scribe a new volume into
            your archive or clear active filters.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-[#21162E] text-[#E9DCC1] border border-[#C5A56A]/30 text-xs font-medium hover:bg-[#39251F]"
            >
              Reset Filters
            </button>
            <Link
              href="/discover"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs shadow hover:from-[#DFCA9B] hover:to-[#C5A56A]"
            >
              Discover & Add Tomes
            </Link>
          </div>
        </div>
      ) : viewMode === "shelf" ? (
        /* 2D REALISTIC BOOKSHELF VIEW */
        <div className="relative rounded-2xl border-4 border-[#39251F] bg-[#120C19] shadow-2xl overflow-hidden">
          {/* Gothic Castle Library Top Trim / Crown Molding */}
          <div className="h-10 bg-gradient-to-b from-[#2A1B16] via-[#39251F] to-[#20130F] border-b-2 border-[#C5A56A]/40 flex items-center justify-between px-6 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#C5A56A] font-serif-magical font-bold tracking-widest uppercase">
                ✦ Sanctum Bibliotheca • Section VII ✦
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#C5A56A]/80 font-serif-magical">
              <span>Mahogany Carrel</span>
            </div>
          </div>

          {/* Library Shelves Stack */}
          <div className="p-4 sm:p-8 space-y-10 shelf-backwall">
            {shelves.map((shelfBooks, shelfIndex) => (
              <div key={shelfIndex} className="relative pt-6">
                {/* Books in this Shelf Row */}
                <div className="min-h-[260px] flex items-end gap-1.5 sm:gap-2.5 px-3 sm:px-6 overflow-x-auto pb-0 no-scrollbar">
                  {shelfBooks.map((book, bookIdx) => (
                    <BookSpine
                      key={book.id}
                      book={book}
                      onSelect={(id) => setSelectedBookId(id)}
                      index={bookIdx}
                    />
                  ))}
                  {shelfBooks.length === 0 && (
                    <div className="h-40 flex items-center justify-center w-full text-xs text-[#8E8495] italic font-serif-magical">
                      This shelf awaits its destined tomes...
                    </div>
                  )}
                </div>

                {/* Physical Wooden Shelf Base with Depth & Shadow */}
                <div className="shelf-wood h-7 sm:h-9 w-full rounded-sm relative z-10 border-t border-[#C5A56A]/30">
                  {/* Brass Plate in Center */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-1.5 px-4 py-0.5 rounded-sm bg-gradient-to-r from-[#A88846] via-[#C5A56A] to-[#A88846] border border-[#523B17] shadow-inner text-[9px] font-serif-magical font-bold text-[#2A1B16] uppercase tracking-wider select-none">
                    Tier {shelfIndex + 1}
                  </div>
                </div>

                {/* Under-shelf Ambient Shadow */}
                <div className="h-4 shelf-shadow w-full opacity-70 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Bookshelf Bottom Base */}
          <div className="h-6 bg-[#20130F] border-t border-[#39251F]" />
        </div>
      ) : (
        /* ARCHIVE GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={(id) => setSelectedBookId(id)}
            />
          ))}
        </div>
      )}

      {/* Book Opening Modal */}
      <BookOpeningModal
        bookId={selectedBookId}
        isOpen={Boolean(selectedBookId)}
        onClose={() => setSelectedBookId(null)}
        onBookUpdated={() => {
          handleRefreshData();
          onRefresh?.();
        }}
        onBookDeleted={() => {
          handleRefreshData();
          onRefresh?.();
        }}
      />
    </div>
  );
}
