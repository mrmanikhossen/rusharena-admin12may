import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import { catchError, response } from "@/lib/healperFunc";
import NumberModel from "@/models/numbers";

export async function POST(req) {
  try {
    await connectDB();

    const { type, number } = await req.json();

    if (!type || !number) {
      return response(false, 400, "Missing required fields");
    }

    // Check if the number record already exists for the given method
    const existingNumber = await NumberModel.findOne({ method: type });

    let updatedNumber;

    if (existingNumber) {
      // Update existing record
      updatedNumber = await NumberModel.findOneAndUpdate(
        { method: type },
        { number },
        { new: true },
      );
    } else {
      // Create new record
      updatedNumber = await NumberModel.create({ number, method: type });
    }

    return NextResponse.json({
      success: true,
      data: updatedNumber,
      message: existingNumber
        ? "Number updated successfully"
        : "Number created successfully",
    });
  } catch (err) {
    console.error("POST /api/numbers error:", err);
    return catchError(err);
  }
}

export async function GET() {
  try {
    await connectDB();

    // Fetch both numbers in parallel
    const [bkashData, nagadData, rocketData] = await Promise.all([
      NumberModel.findOne({ method: "Bkash" }),
      NumberModel.findOne({ method: "Nagad" }),
      NumberModel.findOne({ method: "Rocket" }),
    ]);

    if (!bkashData && !nagadData && !rocketData) {
      return response(false, 404, "Numbers not found");
    }

    return NextResponse.json({
      success: true,
      data: {
        Bkash: bkashData?.number || null,
        Nagad: nagadData?.number || null,
        Rocket: rocketData?.number || null,
      },
      message: "Numbers fetched successfully",
    });
  } catch (err) {
    console.error("GET /api/numbers error:", err);
    return catchError(err);
  }
}
