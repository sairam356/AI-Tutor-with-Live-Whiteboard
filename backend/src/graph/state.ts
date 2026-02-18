import { MessagesAnnotation, Annotation } from "@langchain/langgraph";

export const AITutorState = Annotation.Root({
  ...MessagesAnnotation.spec,
  tutorText: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
  canvasActions: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
  threadId: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
});

export type AITutorStateType = typeof AITutorState.State;
