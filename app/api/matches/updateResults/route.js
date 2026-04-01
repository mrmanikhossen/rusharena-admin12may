// app/api/matches/updateResults/route.js
import { connectDB } from "@/lib/connectDB";
import { response } from "@/lib/healperFunc";
import Matches from "@/models/matches";
import User from "@/models/user";
import MyMathes from "@/models/myMatch";

export async function POST(req) {
  try {
    await connectDB();

    const { matchId, results } = await req.json();

    if (!matchId || !results || !Array.isArray(results)) {
      return response(false, 400, "matchId and results are required");
    }

    // 1. Find the match
    const match = await Matches.findById(matchId);
    if (!match) return response(false, 404, "Match not found");

    //  here also check if {match.winPrize} is greater than total wining in results
    const totalWinning = results.reduce((sum, r) => sum + (r.wining || 0), 0);

    if (totalWinning > match.winPrize) {
      return response(false, 400, "Total winnings exceed match prize pool");
    }
    const notFoundPlayers = [];
    const updatedPlayers = [];

    // 2. Loop through results
    for (const result of results) {
      const joinedPlayer = match.joinedPlayers.find(
        (p) => p.authId === result.playerId,
      );

      if (!joinedPlayer) {
        notFoundPlayers.push(result.playerId);
        continue;
      }

      // 3. Update User winbalance
      const user = await User.findById(result.playerId);
      if (user) {
        user.winbalance = (user.winbalance || 0) + result.wining;
        await user.save();
        updatedPlayers.push(user._id);

        // 4. Create MyMathes record for this user
        await MyMathes.create({
          userId: user._id,
          title: match.title,
          time: match.startTime,
          myKills: result.kills.toString(),
          myWin: result.wining.toString(),
        });
      } else {
        notFoundPlayers.push(result.playerId);
      }
    }

    // 5. Delete the match after processing
    await Matches.findByIdAndDelete(matchId);

    return response(true, 200, "Win balances updated and match deleted!", {
      updatedPlayers,
      notFoundPlayers,
    });
  } catch (error) {
    console.error(error);
    return response(false, 500, "Server error", error.message);
  }
}
