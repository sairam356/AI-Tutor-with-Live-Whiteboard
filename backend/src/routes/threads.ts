import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getMongoClient } from "../db/mongodb.js";

const router = Router();

// POST /api/threads — create a new thread
router.post("/", (_req: Request, res: Response) => {
  const threadId = uuidv4();
  res.json({ threadId });
});

// GET /api/threads/:id/history — retrieve conversation history for a thread
router.get("/:id/history", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await getMongoClient();
    const db = client.db("physics_tutor");
    const checkpoints = db.collection("checkpoints");

    // Retrieve all checkpoints for this thread (ordered by timestamp)
    const docs = await checkpoints
      .find({ thread_id: id })
      .sort({ checkpoint_id: 1 })
      .toArray();

    res.json({ threadId: id, checkpoints: docs });
  } catch (error) {
    console.error("Error retrieving thread history:", error);
    res.status(500).json({ error: "Failed to retrieve thread history" });
  }
});

export default router;
