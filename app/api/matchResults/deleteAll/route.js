import { connectDB } from "@/lib/connectDB";
 import ResultMatches from "@/models/resultMatch";
  import { NextResponse } from "next/server";
   import mongoose from "mongoose";

export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const matchType = searchParams.get("matchType");

    if (!matchType) {
      return NextResponse.json(
        { success: false, message: "matchType is required" },
        { status: 400 }
      );
    }


    
    

const deleted = await ResultMatches.deleteMany({matchType});

    if (deleted.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Match not found" },
        { status: 404 }
      );
    }

 
    return NextResponse.json({
      success: true,
      message: "Match deleted successfully",
    
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}