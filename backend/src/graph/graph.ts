import { StateGraph, START, END } from "@langchain/langgraph";
import { AITutorState } from "./state.js";
import { tutorNode, illustratorNode } from "./nodes.js";
import type { BaseCheckpointSaver } from "@langchain/langgraph";

const workflow = new StateGraph(AITutorState)
  .addNode("tutor", tutorNode)
  .addNode("illustrator", illustratorNode)
  .addEdge(START, "tutor")
  .addEdge("tutor", "illustrator")
  .addEdge("illustrator", END);

export function getCompiledGraph(checkpointer: BaseCheckpointSaver) {
  return workflow.compile({ checkpointer });
}
