import { Router } from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
import { requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Any authenticated user can view events
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Only admin can create/update/delete events
router.post("/", requireAdmin, createEvent);
router.put("/:id", requireAdmin, updateEvent);
router.delete("/:id", requireAdmin, deleteEvent);

export default router;
