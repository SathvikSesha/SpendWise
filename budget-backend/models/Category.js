import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, lowercase: true, trim: true },
    totalSpent: { type: Number, default: 0 },
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true,
    },
  },
  { timestamps: true },
);

categorySchema.index({ name: 1, space: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
