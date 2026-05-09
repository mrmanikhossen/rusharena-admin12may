import mongoose from "mongoose";

const DipositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    method: {
      type: String,
      required: true,
      trim: true,
      enum: ["Bkash", "Nagad", "Rocket"],
    },
    trxId: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Diposits ||
  mongoose.model("Diposits", DipositSchema);
