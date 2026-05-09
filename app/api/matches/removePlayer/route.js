import { connectDB } from "@/lib/connectDB";
import matches from "@/models/matches";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { matchId, playerId } = body;

    if ((!matchId, !playerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "matchId,  and playerId are required",
        },
        { status: 400 },
      );
    }

    // Find match
    const existingMatch = await matches.findById(matchId);

    if (!existingMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Match not found",
        },
        { status: 404 },
      );
    }

    // Find player inside joinedPlayers
    const player = existingMatch.joinedPlayers.find(
      (p) => p._id?.toString() === playerId,
    );

    if (!player) {
      return NextResponse.json(
        {
          success: false,
          message: "Player not found in this match",
        },
        { status: 404 },
      );
    }

    // Find user
    const foundUser = await User.findById(player.authId);

    if (!foundUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // Refund entry fee
    const entryFee = existingMatch.entryFee || 0;

    await User.findByIdAndUpdate(
      player.authId,
      {
        $inc: { dipositbalance: entryFee / 2, winbalance: entryFee / 2 }, // Refund half/half of the entry fee to dipositbalance and to winbalance as well
      },
      { new: true },
    );

    // Remove player from joinedPlayers
    await matches.findByIdAndUpdate(
      matchId,
      {
        $pull: {
          joinedPlayers: {
            _id: playerId, // Use the player's _id to pull from the array
          },
        },
      },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      message: "Player removed and refund processed successfully",
    });
  } catch (error) {
    console.error("POST /api/matches/removePlayer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
