import { connectDB } from "@/lib/connectDB";
import Matches from "@/models/matches";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return new Response(JSON.stringify({ message: "Match Id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(matchId)) {
      return new Response(JSON.stringify({ message: "Invalid Match Id's" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch the match by ID and populate joined players
    const match = await Matches.findById(matchId)
      .populate("joinedPlayers.authId", "name")
      .lean();

    if (!match) {
      return new Response(
        JSON.stringify({ message: "No match found", data: null }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ message: "Success", match }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to fetch match",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
