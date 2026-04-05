import { Router } from "express";
import {
  createParticipation,
  getAllParticipations,
  deleteParticipation,
} from "../controllers/participation.controller.js";
import { requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Any authenticated user can create participation (join event)
router.post("/", createParticipation);

// Any authenticated user can view participations
router.get("/", getAllParticipations);

// Only admin can delete participation
router.delete("/:id", requireAdmin, deleteParticipation);

export default router;
