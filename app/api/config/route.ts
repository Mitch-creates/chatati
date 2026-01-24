import { NextResponse } from "next/server";
import { getAvailableLanguages, getAvailableAreas } from "@/lib/services/user.service";

export async function GET() {
  try {
    const [languages, areas] = await Promise.all([
      getAvailableLanguages(),
      getAvailableAreas(),
    ]);

    return NextResponse.json({
      languages,
      areas,
    });
  } catch (error) {
    console.error("Error in GET /api/config:", error);
    return NextResponse.json(
      { error: "internalServerError" },
      { status: 500 }
    );
  }
}
