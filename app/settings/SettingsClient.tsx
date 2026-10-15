"use client";

import React, { useState, useRef } from "react";
import {
  Settings,
  Database,
  Download,
  Upload,
  Target,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
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

interface BackupPreview {
  version: string;
  exportedAt: string;
  scholarName: string;
  totalTomesInBackup: number;
  newTomesToInscribe: number;
  existingTomesToKeep: number;
  departmentsInBackup: number;
  journalEntriesInBackup: number;
  goalsInBackup: number;
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

  // Restore / Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<BackupPreview | null>(null);
  const [pendingArchive, setPendingArchive] = useState<unknown | null>(null);
  const [restoring, setRestoring] = useState(false);

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
      const res = await fetch("/api/backup/export");
      if (!res.ok) throw new Error("Export failed");
      const archive = await res.json();

      const blob = new Blob([JSON.stringify(archive, null, 2)], {
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

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);
    setImporting(true);

    try {
      const text = await file.text();
      const parsedJson = JSON.parse(text);

      // Perform dry-run preview check with the server
      const res = await fetch("/api/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archive: parsedJson,
          dryRun: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "Incompatible or malformed archive file.");
        return;
      }

      setPreviewData(data);
      setPendingArchive(parsedJson);
    } catch (err) {
      console.error("Parse error:", err);
      setImportError("Failed to parse JSON file. Ensure the file is a valid Grimmoire archive.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmRestore = async () => {
    if (!pendingArchive) return;
    setRestoring(true);
    setImportError(null);

    try {
      const res = await fetch("/api/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archive: pendingArchive,
          dryRun: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "Failed to restore archive.");
        return;
      }

      setImportSuccess(data.message);
      setPreviewData(null);
      setPendingArchive(null);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Restore error:", err);
      setImportError("Network error during archive restoration.");
    } finally {
      setRestoring(false);
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
              aria-label="Annual target volumes"
            />
            <button
              type="submit"
              disabled={savingGoal}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs shadow hover:from-[#DFCA9B] hover:to-[#C5A56A] disabled:opacity-50 transition-all"
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

        {/* Data Backup & Restore Action */}
        <div className="pt-4 border-t border-[#C5A56A]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-serif-magical text-sm font-bold text-[#E9DCC1]">
              Library Chronicle Backup & Restoration
            </h4>
            <p className="text-xs text-[#8E8495] mt-0.5">
              Export versioned JSON archive (v1.0.0) or safely restore tomes with duplicate protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept=".json,application/json"
              className="hidden"
              aria-label="Upload archive JSON file"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="px-4 py-2.5 rounded-xl bg-[#21162E] hover:bg-[#39251F] text-[#E9DCC1] border border-[#C5A56A]/40 text-xs font-serif-magical flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-[#C5A56A]" />
              <span>{importing ? "Reading..." : "Restore Archive (JSON)"}</span>
            </button>

            <button
              onClick={handleExportData}
              disabled={exporting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs font-serif-magical flex items-center gap-2 transition-all hover:from-[#DFCA9B] hover:to-[#C5A56A] disabled:opacity-50 shadow-md"
            >
              <Download className="w-4 h-4 text-[#100D18]" />
              <span>{exporting ? "Compiling..." : "Export Full Archive (JSON)"}</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {importError && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {importSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{importSuccess}</span>
          </div>
        )}
      </div>

      {/* Restore Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#140E1D] border-2 border-[#C5A56A]/40 rounded-2xl p-6 space-y-5 text-[#E9DCC1] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A56A]/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A56A]" />
                <h3 className="font-serif-magical font-bold text-base text-[#F3D9A0]">
                  Archive Restoration Preview
                </h3>
              </div>
              <button
                onClick={() => {
                  setPreviewData(null);
                  setPendingArchive(null);
                }}
                className="text-[#8E8495] hover:text-[#E9DCC1]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#B7ADBD]">
              Grimmoire inspected the archive (schema v{previewData.version}, exported by{" "}
              <strong>{previewData.scholarName}</strong>). Existing tomes in your library are
              preserved and will not be overwritten.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#100D18] border border-[#C5A56A]/20">
                <span className="text-emerald-400 font-bold font-serif-magical text-lg">
                  +{previewData.newTomesToInscribe}
                </span>
                <p className="text-[#8E8495] text-[11px] mt-0.5">New Tomes to Inscribe</p>
              </div>

              <div className="p-3 rounded-xl bg-[#100D18] border border-[#C5A56A]/20">
                <span className="text-[#C5A56A] font-bold font-serif-magical text-lg">
                  {previewData.existingTomesToKeep}
                </span>
                <p className="text-[#8E8495] text-[11px] mt-0.5">Existing Tomes Preserved</p>
              </div>

              <div className="p-3 rounded-xl bg-[#100D18] border border-[#C5A56A]/20">
                <span className="text-[#F3D9A0] font-bold font-serif-magical text-lg">
                  {previewData.journalEntriesInBackup}
                </span>
                <p className="text-[#8E8495] text-[11px] mt-0.5">Journal Chronicles</p>
              </div>

              <div className="p-3 rounded-xl bg-[#100D18] border border-[#C5A56A]/20">
                <span className="text-indigo-400 font-bold font-serif-magical text-lg">
                  {previewData.departmentsInBackup}
                </span>
                <p className="text-[#8E8495] text-[11px] mt-0.5">Departments</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C5A56A]/20">
              <button
                onClick={() => {
                  setPreviewData(null);
                  setPendingArchive(null);
                }}
                disabled={restoring}
                className="px-4 py-2 rounded-xl bg-[#21162E] text-[#B7ADBD] hover:text-[#E9DCC1] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={restoring}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs shadow hover:from-[#DFCA9B] hover:to-[#C5A56A] disabled:opacity-50"
              >
                {restoring ? "Inscribing..." : "Confirm & Inscribe Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
