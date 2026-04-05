import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getAllVolunteers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const volunteers = await prisma.volunteer.findMany({
      include: { participations: { include: { event: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(volunteers);
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({ error: "Failed to fetch volunteers" });
  }
};

export const getVolunteerById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: req.params.id },
      include: { participations: { include: { event: true } } },
    });
    if (!volunteer) {
      res.status(404).json({ error: "Volunteer not found" });
      return;
    }
    res.json(volunteer);
  } catch (error) {
    console.error("Error fetching volunteer:", error);
    res.status(500).json({ error: "Failed to fetch volunteer" });
  }
};

export const createVolunteer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, address, skills } = req.body;
    if (!name || !email || !phone || !address || !skills) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const existing = await prisma.volunteer.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "A volunteer with this email already exists" });
      return;
    }

    const volunteer = await prisma.volunteer.create({
      data: { name, email, phone, address, skills },
    });
    res.status(201).json(volunteer);
  } catch (error) {
    console.error("Error creating volunteer:", error);
    res.status(500).json({ error: "Failed to create volunteer" });
  }
};

export const deleteVolunteer = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    await prisma.volunteer.delete({ where: { id: req.params.id } });
    res.json({ message: "Volunteer deleted successfully" });
  } catch (error) {
    console.error("Error deleting volunteer:", error);
    res.status(500).json({ error: "Failed to delete volunteer" });
  }
};
