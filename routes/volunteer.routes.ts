import { Router } from "express";
import {
  getAllVolunteers,
  getVolunteerById,
  createVolunteer,
  deleteVolunteer,
} from "../controllers/volunteer.controller.js";

const router = Router();

router.get("/", getAllVolunteers);
router.get("/:id", getVolunteerById);
router.post("/", createVolunteer);
router.delete("/:id", deleteVolunteer);

export default router;
