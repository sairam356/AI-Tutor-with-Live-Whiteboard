import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useStreamParser } from "../hooks/useStreamParser";
import type { CanvasAction } from "../types/canvas.types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

interface ChatPanelProps {
  threadId: string;
  onCanvasAction: (action: CanvasAction) => void;
}

export function ChatPanel({ threadId, onCanvasAction }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { streamChat, cancel } = useStreamParser();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: trimmed };
    const loadingId = `assistant-${Date.now()}`;
    const loadingMsg: Message = { id: loadingId, role: "assistant", content: "", isLoading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsLoading(true);

    await streamChat(threadId, trimmed, {
      onDone: (tutorText, canvasActions) => {
        setMessages((prev) =>
          prev.map((m) => m.id === loadingId ? { ...m, content: tutorText, isLoading: false } : m)
        );
        canvasActions.forEach((action) => onCanvasAction(action));
        setIsLoading(false);
      },
      onError: (message) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId ? { ...m, content: `❌ Error: ${message}`, isLoading: false } : m
          )
        );
        setIsLoading(false);
      },
    });
  }, [input, isLoading, threadId, streamChat, onCanvasAction]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100">
      <div className="flex-none px-4 py-3 border-b border-gray-800 bg-gray-900">
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">AI Tutor</h2>
        <p className="text-xs text-gray-500 mt-0.5">Ask anything</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 space-y-3">
            <div className="text-4xl">⚛️</div>
            <p className="text-sm max-w-xs">Ask me anything — science, math, history, programming, and more.</p>
            <div className="text-xs text-gray-700 space-y-1">
              <p>Try: "Explain Newton's Third Law"</p>
              <p>Try: "How does photosynthesis work?"</p>
              <p>Try: "What is a binary search tree?"</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2.5 text-sm ${message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"}`}>
              {message.role === "user" ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : message.isLoading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs">Thinking...</span>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none px-4 py-3 border-t border-gray-800 bg-gray-900">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a physics question... (Enter to send)"
            disabled={isLoading}
            rows={2}
            className="flex-1 resize-none bg-gray-800 text-gray-100 placeholder-gray-600 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {isLoading ? (
            <button onClick={cancel} className="flex-none px-3 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
              Stop
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!input.trim()} className="flex-none px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
              Send
            </button>
          )}
        </div>
        <p className="text-xs text-gray-700 mt-1.5">Thread: <span className="font-mono">{threadId.slice(0, 8)}…</span></p>
      </div>
    </div>
  );
}
