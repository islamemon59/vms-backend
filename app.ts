import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import volunteerRoutes from "./routes/volunteer.routes.js";
import eventRoutes from "./routes/event.routes.js";
import participationRoutes from "./routes/participation.routes.js";
import { authenticate, requireAdmin } from "./middleware/auth.middleware.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Public routes
app.use("/auth", authRoutes);

// Protected routes (admin only)
app.use("/volunteers", authenticate, requireAdmin, volunteerRoutes);
app.use("/events", authenticate, eventRoutes);
app.use("/participation", authenticate, participationRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "VMS Backend API is running" });
});

export default app;
