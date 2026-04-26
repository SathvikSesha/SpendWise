import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.route("/").post(protect, createCategory);
router.route("/:categoryId").put(protect, updateCategory).delete(protect, deleteCategory);

export default router;
