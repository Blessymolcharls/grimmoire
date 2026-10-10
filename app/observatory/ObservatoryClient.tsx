"use client";

import React, { useState } from "react";
import {
  Telescope,
  Sparkles,
  BookOpen,
  Clock,
  Star,
  Scroll,
  TrendingUp,
  Target,
  Edit2,
  Check,
} from "lucide-react";

interface ObservatoryStats {
  totalBooks: number;
  completedBooks: number;
  currentlyReading: number;
  wantToRead: number;
  onHold: number;
  dnf: number;
  favoriteBooks: number;
  avgRating: number | null;
  totalPages: number;
  totalMinutes: number;
  totalSessionPages: number;
  sessionCount: number;
  currentYear: number;
  targetGoal: number;
  completedThisYear: number;
  monthlyCompleted: Array<{ month: string; count: number }>;
  departmentDistribution: Array<{
    name: string;
    slug: string;
    count: number;
    accentColor: string;
  }>;
}

interface ObservatoryClientProps {
  stats: ObservatoryStats;
}

export function ObservatoryClient({ stats }: ObservatoryClientProps) {
  const [goalTarget, setGoalTarget] = useState(stats.targetGoal);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoalInput, setNewGoalInput] = useState(String(stats.targetGoal));
  const [savingGoal, setSavingGoal] = useState(false);

  const goalPercentage = Math.min(
    100,
    Math.round((stats.completedThisYear / goalTarget) * 100)
  );

  const maxMonthlyCount = Math.max(
    1,
    ...stats.monthlyCompleted.map((m) => m.count)
  );

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(newGoalInput, 10);
    if (!parsed || parsed < 1) return;

    setSavingGoal(true);
    try {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: stats.currentYear,
          targetBooks: parsed,
        }),
      });

      if (res.ok) {
        setGoalTarget(parsed);
        setEditingGoal(false);
      }
    } catch (err) {
      console.error("Error updating goal:", err);
    } finally {
      setSavingGoal(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-10 space-y-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C5A56A]/20">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-serif-magical uppercase tracking-widest text-[#C5A56A] mb-1">
            <Telescope className="w-3.5 h-3.5" />
            <span>High Astronomy Tower</span>
          </div>
          <h1 className="font-serif-magical text-2xl sm:text-4xl font-extrabold text-[#E9DCC1] tracking-wide">
            The Reading Observatory
          </h1>
          <p className="text-xs sm:text-sm text-[#B7ADBD] mt-1">
            Chart the celestial motions of your literary journey, pages turned, and goals attained.
          </p>
        </div>
      </div>

      {/* ANNUAL READING GOAL BANNER */}
      <div className="parchment-card rounded-3xl p-6 sm:p-8 border-2 border-[#C5A56A]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A56A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-[#C5A56A]">
              <Target className="w-5 h-5 text-[#C5A56A]" />
              <span className="font-serif-magical text-sm font-bold uppercase tracking-wider">
                Anno {stats.currentYear} Literary Conquest
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-serif-magical text-4xl sm:text-5xl font-extrabold text-[#E9DCC1]">
                {stats.completedThisYear}
              </span>
              <span className="text-xl sm:text-2xl text-[#8E8495] font-serif-magical">
                / {goalTarget} tomes completed
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#B7ADBD]">
              {goalPercentage >= 100
                ? "Glorious triumph! You have fulfilled your annual scholarly goal!"
                : `You are ${goalPercentage}% of the way toward your destined goal.`}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-[#100D18] h-3.5 rounded-full overflow-hidden border border-[#C5A56A]/30 mt-3 max-w-xl">
              <div
                className="h-full bg-gradient-to-r from-[#C5A56A] via-[#F3D9A0] to-[#DFCA9B] rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${goalPercentage}%` }}
              />
            </div>
          </div>

          {/* Goal Edit Button */}
          <div className="self-end md:self-center flex-shrink-0">
            {editingGoal ? (
              <form onSubmit={handleUpdateGoal} className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={newGoalInput}
                  onChange={(e) => setNewGoalInput(e.target.value)}
                  className="w-20 bg-[#100D18] border border-[#C5A56A]/40 rounded-xl px-3 py-2 text-sm text-[#E9DCC1]"
                />
                <button
                  type="submit"
                  disabled={savingGoal}
                  className="px-3.5 py-2 rounded-xl bg-[#C5A56A] text-[#100D18] font-bold text-xs hover:bg-[#F3D9A0]"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGoal(false)}
                  className="text-xs text-[#8E8495] hover:text-[#E9DCC1] px-2"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setEditingGoal(true)}
                className="px-4 py-2 rounded-xl bg-[#21162E] hover:bg-[#39251F] text-[#F3D9A0] border border-[#C5A56A]/30 text-xs font-serif-magical flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Adjust Goal Target</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CORE METRIC TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Volumes */}
        <div className="parchment-card rounded-2xl p-5 border border-[#C5A56A]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#C5A56A]">
            <span className="text-xs font-serif-magical uppercase tracking-wider">Archives</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="mt-4">
            <span className="font-serif-magical text-3xl font-extrabold text-[#E9DCC1]">
              {stats.totalBooks}
            </span>
            <p className="text-xs text-[#8E8495] mt-1">Shelved Volumes</p>
          </div>
        </div>

        {/* Total Parchment Pages */}
        <div className="parchment-card rounded-2xl p-5 border border-[#C5A56A]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#F3D9A0]">
            <span className="text-xs font-serif-magical uppercase tracking-wider">Parchment</span>
            <Scroll className="w-4 h-4" />
          </div>
          <div className="mt-4">
            <span className="font-serif-magical text-3xl font-extrabold text-[#E9DCC1]">
              {stats.totalPages.toLocaleString()}
            </span>
            <p className="text-xs text-[#8E8495] mt-1">Total Pages Absorbed</p>
          </div>
        </div>

        {/* Average Rating */}
        <div className="parchment-card rounded-2xl p-5 border border-[#C5A56A]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-serif-magical uppercase tracking-wider">Aesthetic</span>
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <div className="mt-4">
            <span className="font-serif-magical text-3xl font-extrabold text-[#E9DCC1]">
              {stats.avgRating !== null ? `${stats.avgRating} ★` : "—"}
            </span>
            <p className="text-xs text-[#8E8495] mt-1">Average Personal Rating</p>
          </div>
        </div>

        {/* Reading Time */}
        <div className="parchment-card rounded-2xl p-5 border border-[#C5A56A]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-serif-magical uppercase tracking-wider">Time In Sanctum</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-4">
            <span className="font-serif-magical text-3xl font-extrabold text-[#E9DCC1]">
              {Math.round(stats.totalMinutes / 60)} hrs
            </span>
            <p className="text-xs text-[#8E8495] mt-1">
              {stats.sessionCount} Recorded Sessions
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MONTHLY COMPLETED BOOKS BAR CHART (7 cols) */}
        <div className="lg:col-span-7 parchment-card rounded-3xl p-6 sm:p-8 border border-[#C5A56A]/25 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-magical text-lg sm:text-xl font-bold text-[#E9DCC1] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#C5A56A]" />
                <span>Monthly Completion Flow ({stats.currentYear})</span>
              </h2>
              <p className="text-xs text-[#8E8495] mt-0.5">
                Volumes finished across each lunar cycle of the year
              </p>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 pt-6 flex items-end justify-between gap-2 border-b border-[#C5A56A]/20 px-2">
            {stats.monthlyCompleted.map((item, idx) => {
              const heightPercent =
                item.count > 0 ? Math.max(12, Math.round((item.count / maxMonthlyCount) * 100)) : 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="text-[10px] text-[#C5A56A] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </div>

                  <div className="w-full max-w-[28px] bg-[#100D18] h-full flex items-end rounded-t-md overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-[#C5A56A] to-[#F3D9A0] rounded-t-md transition-all duration-500 group-hover:from-[#DFCA9B] group-hover:to-[#FFF0C8]"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className="text-[10px] sm:text-xs font-serif-magical text-[#8E8495] group-hover:text-[#E9DCC1] transition-colors">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DEPARTMENTAL DISTRIBUTION (5 cols) */}
        <div className="lg:col-span-5 parchment-card rounded-3xl p-6 sm:p-8 border border-[#C5A56A]/25 space-y-6">
          <div>
            <h2 className="font-serif-magical text-lg sm:text-xl font-bold text-[#E9DCC1] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C5A56A]" />
              <span>Wing & Department Lore</span>
            </h2>
            <p className="text-xs text-[#8E8495] mt-0.5">
              Thematic dispersion of preserved knowledge
            </p>
          </div>

          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {stats.departmentDistribution.length === 0 ? (
              <p className="text-xs text-[#8E8495] italic font-serif-magical">
                Assign tomes to departments to reveal thematic affinities.
              </p>
            ) : (
              stats.departmentDistribution.map((dept) => {
                const percent = Math.round(
                  (dept.count / Math.max(1, stats.totalBooks)) * 100
                );
                return (
                  <div key={dept.slug} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-serif-magical text-[#E9DCC1] font-medium">
                        {dept.name}
                      </span>
                      <span className="text-[#C5A56A] font-semibold">
                        {dept.count} {dept.count === 1 ? "tome" : "tomes"} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#100D18] h-2 rounded-full overflow-hidden border border-[#C5A56A]/20">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: dept.accentColor || "#C5A56A",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
