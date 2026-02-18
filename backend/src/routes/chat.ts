import { Router, Request, Response } from "express";
import { HumanMessage } from "@langchain/core/messages";
import { getCheckpointer } from "../db/mongodb.js";
import { getCompiledGraph } from "../graph/graph.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { threadId, message } = req.body as { threadId: string; message: string };

  if (!threadId || !message) {
    res.status(400).json({ error: "threadId and message are required" });
    return;
  }

  try {
    const checkpointer = await getCheckpointer();
    const graph = getCompiledGraph(checkpointer);

    const result = await graph.invoke(
      { messages: [new HumanMessage(message)], threadId },
      { configurable: { thread_id: threadId } }
    );

    const tutorText: string = result.tutorText ?? "";
    const canvasRaw: string = result.canvasActions ?? "";

    const match = canvasRaw.match(/<canvas_actions>([\s\S]*?)<\/canvas_actions>/);
    let canvasActions = [];
    if (match) {
      try {
        canvasActions = JSON.parse(match[1].trim());
      } catch {
        canvasActions = [];
      }
    }

    res.json({ tutorText, canvasActions });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

export default router;
