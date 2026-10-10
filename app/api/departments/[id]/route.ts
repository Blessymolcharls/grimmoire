import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DepartmentSchema } from "@/lib/validations/journal";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.department.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 404 }
      );
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: "System departments of Hogwarts cannot be modified." },
        { status: 403 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json(
        { error: "Access denied." },
        { status: 403 }
      );
    }

    const parsed = DepartmentSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.department.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ department: updated });
  } catch (error) {
    console.error("PATCH /api/departments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const existing = await prisma.department.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Department not found." },
        { status: 404 }
      );
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: "System departments of Hogwarts cannot be dismantled." },
        { status: 403 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json(
        { error: "Access denied." },
        { status: 403 }
      );
    }

    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Department disbanded." });
  } catch (error) {
    console.error("DELETE /api/departments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}
