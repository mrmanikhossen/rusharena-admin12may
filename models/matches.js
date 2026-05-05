import mongoose from "mongoose";
const AutoIncrement = require("mongoose-sequence")(mongoose);

const JoinedPlayerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  authId: {
    type: String,
    required: true,
    trim: true,
  },
  userName: { type: String, required: true, trim: true },
});

const MatchesSchema = new mongoose.Schema(
  {
    serialNumber: { type: Number, unique: true },
    title: { type: String, required: true, trim: true },
    roomId: { type: String, requiied: true, default: "" },
    roomPass: { type: String, requiied: true, default: "" },
    matchType: { type: String, required: true, trim: true },
    winPrize: { type: Number, required: true },
    perKill: { type: Number, required: true },
    entryFee: { type: Number, required: true },
    entryType: { type: String, required: true, trim: true },
    map: { type: String, required: true, trim: true },
    totalSpots: { type: Number, required: true },
    prizeDetails: { type: Array, default: [] }, // array of objects if needed
    startTime: { type: Date, required: true },
    joinedPlayers: { type: [JoinedPlayerSchema], default: [] },
  },
  { timestamps: true },
);

MatchesSchema.plugin(AutoIncrement, { inc_field: "serialNumber" });

export default mongoose.models.Matches ||
  mongoose.model("Matches", MatchesSchema);
