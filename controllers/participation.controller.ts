import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const createParticipation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { volunteerId, eventId } = req.body;
    if (!volunteerId || !eventId) {
      res.status(400).json({ error: "volunteerId and eventId are required" });
      return;
    }

    const volunteer = await prisma.volunteer.findUnique({ where: { id: volunteerId } });
    if (!volunteer) {
      res.status(404).json({ error: "Volunteer not found" });
      return;
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { participations: true } } },
    });
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    if (event._count.participations >= event.maxVolunteers) {
      res.status(400).json({ error: "Event has reached maximum volunteers" });
      return;
    }

    const existing = await prisma.participation.findUnique({
      where: { volunteerId_eventId: { volunteerId, eventId } },
    });
    if (existing) {
      res.status(409).json({ error: "Volunteer already registered for this event" });
      return;
    }

    const participation = await prisma.participation.create({
      data: { volunteerId, eventId, status: "registered" },
      include: { volunteer: true, event: true },
    });
    res.status(201).json(participation);
  } catch (error) {
    console.error("Error creating participation:", error);
    res.status(500).json({ error: "Failed to create participation" });
  }
};

export const getAllParticipations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const participations = await prisma.participation.findMany({
      include: { volunteer: true, event: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(participations);
  } catch (error) {
    console.error("Error fetching participations:", error);
    res.status(500).json({ error: "Failed to fetch participations" });
  }
};

export const deleteParticipation = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    await prisma.participation.delete({ where: { id: req.params.id } });
    res.json({ message: "Participation removed successfully" });
  } catch (error) {
    console.error("Error deleting participation:", error);
    res.status(500).json({ error: "Failed to delete participation" });
  }
};
