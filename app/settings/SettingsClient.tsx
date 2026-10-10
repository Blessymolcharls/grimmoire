"use client";

import React, { useState } from "react";
import {
  Settings,
  Database,
  Download,
  Target,
  CheckCircle2,
} from "lucide-react";

interface SettingsClientProps {
  user: {
    id: string;
    displayName: string;
    email: string | null;
  };
  bookCount: number;
  sessionCount: number;
  journalCount: number;
  currentYear: number;
  goalTarget: number;
}

export function SettingsClient({
  user,
  bookCount,
  sessionCount,
  journalCount,
  currentYear,
  goalTarget: initialGoalTarget,
}: SettingsClientProps) {
  const [goalTarget, setGoalTarget] = useState(initialGoalTarget);
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalSaved, setGoalSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoal(true);
    try {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: currentYear,
          targetBooks: goalTarget,
        }),
      });
      if (res.ok) {
        setGoalSaved(true);
        setTimeout(() => setGoalSaved(false), 2500);
      }
    } catch (err) {
      console.error("Save goal error:", err);
    } finally {
      setSavingGoal(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const [booksRes, journalRes, sessionsRes, statsRes] = await Promise.all([
        fetch("/api/books?limit=1000"),
        fetch("/api/journal"),
        fetch("/api/sessions"),
        fetch("/api/stats"),
      ]);

      const [booksData, journalData, sessionsData, statsData] = await Promise.all([
        booksRes.json(),
        journalRes.json(),
        sessionsRes.json(),
        statsRes.json(),
      ]);

      const archiveBackup = {
        exportedAt: new Date().toISOString(),
        libraryTitle: "The Hogwarts Library — Archive Backup",
        scholar: user,
        stats: statsData,
        books: booksData.books || [],
        journal: journalData.entries || [],
        sessions: sessionsData.sessions || [],
      };

      const blob = new Blob([JSON.stringify(archiveBackup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hogwarts-library-archive-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-10 space-y-10 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="pb-4 border-b border-[#C5A56A]/20">
        <div className="inline-flex items-center gap-2 text-xs font-serif-magical uppercase tracking-widest text-[#C5A56A] mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>Sanctum Administration</span>
        </div>
        <h1 className="font-serif-magical text-2xl sm:text-4xl font-extrabold text-[#E9DCC1] tracking-wide">
          Library Settings & Data
        </h1>
        <p className="text-xs sm:text-sm text-[#B7ADBD] mt-1">
          Manage your scholarly identity, reading targets, persistent storage, and archive backups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scholar Identity Card */}
        <div className="parchment-card rounded-2xl p-6 border border-[#C5A56A]/25 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#39251F] border border-[#C5A56A]/50 flex items-center justify-center text-[#F3D9A0] font-serif-magical font-bold">
              ✦
            </div>
            <div>
              <h3 className="font-serif-magical text-lg font-bold text-[#E9DCC1]">
                {user.displayName}
              </h3>
              <p className="text-xs text-[#C5A56A]">{user.email || "Local Scholar"}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#C5A56A]/15 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-[#100D18]/70 border border-[#C5A56A]/15">
              <span className="font-bold font-serif-magical text-base text-[#F3D9A0]">
                {bookCount}
              </span>
              <p className="text-[10px] text-[#8E8495] mt-0.5">Tomes</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#100D18]/70 border border-[#C5A56A]/15">
              <span className="font-bold font-serif-magical text-base text-[#F3D9A0]">
                {journalCount}
              </span>
              <p className="text-[10px] text-[#8E8495] mt-0.5">Chronicles</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#100D18]/70 border border-[#C5A56A]/15">
              <span className="font-bold font-serif-magical text-base text-[#F3D9A0]">
                {sessionCount}
              </span>
              <p className="text-[10px] text-[#8E8495] mt-0.5">Sessions</p>
            </div>
          </div>
        </div>

        {/* Annual Reading Goal Configuration */}
        <div className="parchment-card rounded-2xl p-6 border border-[#C5A56A]/25 space-y-4">
          <div className="flex items-center gap-2 text-[#C5A56A]">
            <Target className="w-5 h-5 text-[#C5A56A]" />
            <h3 className="font-serif-magical text-base font-bold text-[#E9DCC1]">
              Annual Reading Target ({currentYear})
            </h3>
          </div>

          <p className="text-xs text-[#B7ADBD]">
            Configure the number of volumes you aim to complete during this solar cycle.
          </p>

          <form onSubmit={handleSaveGoal} className="flex items-center gap-3 pt-2">
            <input
              type="number"
              min="1"
              max="500"
              value={goalTarget}
              onChange={(e) => setGoalTarget(parseInt(e.target.value, 10) || 1)}
              className="w-28 bg-[#100D18] border border-[#C5A56A]/40 rounded-xl px-3 py-2 text-sm text-[#E9DCC1] focus:outline-none focus:border-[#C5A56A]"
            />
            <button
              type="submit"
              disabled={savingGoal}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs shadow hover:from-[#DFCA9B] hover:to-[#C5A56A] disabled:opacity-50"
            >
              {savingGoal ? "Saving..." : "Update Target"}
            </button>
            {goalSaved && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> Updated!
              </span>
            )}
          </form>
        </div>
      </div>

      {/* Database & Architecture Status */}
      <div className="parchment-card rounded-2xl p-6 sm:p-8 border border-[#C5A56A]/25 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#21162E] border border-[#C5A56A]/30 flex items-center justify-center text-[#C5A56A]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-magical text-lg font-bold text-[#E9DCC1]">
              Persistent Architecture & Storage
            </h3>
            <p className="text-xs text-[#8E8495]">
              Prisma ORM with Zero-Config Local SQLite Dev & Hosted PostgreSQL Compatibility
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#100D18]/80 border border-[#C5A56A]/15 space-y-2">
            <span className="font-serif-magical font-bold text-[#F3D9A0] block">
              Active Local Development Engine
            </span>
            <p className="text-[#B7ADBD] leading-relaxed">
              Configured with SQLite (<code className="text-[#C5A56A]">file:./dev.db</code>) and
              strict server-side user scoping. Runs out-of-the-box on any machine without Docker or
              external background servers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#100D18]/80 border border-[#C5A56A]/15 space-y-2">
            <span className="font-serif-magical font-bold text-[#F3D9A0] block">
              Production PostgreSQL Deployment
            </span>
            <p className="text-[#B7ADBD] leading-relaxed">
              Compatible with Vercel, Supabase, Neon, and Railway. Use{" "}
              <code className="text-[#C5A56A]">prisma/schema.postgresql.prisma</code> and provide{" "}
              <code className="text-[#C5A56A]">DATABASE_URL</code> to deploy with full PostgreSQL.
            </p>
          </div>
        </div>

        {/* Data Backup Action */}
        <div className="pt-4 border-t border-[#C5A56A]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-serif-magical text-sm font-bold text-[#E9DCC1]">
              Export Full Library Chronicle
            </h4>
            <p className="text-xs text-[#8E8495] mt-0.5">
              Download all tomes, reading progress, reviews, quotes, and journal entries as JSON.
            </p>
          </div>

          <button
            onClick={handleExportData}
            disabled={exporting}
            className="px-5 py-2.5 rounded-xl bg-[#21162E] hover:bg-[#39251F] text-[#F3D9A0] border border-[#C5A56A]/40 text-xs font-serif-magical flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#C5A56A]" />
            <span>{exporting ? "Compiling..." : "Export Archive (JSON)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
