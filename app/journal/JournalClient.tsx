"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scroll,
  Plus,
  Calendar,
  BookOpen,
  Trash2,
  Edit3,
  X,
  Search,
} from "lucide-react";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  entryDate: string | Date;
  books: Array<{
    id: string;
    title: string;
    coverUrl?: string | null;
    authors?: string[];
  }>;
}

interface JournalClientProps {
  initialEntries: JournalEntry[];
  allBooks: Array<{ id: string; title: string; coverUrl?: string | null }>;
}

export function JournalClient({ initialEntries, allBooks }: JournalClientProps) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>("all");

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const filteredEntries = entries.filter((e) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchContent = e.content.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }
    if (selectedBookFilter !== "all") {
      const hasBook = e.books.some((b) => b.id === selectedBookFilter);
      if (!hasBook) return false;
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setEntryDate(new Date().toISOString().split("T")[0]);
    setSelectedBookIds([]);
    setSaveError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setEntryDate(new Date(entry.entryDate).toISOString().split("T")[0]);
    setSelectedBookIds(entry.books.map((b) => b.id));
    setSaveError(null);
    setModalOpen(true);
  };

  const toggleBookSelection = (bookId: string) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    setSaveError(null);

    try {
      const url = editingId ? `/api/journal/${editingId}` : "/api/journal";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          entryDate: new Date(entryDate).toISOString(),
          bookIds: selectedBookIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to record journal chronicle");
        return;
      }

      // Re-fetch list
      const listRes = await fetch("/api/journal");
      if (listRes.ok) {
        const listData = await listRes.json();
        setEntries(listData.entries || []);
      }

      setModalOpen(false);
    } catch {
      setSaveError("Spell disruption while preserving journal entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string, entryTitle: string) => {
    if (!confirm(`Are you certain you wish to excise "${entryTitle}" from your journal?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Delete journal error:", err);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-10 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C5A56A]/20">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-serif-magical uppercase tracking-widest text-[#C5A56A] mb-1">
            <Scroll className="w-3.5 h-3.5" />
            <span>Living Chronicles of the Mind</span>
          </div>
          <h1 className="font-serif-magical text-2xl sm:text-4xl font-extrabold text-[#E9DCC1] tracking-wide">
            Reading Journal
          </h1>
          <p className="text-xs sm:text-sm text-[#B7ADBD] mt-1">
            Preserve intimate memories, philosophical reflections, and the quiet moments between pages.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs sm:text-sm shadow-md hover:from-[#DFCA9B] hover:to-[#C5A56A] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="parchment-card rounded-2xl p-4 border border-[#C5A56A]/25 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A56A]/70" />
          <input
            type="text"
            placeholder="Search chronicles by phrase or reflection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#E9DCC1] placeholder-[#8E8495] focus:outline-none focus:border-[#C5A56A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBookFilter}
            onChange={(e) => setSelectedBookFilter(e.target.value)}
            className="bg-[#100D18] border border-[#C5A56A]/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
          >
            <option value="all">All Associated Tomes</option>
            {allBooks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* JOURNAL ENTRIES LIST */}
      <div className="space-y-6">
        {filteredEntries.length === 0 ? (
          <div className="parchment-card rounded-2xl p-12 text-center border-2 border-dashed border-[#C5A56A]/30">
            <Scroll className="w-12 h-12 text-[#C5A56A]/60 mx-auto mb-3" />
            <h3 className="font-serif-magical text-lg font-bold text-[#E9DCC1]">
              The Journal Pages Await Ink
            </h3>
            <p className="text-xs text-[#B7ADBD] max-w-md mx-auto mt-1 mb-5">
              Record where you were when you turned the last page, or the quiet revelation a chapter
              awakened inside you.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs"
            >
              Write First Entry
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <article
              key={entry.id}
              className="parchment-sheet rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-[#C5A56A]/40 relative overflow-hidden transition-all hover:shadow-[0_12px_40px_rgba(197,165,106,0.15)]"
            >
              {/* Header & Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#39251F]/20">
                <div>
                  <div className="flex items-center gap-2 text-xs font-serif-magical text-[#39251F]/80 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-[#39251F]" />
                    <span>
                      {new Date(entry.entryDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="font-serif-magical text-xl sm:text-2xl font-bold text-[#100D18] mt-1 leading-snug">
                    {entry.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEdit(entry)}
                    className="p-1.5 rounded-lg text-[#39251F]/70 hover:text-[#100D18] hover:bg-black/10 transition-colors"
                    title="Edit chronicle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id, entry.title)}
                    className="p-1.5 rounded-lg text-rose-800/70 hover:text-rose-900 hover:bg-rose-100/50 transition-colors"
                    title="Delete chronicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Journal Body Content */}
              <div className="py-5 text-sm sm:text-base text-[#21162E] font-serif-magical leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </div>

              {/* Associated Tomes Footer */}
              {entry.books && entry.books.length > 0 && (
                <div className="pt-4 border-t border-[#39251F]/20 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-serif-magical text-[#39251F]/70 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Bound To:
                  </span>
                  {entry.books.map((b) => (
                    <Link
                      key={b.id}
                      href={`/books/${b.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#100D18] text-[#F3D9A0] text-xs font-serif-magical hover:bg-[#39251F] transition-colors"
                    >
                      <span>✦ {b.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#140E1D] border-2 border-[#C5A56A]/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-[#E9DCC1] space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A56A]/20">
              <div className="flex items-center gap-2">
                <Scroll className="w-5 h-5 text-[#C5A56A]" />
                <h3 className="font-serif-magical text-lg font-bold text-[#F3D9A0]">
                  {editingId ? "Revise Journal Chronicle" : "Inscribe Journal Chronicle"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#8E8495] hover:text-[#E9DCC1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-serif-magical text-[#C5A56A] mb-1">
                  Chronicle Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Snowfall and the Cemetery of Forgotten Books..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-xl px-3.5 py-2.5 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif-magical text-[#C5A56A] mb-1">
                  Chronicle Date
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="bg-[#100D18] border border-[#C5A56A]/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif-magical text-[#C5A56A] mb-1">
                  Associate with Library Tomes
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#100D18] rounded-xl border border-[#C5A56A]/20">
                  {allBooks.map((b) => {
                    const selected = selectedBookIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleBookSelection(b.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-serif-magical transition-all ${
                          selected
                            ? "bg-[#C5A56A] text-[#100D18] font-bold shadow-sm"
                            : "bg-[#181122] text-[#B7ADBD] border border-[#C5A56A]/20 hover:border-[#C5A56A]/50"
                        }`}
                      >
                        {b.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif-magical text-[#C5A56A] mb-1">
                  Parchment Reflections <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Record your thoughts, emotions, memories of reading..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-xl p-3.5 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A] resize-none leading-relaxed font-serif-magical"
                />
              </div>

              <div className="pt-3 border-t border-[#C5A56A]/20 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#8E8495] hover:text-[#E9DCC1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs sm:text-sm shadow hover:from-[#DFCA9B] hover:to-[#C5A56A] disabled:opacity-50"
                >
                  {saving ? "Binding Parchment..." : "Seal Chronicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
