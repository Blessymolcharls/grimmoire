import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BookSchema } from "@/lib/validations/book";
import { normalizeTitle } from "@/lib/books/normalize";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const SPINE_COLORS = [
  "#7B1FA2", // Amethyst / Charms
  "#B71C1C", // Crimson / Potions
  "#0D47A1", // Sapphire / Astronomy
  "#1B5E20", // Emerald / Defense
  "#D97706", // Amber / History
  "#004D40", // Deep Teal / Creatures
  "#39251F", // Dark Mahogany / Ancient
  "#4A148C", // Royal Plum / Divination
  "#311B92", // Deep Indigo / Restricted
];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const favorite = searchParams.get("favorite") === "true";
    const sort = searchParams.get("sort") || "recently_added";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {
      userId: user.id,
    };

    if (status) {
      where.readingStatus = status;
    }

    if (favorite) {
      where.isFavorite = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { authors: { contains: search } },
        { isbn10: { contains: search } },
        { isbn13: { contains: search } },
        { personalReview: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    if (department) {
      where.departments = {
        some: {
          department: {
            slug: department,
          },
        },
      };
    }

    let orderBy: Prisma.BookOrderByWithRelationInput = { createdAt: "desc" };
    switch (sort) {
      case "recently_updated":
        orderBy = { updatedAt: "desc" };
        break;
      case "title_asc":
        orderBy = { title: "asc" };
        break;
      case "title_desc":
        orderBy = { title: "desc" };
        break;
      case "rating_desc":
        orderBy = { rating: "desc" };
        break;
      case "pages_desc":
        orderBy = { pageCount: "desc" };
        break;
      case "recently_completed":
        orderBy = { dateCompleted: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
    ]);

    // Format books for response
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

    return NextResponse.json({
      books: formattedBooks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/books error:", error);
    return NextResponse.json(
      { error: "Failed to fetch library collection" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const parsed = BookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const normalizedTitle = normalizeTitle(data.title);

    // Duplicate check
    const forceDuplicate = body.forceDuplicate === true;
    if (!forceDuplicate) {
      const existing = await prisma.book.findFirst({
        where: {
          userId: user.id,
          OR: [
            ...(data.isbn13 ? [{ isbn13: data.isbn13 }] : []),
            ...(data.isbn10 ? [{ isbn10: data.isbn10 }] : []),
            { normalizedTitle },
          ],
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            duplicate: true,
            existingBookId: existing.id,
            existingTitle: existing.title,
            message: `A tome titled "${existing.title}" already rests in your library.`,
          },
          { status: 409 }
        );
      }
    }

    // Assign spine color if not provided
    const spineColor =
      data.spineColor ||
      SPINE_COLORS[Math.abs(normalizedTitle.length) % SPINE_COLORS.length];

    const book = await prisma.book.create({
      data: {
        userId: user.id,
        title: data.title,
        normalizedTitle,
        authors: JSON.stringify(data.authors),
        description: data.description,
        coverUrl: data.coverUrl || null,
        publicationYear: data.publicationYear,
        publisher: data.publisher,
        isbn10: data.isbn10,
        isbn13: data.isbn13,
        pageCount: data.pageCount,
        externalProvider: data.externalProvider || "manual",
        externalProviderId: data.externalProviderId,
        readingStatus: data.readingStatus,
        rating: data.rating,
        isFavorite: data.isFavorite,
        dateStarted: data.dateStarted ? new Date(data.dateStarted) : null,
        dateCompleted: data.dateCompleted ? new Date(data.dateCompleted) : null,
        currentPage: data.currentPage || 0,
        personalReview: data.personalReview,
        favoriteCharacter: data.favoriteCharacter,
        notes: data.notes,
        spineColor,
        departments: {
          create: (data.departmentIds || []).map((departmentId) => ({
            departmentId,
          })),
        },
      },
      include: {
        departments: {
          include: {
            department: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        book: {
          ...book,
          authors: data.authors,
          departments: book.departments.map((d) => d.department),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/books error:", error);
    return NextResponse.json(
      { error: "Failed to scribe book into library" },
      { status: 500 }
    );
  }
}
