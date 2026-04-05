import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const createVolunteerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { phone, address, skills } = req.body;
    if (!phone || !address || !skills) {
      res.status(400).json({ error: "Phone, address, and skills are required" });
      return;
    }

    // Check if user already has a pending or approved request
    const existing = await prisma.volunteerRequest.findFirst({
      where: { userId, status: { in: ["pending", "approved"] } },
    });
    if (existing) {
      res.status(409).json({
        error: existing.status === "pending"
          ? "You already have a pending volunteer request"
          : "You are already an approved volunteer",
      });
      return;
    }

    const request = await prisma.volunteerRequest.create({
      data: { userId, phone, address, skills },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error("Error creating volunteer request:", error);
    res.status(500).json({ error: "Failed to submit volunteer request" });
  }
};

export const getMyRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const request = await prisma.volunteerRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(request);
  } catch (error) {
    console.error("Error fetching volunteer request:", error);
    res.status(500).json({ error: "Failed to fetch volunteer request" });
  }
};

export const getAllRequests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.volunteerRequest.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching volunteer requests:", error);
    res.status(500).json({ error: "Failed to fetch volunteer requests" });
  }
};

export const approveRequest = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const request = await prisma.volunteerRequest.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (request.status !== "pending") {
      res.status(400).json({ error: `Request is already ${request.status}` });
      return;
    }

    // Use a transaction to: update request status, create volunteer, update user role
    await prisma.$transaction(async (tx) => {
      await tx.volunteerRequest.update({
        where: { id: request.id },
        data: { status: "approved" },
      });

      await tx.volunteer.create({
        data: {
          userId: request.userId,
          name: request.user.name,
          email: request.user.email,
          phone: request.phone,
          address: request.address,
          skills: request.skills,
        },
      });

      await tx.user.update({
        where: { id: request.userId },
        data: { role: "volunteer" },
      });
    });

    res.json({ message: "Volunteer request approved" });
  } catch (error) {
    console.error("Error approving volunteer request:", error);
    res.status(500).json({ error: "Failed to approve request" });
  }
};

export const rejectRequest = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const request = await prisma.volunteerRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (request.status !== "pending") {
      res.status(400).json({ error: `Request is already ${request.status}` });
      return;
    }

    await prisma.volunteerRequest.update({
      where: { id: request.id },
      data: { status: "rejected" },
    });

    res.json({ message: "Volunteer request rejected" });
  } catch (error) {
    console.error("Error rejecting volunteer request:", error);
    res.status(500).json({ error: "Failed to reject request" });
  }
};
