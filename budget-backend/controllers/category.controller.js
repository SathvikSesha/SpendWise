import Category from "../models/Category.js";
import Space from "../models/Space.js";
import Expense from "../models/Expense.js";
import mongoose from "mongoose";

export const createCategory = async (req, res) => {
  try {
    const { name, spaceId } = req.body;

    const normalizedName = name.trim().toLowerCase();

    const space = await Space.findOne({
      _id: spaceId,
      owner: req.user.id,
    });

    if (!space) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const category = await Category.create({
      name: normalizedName,
      space: spaceId,
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Category already exists in this space." });
    }

    res.status(400).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const space = await Space.findOne({
      _id: category.space,
      owner: req.user.id,
    });

    if (!space) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    category.name = name.trim().toLowerCase();

    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Category already exists in this space." });
    }

    res.status(400).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId).session(session);

    if (!category) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Category not found" });
    }

    const space = await Space.findOne({
      _id: category.space,
      owner: req.user.id,
    }).session(session);

    if (!space) {
      await session.abortTransaction();
      return res.status(403).json({ error: "Unauthorized" });
    }

    const amountToDeduct = category.totalSpent;

    await Expense.deleteMany({ category: categoryId }).session(session);

    const newTotalSpent = space.totalSpent - amountToDeduct;

    const thresholdAmount =
      space.budgetLimit > 0
        ? (space.budgetLimit * space.thresholdPercent) / 100
        : 0;

    let updateQuery = {
      $inc: { totalSpent: -amountToDeduct },
    };

    if (newTotalSpent < thresholdAmount && space.hasAlerted) {
      updateQuery.$set = { hasAlerted: false };
    }

    await Space.findByIdAndUpdate(space._id, updateQuery, { session });

    await category.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Category and associated expenses deleted",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ error: error.message });
  }
};
