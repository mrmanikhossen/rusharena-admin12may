import { connectDB } from "@/lib/connectDB";

import BannedUsers from "@/models/bannedUser";
import { response } from "@/lib/healperFunc";
import Tokens from "@/models/Tokens";

export async function POST(req) {
  try {
    await connectDB();

    const { userId, email } = await req.json();
    if (!userId || !email)
      return response(false, 400, "userId and email are required");

    // Find all tokens of this user
    const token = await Tokens.findOne({ userId }).sort({ _id: -1 }).lean();

    // Create banned user entryconst banned = await BannedUsers.findOneAndUpdate(
    const banned = await BannedUsers.findOneAndUpdate(
      { userId },
      { userId, email, token: token ? token.token : null },
      { new: true, upsert: true },
    ).lean();

    if (!banned) {
      return response(false, 500, "Failed to ban user");
    }

    if (!token) {
      return response(
        false,
        404,
        "No tokens found, Only Gmail has been banned",
      );
    }

    return response(true, 200, "User tokens banned successfully");
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return response(false, 400, "User banned !!", err.message);
    }
    return response(false, 500, "Server error", err.message);
  }
}
