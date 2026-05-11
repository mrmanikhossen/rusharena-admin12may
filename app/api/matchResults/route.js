import { connectDB } from "@/lib/connectDB";
import ResultMatches from "@/models/resultMatch";

export async function GET(request) {
  try {
    await connectDB();

    // 👇 userId from headers
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get("x-user-id");
    const matchType = searchParams.get("matchType");

    if (!userId) {
      return new Response(JSON.stringify({ message: "Unauthorized Access!" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const matches = await ResultMatches.find({ matchType })
      .sort({ createdAt: -1 })
      .lean();
    if (!matches) {
      return new Response(
        JSON.stringify({ message: "No  matches found", data: [] }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }
    if (!matches.length) {
      return new Response(
        JSON.stringify({ message: "No  matches found", data: [] }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ message: "Success", data: matches }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API error:", error);

    return new Response(
      JSON.stringify({
        message: "Failed to fetch matches",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
