import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createTutorModel, TUTOR_SYSTEM_PROMPT } from "../agents/tutorAgent.js";
import { createIllustratorModel, ILLUSTRATOR_SYSTEM_PROMPT } from "../agents/illustratorAgent.js";
import type { AITutorStateType } from "./state.js";

const tutorModel = createTutorModel();
const illustratorModel = createIllustratorModel();

export async function tutorNode(
  state: AITutorStateType
): Promise<Partial<AITutorStateType>> {
  // Prepend system message before the conversation history
  const messages = [
    new SystemMessage(TUTOR_SYSTEM_PROMPT),
    ...state.messages,
  ];

  const response = await tutorModel.invoke(messages);
  const tutorText = typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);

  return {
    messages: [response],
    tutorText,
  };
}

export async function illustratorNode(
  state: AITutorStateType
): Promise<Partial<AITutorStateType>> {
  const lastUserMessage = state.messages
    .filter((m) => m._getType() === "human")
    .at(-1);

  const userQuestion = lastUserMessage
    ? (typeof lastUserMessage.content === "string"
        ? lastUserMessage.content
        : JSON.stringify(lastUserMessage.content))
    : "";

  const illustratorPrompt = `The physics tutor just explained the following concept to a student:

---
STUDENT QUESTION: ${userQuestion}

TUTOR'S EXPLANATION:
${state.tutorText}
---

Based on this explanation, generate canvas actions to create a helpful visual diagram on the whiteboard that illustrates the key concepts. The diagram should visually complement what was explained.`;

  const response = await illustratorModel.invoke([
    new SystemMessage(ILLUSTRATOR_SYSTEM_PROMPT),
    new HumanMessage(illustratorPrompt),
  ]);

  const canvasActions = typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);

  return {
    canvasActions,
  };
}
