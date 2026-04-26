import Space from "../models/Space.js";
import Expense from "../models/Expense.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";
export const createSpace = async (req, res) => {
  try {
    const { name, description, budgetLimit, thresholdPercent } = req.body;

    const space = await Space.create({
      name,
      description,
      budgetLimit,
      thresholdPercent,
      owner: req.user.id,
    });

    res.status(201).json(space);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSpaces = async (req, res) => {
  try {
    const spaces = await Space.find({ owner: req.user.id });
    res.status(200).json(spaces);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSpaceDashboard = async (req, res) => {
  try {
    const { spaceId } = req.params;

    const space = await Space.findOne({
      _id: spaceId,
      owner: req.user.id,
    });

    if (!space) {
      return res.status(404).json({ error: "Not found" });
    }

    const categories = await Category.find({ space: spaceId })
      .select("name totalSpent")
      .sort({ totalSpent: -1 });

    const recentExpenses = await Expense.find({ space: spaceId })
      .sort({ date: -1 })
      .limit(10)
      .select("title amount date category")
      .populate("category", "name");

    const remainingBudget = space.budgetLimit - space.totalSpent;
    const isOverBudget = remainingBudget < 0;

    const percentUsed =
      space.budgetLimit > 0 ? (space.totalSpent / space.budgetLimit) * 100 : 0;

    const isThresholdReached = percentUsed >= space.thresholdPercent;

    res.json({
      summary: {
        budgetLimit: space.budgetLimit,
        totalSpent: space.totalSpent,
        remainingBudget,
        isOverBudget,
        percentUsed,
        thresholdPercent: space.thresholdPercent,
        isThresholdReached,
        hasAlerted: space.hasAlerted,
      },
      spaceDetails: {
        name: space.name,
        description: space.description,
      },
      categoryBreakdown: categories,
      recentExpenses,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const acknowledgeThreshold = async (req, res) => {
  try {
    const { spaceId } = req.params;

    const space = await Space.findOneAndUpdate(
      { _id: spaceId, owner: req.user.id },
      { hasAlerted: false },
      { new: true },
    );

    if (!space) {
      return res.status(404).json({ error: "Space not found" });
    }

    res.json({
      message: "Alert acknowledged",
      space,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateSpace = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const { name, description, budgetLimit, thresholdPercent } = req.body;

    const space = await Space.findOne({
      _id: spaceId,
      owner: req.user.id,
    });

    if (!space) {
      return res.status(404).json({ error: "Space not found" });
    }

    if (name) space.name = name;
    if (description !== undefined) space.description = description;

    if (budgetLimit !== undefined) {
      if (budgetLimit < 0) {
        return res.status(400).json({ error: "Invalid budget" });
      }
      space.budgetLimit = budgetLimit;
    }

    if (thresholdPercent !== undefined) {
      if (thresholdPercent < 1 || thresholdPercent > 100) {
        return res.status(400).json({ error: "Invalid threshold" });
      }
      space.thresholdPercent = thresholdPercent;
    }
    const thresholdAmount =
      space.budgetLimit > 0
        ? (space.budgetLimit * space.thresholdPercent) / 100
        : 0;

    if (space.totalSpent < thresholdAmount) {
      space.hasAlerted = false;
    }

    const updatedSpace = await space.save();
    res.status(200).json(updatedSpace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteSpace = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { spaceId } = req.params;

    const space = await Space.findOne({
      _id: spaceId,
      owner: req.user.id,
    }).session(session);

    if (!space) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Space not found or unauthorized" });
    }

    await Expense.deleteMany({ space: spaceId }).session(session);
    await Category.deleteMany({ space: spaceId }).session(session);
    await space.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Space and all associated data deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ error: error.message });
  }
};
