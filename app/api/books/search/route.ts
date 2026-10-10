import { NextRequest, NextResponse } from "next/server";
import { searchOpenLibrary } from "@/lib/books/providers/openlibrary";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    if (query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters." },
        { status: 400 }
      );
    }

    const results = await searchOpenLibrary(query.trim(), 12);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Book search API error:", error);
    return NextResponse.json(
      { error: "Failed to search books. Please try manual entry." },
      { status: 500 }
    );
  }
}
