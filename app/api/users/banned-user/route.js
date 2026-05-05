// app/api/admin/users/route.js

import { connectDB } from "@/lib/connectDB";
import User from "@/models/user";
import { response } from "@/lib/healperFunc";
import BannedUsers from "@/models/bannedUser";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    // Fetch banned users safely (only needed field)
    const bannedUsers = await BannedUsers.find(
      {},
      { userId: 1, _id: 0 },
    ).lean();

    // Extract valid ObjectIds only
    const bannedUserIds = bannedUsers
      .map((b) => {
        try {
          return new mongoose.Types.ObjectId(b.userId);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // Build query
    const query = bannedUserIds.length ? { _id: { $in: bannedUserIds } } : {};

    // Fetch users (exclude sensitive fields)
    const users = await User.find(query)
      .select("-password -__v") // adjust as needed
      .lean();

    if (!users || users.length === 0) {
      return response(true, 200, "No users found", []);
      // better to return empty array than 404 in APIs
    }

    return response(true, 200, "Users fetched successfully", users);
  } catch (err) {
    console.error("GET /api/admin/users error:", err);

    // Handle known mongoose errors
    if (err instanceof mongoose.Error) {
      return response(false, 400, "Database error");
    }

    return response(false, 500, "Internal server error");
  }
}
