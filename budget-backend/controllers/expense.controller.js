import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Space from "../models/Space.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { sendThresholdAlert } from "../utils/emailService.js";

export const createExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, amount, spaceId, categoryName } = req.body;

    const space = await Space.findOne(
      { _id: spaceId, owner: req.user.id },
      null,
      { session },
    );

    if (!space) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ error: "Unauthorized" });
    }

    const normalizedName = categoryName.trim().toLowerCase();

    let category = await Category.findOne(
      { space: spaceId, name: normalizedName },
      null,
      { session },
    );

    if (!category) {
      const created = await Category.create(
        [
          {
            name: normalizedName,
            space: spaceId,
          },
        ],
        { session },
      );
      category = created[0];
    }

    const createdExpense = await Expense.create(
      [
        {
          title,
          amount,
          space: spaceId,
          category: category._id,
          loggedBy: req.user.id,
        },
      ],
      { session },
    );

    const newTotalSpent = space.totalSpent + amount;
    const thresholdAmount = (space.budgetLimit * space.thresholdPercent) / 100;

    let triggerEmail = false;

    const updateQuery = {
      $inc: { totalSpent: amount },
    };

    if (newTotalSpent >= thresholdAmount && !space.hasAlerted) {
      updateQuery.$set = { hasAlerted: true };
      triggerEmail = true;
    }

    await Space.findByIdAndUpdate(spaceId, updateQuery, { session });

    await Category.findByIdAndUpdate(
      category._id,
      { $inc: { totalSpent: amount } },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    if (triggerEmail) {
      User.findById(req.user.id)
        .then((user) => {
          if (user) {
            sendThresholdAlert(user.email, space.name, space.thresholdPercent);
          }
        })
        .catch((err) => console.error("Email error:", err));
    }

    res.status(201).json(createdExpense[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ error: error.message });
  }
};

export const updateExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { expenseId } = req.params;
    const { title, amount, categoryName } = req.body;

    const expense = await Expense.findById(expenseId).session(session);

    if (!expense) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Expense not found" });
    }

    const space = await Space.findOne({
      _id: expense.space,
      owner: req.user.id,
    }).session(session);

    if (!space) {
      await session.abortTransaction();
      return res.status(403).json({ error: "Unauthorized" });
    }

    const oldAmount = expense.amount;
    const newAmount = amount !== undefined ? amount : oldAmount;
    const amountDifference = newAmount - oldAmount;

    let newCategory = null;

    if (categoryName) {
      const normalizedName = categoryName.trim().toLowerCase();

      newCategory = await Category.findOne(
        { space: space._id, name: normalizedName },
        null,
        { session },
      );

      if (!newCategory) {
        const created = await Category.create(
          [
            {
              name: normalizedName,
              space: space._id,
            },
          ],
          { session },
        );
        newCategory = created[0];
      }
    }

    if (title) expense.title = title;
    if (amount !== undefined) expense.amount = newAmount;

    const oldCategoryId = expense.category.toString();

    if (newCategory) {
      expense.category = newCategory._id;
    }

    await expense.save({ session });

    if (amountDifference !== 0) {
      const newTotalSpent = space.totalSpent + amountDifference;

      const thresholdAmount =
        space.budgetLimit > 0
          ? (space.budgetLimit * space.thresholdPercent) / 100
          : 0;

      let updateQuery = {
        $inc: { totalSpent: amountDifference },
      };

      if (newTotalSpent < thresholdAmount && space.hasAlerted) {
        updateQuery.$set = { hasAlerted: false };
      } else if (newTotalSpent >= thresholdAmount && !space.hasAlerted) {
        updateQuery.$set = { hasAlerted: true };
      }

      await Space.findByIdAndUpdate(space._id, updateQuery, { session });
    }

    if (!newCategory || oldCategoryId === newCategory._id.toString()) {
      if (amountDifference !== 0) {
        await Category.findByIdAndUpdate(
          oldCategoryId,
          { $inc: { totalSpent: amountDifference } },
          { session },
        );
      }
    } else {
      await Category.findByIdAndUpdate(
        oldCategoryId,
        { $inc: { totalSpent: -oldAmount } },
        { session },
      );
      await Category.findByIdAndUpdate(
        newCategory._id,
        { $inc: { totalSpent: newAmount } },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(expense);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId).session(session);

    if (!expense) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Expense not found" });
    }

    const space = await Space.findOne({
      _id: expense.space,
      owner: req.user.id,
    }).session(session);

    if (!space) {
      await session.abortTransaction();
      return res.status(403).json({ error: "Unauthorized" });
    }

    const newTotalSpent = space.totalSpent - expense.amount;

    const thresholdAmount =
      space.budgetLimit > 0
        ? (space.budgetLimit * space.thresholdPercent) / 100
        : 0;

    let updateQuery = {
      $inc: { totalSpent: -expense.amount },
    };

    if (newTotalSpent < thresholdAmount && space.hasAlerted) {
      updateQuery.$set = { hasAlerted: false };
    }

    await Space.findByIdAndUpdate(space._id, updateQuery, { session });

    await Category.findByIdAndUpdate(
      expense.category,
      { $inc: { totalSpent: -expense.amount } },
      { session },
    );

    await expense.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ error: error.message });
  }
};
