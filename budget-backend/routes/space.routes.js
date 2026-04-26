import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createSpace,
  getSpaces,
  getSpaceDashboard,
  acknowledgeThreshold,
  updateSpace,
  deleteSpace,
} from "../controllers/space.controller.js";

const router = express.Router();

router.route("/").post(protect, createSpace).get(protect, getSpaces);
router.route("/:spaceId/dashboard").get(protect, getSpaceDashboard);
router.patch("/:spaceId/acknowledge", protect, acknowledgeThreshold);
router.route("/:spaceId").put(protect, updateSpace).delete(protect, deleteSpace);

export default router;
