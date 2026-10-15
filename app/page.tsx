import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  Castle,
  BookOpen,
  Compass,
  Scroll,
  Sparkles,
  Flame,
  Award,
  Bookmark,
  ChevronRight,
  Clock,
} from "lucide-react";
import { BookCard } from "@/components/books/BookCard";
import { calculatePagesRead, calculateReadingStreak } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function EntrancePage() {
  const user = await getCurrentUser();

  // Fetch real database records
  const [
    totalBooks,
    completedBooks,
    currentlyReading,
    wantToRead,
    recentBooks,
    departments,
    sessions,
    completedBooksDates,
    allBooksPages,
  ] = await Promise.all([
    prisma.book.count({ where: { userId: user.id } }),
    prisma.book.count({ where: { userId: user.id, readingStatus: "COMPLETED" } }),
    prisma.book.count({ where: { userId: user.id, readingStatus: "CURRENTLY_READING" } }),
    prisma.book.count({ where: { userId: user.id, readingStatus: "WANT_TO_READ" } }),
    prisma.book.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: {
        departments: {
          include: {
            department: true,
          },
        },
      },
    }),
    prisma.department.findMany({
      where: { OR: [{ userId: null }, { userId: user.id }] },
      include: {
        _count: {
          select: {
            books: {
              where: {
                book: {
                  userId: user.id,
                },
              },
            },
          },
        },
      },
    }),
    prisma.readingSession.findMany({
      where: { userId: user.id },
      select: { startedAt: true },
    }),
    prisma.book.findMany({
      where: { userId: user.id, readingStatus: "COMPLETED", dateCompleted: { not: null } },
      select: { dateCompleted: true },
    }),
    prisma.book.findMany({
      where: { userId: user.id },
      select: { pageCount: true, currentPage: true, readingStatus: true },
    }),
  ]);

  // Total pages
  const totalPages = calculatePagesRead(allBooksPages);

  // Favorite department
  const sortedDepts = departments
    .filter((d) => d._count.books > 0)
    .sort((a, b) => b._count.books - a._count.books);
  const favoriteDepartment = sortedDepts[0]?.name || "Sanctum Privatum";

  // Reading streak
  const streak = calculateReadingStreak(
    sessions.map((s) => s.startedAt),
    completedBooksDates.map((b) => b.dateCompleted as Date)
  );

  const formattedRecentBooks = recentBooks.map((b) => ({
    ...b,
    authors: (() => {
      try {
        return JSON.parse(b.authors);
      } catch {
        return [b.authors];
      }
    })(),
    departments: b.departments.map((d) => d.department),
  }));

  return (
    <div className="flex-1 flex flex-col min-h-screen p-4 sm:p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full">
      {/* ATMOSPHERIC CASTLE HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden parchment-card p-6 sm:p-12 lg:p-16 border-2 border-[#C5A56A]/30 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(197,165,106,0.1)]">
        {/* Ambient Candlelight and Glow Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F3D9A0]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#C5A56A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 border border-[#C5A56A]/15 rounded-full pointer-events-none" />
        <div className="absolute -top-6 -right-6 w-36 h-36 border border-[#C5A56A]/20 rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#100D18]/80 border border-[#C5A56A]/40 text-[#C5A56A] text-xs font-serif-magical tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>The Ancient Sanctuary of Letters</span>
          </div>

          <h1 className="font-serif-magical text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#E9DCC1] tracking-wide leading-tight drop-shadow-md">
            Grimmoire
            <span className="block text-xl sm:text-3xl lg:text-4xl text-[#C5A56A] font-semibold mt-1">
              The Hogwarts Library
            </span>
          </h1>

          <p className="font-serif-magical italic text-lg sm:text-xl text-[#F3D9A0]/90 font-light leading-relaxed">
            &ldquo;Every book is a world you have visited, a memory engraved in parchment, and a flame against the dark.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-[#B7ADBD] leading-relaxed max-w-2xl font-sans-body">
            Step through the towering mahogany arches. Here your reading life is preserved—every
            tome you have completed, every passage that whispered to your heart, and every realm
            you have yet to explore.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <Link
              href="/library"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-sm sm:text-base shadow-xl hover:from-[#DFCA9B] hover:to-[#C5A56A] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group"
            >
              <Castle className="w-5 h-5 text-[#100D18]" />
              <span>Enter the Library</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/discover"
              className="px-6 py-3.5 rounded-xl bg-[#21162E]/90 hover:bg-[#39251F] text-[#E9DCC1] border border-[#C5A56A]/40 text-sm sm:text-base font-semibold transition-all flex items-center gap-2"
            >
              <Compass className="w-5 h-5 text-[#C5A56A]" />
              <span>Discover Tomes</span>
            </Link>
          </div>
        </div>
      </section>

      {/* REAL DATABASE-DERIVED STATISTICAL OVERVIEW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-magical text-xl sm:text-2xl font-bold text-[#E9DCC1] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C5A56A]" />
            <span>Archive Chronicle & Vitals</span>
          </h2>
          <Link
            href="/observatory"
            className="text-xs text-[#C5A56A] hover:text-[#F3D9A0] font-serif-magical flex items-center gap-1"
          >
            <span>Visit the Observatory</span> →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total Books */}
          <div className="parchment-card rounded-2xl p-4 sm:p-5 border border-[#C5A56A]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#C5A56A]">
              <span className="text-[11px] uppercase tracking-wider font-serif-magical">Tomes</span>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif-magical text-[#E9DCC1]">
                {totalBooks}
              </span>
              <p className="text-[10px] text-[#8E8495] mt-0.5">Shelved in Archives</p>
            </div>
          </div>

          {/* Completed */}
          <div className="parchment-card rounded-2xl p-4 sm:p-5 border border-[#C5A56A]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[11px] uppercase tracking-wider font-serif-magical">Finished</span>
              <Award className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif-magical text-[#E9DCC1]">
                {completedBooks}
              </span>
              <p className="text-[10px] text-[#8E8495] mt-0.5">Journeys Completed</p>
            </div>
          </div>

          {/* Currently Reading */}
          <div className="parchment-card rounded-2xl p-4 sm:p-5 border border-[#C5A56A]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[11px] uppercase tracking-wider font-serif-magical">Open</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif-magical text-[#E9DCC1]">
                {currentlyReading}
              </span>
              <p className="text-[10px] text-[#8E8495] mt-0.5">Presently Reading</p>
            </div>
          </div>

          {/* Want to Read */}
          <div className="parchment-card rounded-2xl p-4 sm:p-5 border border-[#C5A56A]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-[11px] uppercase tracking-wider font-serif-magical">Destined</span>
              <Bookmark className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif-magical text-[#E9DCC1]">
                {wantToRead}
              </span>
              <p className="text-[10px] text-[#8E8495] mt-0.5">Awaiting Your Hand</p>
            </div>
          </div>

          {/* Total Pages Read */}
          <div className="parchment-card rounded-2xl p-4 sm:p-5 border border-[#C5A56A]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#F3D9A0]">
              <span className="text-[11px] uppercase tracking-wider font-serif-magical">Parchment</span>
              <Scroll className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif-magical text-[#E9DCC1]">
                {totalPages.toLocaleString()}
              </span>
              <p className="text-[10px] text-[#8E8495] mt-0.5">Pages Absorbed</p>
            </div>
          </div>

          {/* Reading Streak */}
          <div className="parchment-card rounded-2xl p-4 sm:p-5 border border-[#C5A56A]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-orange-400">
              <span className="text-[11px] uppercase tracking-wider font-serif-magical">Streak</span>
              <Flame className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold font-serif-magical text-[#E9DCC1]">
                {streak} {streak === 1 ? "Day" : "Days"}
              </span>
              <p className="text-[10px] text-[#8E8495] mt-0.5">{favoriteDepartment} Wing</p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY VISITED WORLDS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-magical text-xl sm:text-2xl font-bold text-[#E9DCC1]">
              Recently Visited Worlds
            </h2>
            <p className="text-xs text-[#8E8495] mt-0.5">
              The latest volumes opened or completed in your sanctum
            </p>
          </div>
          <Link
            href="/library"
            className="text-xs text-[#C5A56A] hover:text-[#F3D9A0] font-serif-magical flex items-center gap-1"
          >
            <span>View All Shelves</span> →
          </Link>
        </div>

        {formattedRecentBooks.length === 0 ? (
          <div className="parchment-card rounded-2xl p-10 text-center border-2 border-dashed border-[#C5A56A]/30">
            <BookOpen className="w-12 h-12 text-[#C5A56A]/60 mx-auto mb-3" />
            <h3 className="font-serif-magical text-lg font-bold text-[#E9DCC1]">
              No Tomes Inscribed Yet
            </h3>
            <p className="text-xs text-[#B7ADBD] max-w-sm mx-auto mt-1 mb-4">
              Your personal library stands waiting. Scribe your first book to begin your magical
              reading archive.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs"
            >
              <span>Add Your First Tome</span> ✦
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {formattedRecentBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
