import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Bookshelf } from "@/components/library/Bookshelf";
import { Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await getCurrentUser();

  const [books, departments] = await Promise.all([
    prisma.book.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        departments: {
          include: {
            department: true,
          },
        },
        quotes: {
          take: 2,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            quotes: true,
            readingSessions: true,
          },
        },
      },
    }),
    prisma.department.findMany({
      where: {
        OR: [{ userId: null }, { userId: user.id }],
      },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    }),
  ]);

  const formattedBooks = books.map((b) => ({
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
    <div className="flex-1 p-4 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#C5A56A]/20">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-serif-magical uppercase tracking-widest text-[#C5A56A] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grand Archives of Hogwarts</span>
          </div>
          <h1 className="font-serif-magical text-2xl sm:text-4xl font-extrabold text-[#E9DCC1] tracking-wide">
            My Magical Shelves
          </h1>
          <p className="text-xs sm:text-sm text-[#B7ADBD] mt-1">
            Browse your living repository of tomes arranged along ancient mahogany tiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A56A] to-[#A08048] text-[#100D18] font-bold text-xs sm:text-sm shadow-md hover:from-[#DFCA9B] hover:to-[#C5A56A] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Add a Tome</span>
          </Link>
        </div>
      </div>

      {/* Main 2D Bookshelf and Filter Controls */}
      <Bookshelf
        initialBooks={formattedBooks}
        departments={departments}
      />
    </div>
  );
}
