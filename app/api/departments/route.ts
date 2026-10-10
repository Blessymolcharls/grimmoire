import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DepartmentSchema } from "@/lib/validations/journal";

export async function GET() {
  try {
    const user = await getCurrentUser();

    const departments = await prisma.department.findMany({
      where: {
        OR: [{ userId: null }, { userId: user.id }],
      },
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
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    });

    const formatted = departments.map((d) => ({
      ...d,
      bookCount: d._count.books,
    }));

    return NextResponse.json({ departments: formatted });
  } catch (error) {
    console.error("GET /api/departments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const parsed = DepartmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, description, icon, accentColor } = parsed.data;
    const slug =
      parsed.data.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // Check duplicate slug for user
    const existing = await prisma.department.findFirst({
      where: {
        userId: user.id,
        slug,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A custom department with this name already exists." },
        { status: 409 }
      );
    }

    const department = await prisma.department.create({
      data: {
        userId: user.id,
        name,
        slug,
        description,
        icon: icon || "Sparkles",
        accentColor: accentColor || "#A855F7",
        isSystem: false,
      },
    });

    return NextResponse.json({ department, bookCount: 0 }, { status: 201 });
  } catch (error) {
    console.error("POST /api/departments error:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}
