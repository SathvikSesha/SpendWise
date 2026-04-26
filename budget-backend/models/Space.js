import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    budgetLimit: { type: Number, required: true, min: 0 },
    thresholdPercent: { type: Number, default: 80, min: 1, max: 100 },
    totalSpent: { type: Number, default: 0 },
    hasAlerted: { type: Boolean, default: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Space", spaceSchema);
