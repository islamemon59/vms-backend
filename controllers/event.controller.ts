import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getAllEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      include: {
        participations: { include: { volunteer: true } },
        _count: { select: { participations: true } },
      },
      orderBy: { date: "asc" },
    });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

export const getEventById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        participations: { include: { volunteer: true } },
        _count: { select: { participations: true } },
      },
    });
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, location, date, maxVolunteers } = req.body;
    if (!title || !description || !location || !date || !maxVolunteers) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        date: new Date(date),
        maxVolunteers: parseInt(maxVolunteers, 10),
      },
    });
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
};

export const updateEvent = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { title, description, location, date, maxVolunteers } = req.body;
    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (location !== undefined) data.location = location;
    if (date !== undefined) data.date = new Date(date);
    if (maxVolunteers !== undefined) data.maxVolunteers = parseInt(maxVolunteers, 10);

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data,
    });
    res.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
};

export const deleteEvent = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
};
