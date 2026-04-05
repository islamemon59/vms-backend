import { Router } from "express";
import {
  createVolunteerRequest,
  getMyRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
} from "../controllers/volunteer-request.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Authenticated users can submit and check their request
router.post("/", authenticate, createVolunteerRequest);
router.get("/me", authenticate, getMyRequest);

// Admin-only: view all requests, approve, reject
router.get("/", authenticate, requireAdmin, getAllRequests);
router.patch("/:id/approve", authenticate, requireAdmin, approveRequest);
router.patch("/:id/reject", authenticate, requireAdmin, rejectRequest);

export default router;
