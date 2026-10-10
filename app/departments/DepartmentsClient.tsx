"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  BookOpen,
  FlaskConical,
  ShieldAlert,
  Eye,
  Scroll,
  Wand2,
  Feather,
  Compass,
  KeyRound,
  Trash2,
  X,
  Layers,
} from "lucide-react";
import { BookCard } from "@/components/books/BookCard";

interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  accentColor?: string | null;
  isSystem: boolean;
  bookCount: number;
}

interface DepartmentsClientProps {
  initialDepartments: Department[];
  allBooks: any[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  FlaskConical,
  ShieldAlert,
  Eye,
  Scroll,
  Wand2,
  Feather,
  Compass,
  KeyRound,
  Layers,
};

export function DepartmentsClient({
  initialDepartments,
  allBooks,
}: DepartmentsClientProps) {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [activeSlug, setActiveSlug] = useState<string>("all");

  // Create Department form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newColor, setNewColor] = useState("#A855F7");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const activeDepartment = departments.find((d) => d.slug === activeSlug);

  const displayedBooks =
    activeSlug === "all"
      ? allBooks
      : allBooks.filter((b) =>
          b.departments.some((d: any) => d.slug === activeSlug)
        );

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
          accentColor: newColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to establish department");
        return;
      }

      setDepartments((prev) => [...prev, data.department]);
      setShowCreateModal(false);
      setNewName("");
      setNewDescription("");
    } catch {
      setCreateError("An incantation error occurred.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDepartment = async (deptId: string, name: string) => {
    if (!confirm(`Disband the custom department "${name}"?`)) return;
    try {
      const res = await fetch(`/api/departments/${deptId}`, { method: "DELETE" });
      if (res.ok) {
        setDepartments((prev) => prev.filter((d) => d.id !== deptId));
        if (activeSlug === deptId) setActiveSlug("all");
      }
    } catch (err) {
      console.error("Error deleting department:", err);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-10 space-y-10 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C5A56A]/20">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-serif-magical uppercase tracking-widest text-[#C5A56A] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curriculum & Thematic Order</span>
          </div>
          <h1 className="font-serif-magical text-2xl sm:text-4xl font-extrabold text-[#E9DCC1] tracking-wide">
            Magical Departments
          </h1>
          <p className="text-xs sm:text-sm text-[#B7ADBD] mt-1">
            Browse the specialized wings of Hogwarts, from Charms and Divination to the guarded
            Restricted Section.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs sm:text-sm shadow-md hover:from-[#DFCA9B] hover:to-[#C5A56A] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Found Custom Department</span>
        </button>
      </div>

      {/* DEPARTMENT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const Icon = (dept.icon && ICON_MAP[dept.icon]) || Sparkles;
          const isSelected = activeSlug === dept.slug;
          const accent = dept.accentColor || "#C5A56A";

          return (
            <div
              key={dept.id}
              onClick={() => setActiveSlug(isSelected ? "all" : dept.slug)}
              style={{
                borderColor: isSelected ? accent : `${accent}35`,
                boxShadow: isSelected ? `0 0 25px ${accent}25` : undefined,
              }}
              className={`parchment-card rounded-2xl p-5 border-2 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group relative overflow-hidden ${
                isSelected ? "bg-[#281838]" : ""
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                    style={{ backgroundColor: `${accent}25`, color: accent }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-serif-magical border"
                      style={{
                        backgroundColor: `${accent}15`,
                        color: accent,
                        borderColor: `${accent}40`,
                      }}
                    >
                      {dept.bookCount} {dept.bookCount === 1 ? "Tome" : "Tomes"}
                    </span>
                    {!dept.isSystem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDepartment(dept.id, dept.name);
                        }}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                        title="Disband custom department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif-magical text-lg font-bold text-[#E9DCC1] group-hover:text-[#F3D9A0] transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-[#B7ADBD] mt-1 line-clamp-2 leading-relaxed">
                    {dept.description || "Thematic collection of lore."}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#C5A56A]/15 flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#8E8495] uppercase tracking-wider">
                  {dept.isSystem ? "Castle Canon" : "Custom Sanctum"}
                </span>
                <span
                  className="font-serif-magical font-medium transition-colors"
                  style={{ color: isSelected ? accent : "#C5A56A" }}
                >
                  {isSelected ? "✦ Viewing Wing" : "Inspect Wing →"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTERED TOMES IN ACTIVE WING */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#C5A56A]/20">
          <div>
            <h2 className="font-serif-magical text-xl sm:text-2xl font-bold text-[#E9DCC1] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C5A56A]" />
              <span>
                {activeDepartment
                  ? `Volumes in ${activeDepartment.name}`
                  : "All Volumes in Archives"}
              </span>
            </h2>
            <p className="text-xs text-[#8E8495] mt-0.5">
              Showing {displayedBooks.length} {displayedBooks.length === 1 ? "tome" : "tomes"}
            </p>
          </div>

          {activeSlug !== "all" && (
            <button
              onClick={() => setActiveSlug("all")}
              className="text-xs text-[#C5A56A] hover:underline"
            >
              Show All Departments
            </button>
          )}
        </div>

        {displayedBooks.length === 0 ? (
          <div className="parchment-card rounded-2xl p-10 text-center border-2 border-dashed border-[#C5A56A]/30">
            <BookOpen className="w-10 h-10 text-[#C5A56A]/60 mx-auto mb-2" />
            <h3 className="font-serif-magical text-base font-bold text-[#E9DCC1]">
              No Volumes in this Wing
            </h3>
            <p className="text-xs text-[#B7ADBD] mt-1 mb-4">
              You haven&apos;t assigned any books to {activeDepartment?.name} yet.
            </p>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#21162E] hover:bg-[#39251F] text-[#F3D9A0] border border-[#C5A56A]/30 text-xs font-serif-magical"
            >
              <span>Assign Tomes from Shelves</span> ✦
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* CREATE DEPARTMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#140E1D] border-2 border-[#C5A56A]/40 rounded-2xl p-6 shadow-2xl text-[#E9DCC1] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A56A]/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A56A]" />
                <h3 className="font-serif-magical text-base font-bold text-[#F3D9A0]">
                  Found New Magical Department
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8E8495] hover:text-[#E9DCC1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-serif-magical text-[#C5A56A] mb-1">
                  Department Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alchemical Wonders, Ancient Runes, Gothic Lore..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-xl px-3.5 py-2.5 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif-magical text-[#C5A56A] mb-1">
                  Description & Thematic Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="What genres, feelings, or subjects belong in this wing?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#100D18] border border-[#C5A56A]/30 rounded-xl p-3 text-xs text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-serif-magical text-[#C5A56A] mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {[
                    "#A855F7",
                    "#EC4899",
                    "#F43F5E",
                    "#EA580C",
                    "#D97706",
                    "#10B981",
                    "#06B6D4",
                    "#3B82F6",
                    "#6366F1",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        newColor === color
                          ? "border-[#F3D9A0] scale-125"
                          : "border-transparent hover:scale-110"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#C5A56A]/20 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-[#8E8495] hover:text-[#E9DCC1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs shadow hover:from-[#DFCA9B] hover:to-[#C5A56A] disabled:opacity-50"
                >
                  {creating ? "Inscribing Wing..." : "Establish Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
