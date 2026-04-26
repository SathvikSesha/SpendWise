import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";

const router = express.Router();

router.post("/", protect, createExpense);
router.route("/:expenseId").put(protect, updateExpense).delete(protect, deleteExpense);

export default router;
