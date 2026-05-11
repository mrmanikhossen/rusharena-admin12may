import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import Diposits from "@/models/dipositScema";
import { catchError } from "@/lib/healperFunc";

export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Fetch all deposits (no populate)
    const deposits = await Diposits.find().sort({ createdAt: -1 }); // newest first

    return NextResponse.json({
      success: true,
      data: deposits,
    });
  } catch (err) {
    return catchError(err);
  }
}
