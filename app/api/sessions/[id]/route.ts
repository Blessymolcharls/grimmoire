import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const session = await prisma.readingSession.findFirst({
      where: { id, userId: user.id },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Reading session not found or access denied." },
        { status: 404 }
      );
    }

    await prisma.readingSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Reading session removed." });
  } catch (error) {
    console.error("DELETE /api/sessions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete reading session" },
      { status: 500 }
    );
  }
}
