import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Bot, Copy, MessageSquare, SendHorizonal, Sparkles, User2 } from "lucide-react";

const renderInline = (text) => {
  const parts = String(text || "").split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-indigo-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

const renderMessageContent = (content) => {
  const lines = String(content || "").split(/\r?\n/);
  const blocks = [];
  let listItems = [];
  let codeLines = [];
  let inCodeBlock = false;

  const flushList = (keyBase) => {
    if (!listItems.length) return;
    blocks.push(
      <ul key={`list-${keyBase}`} className="chat-markdown">
        {listItems.map((item, index) => (
          <li key={`${keyBase}-${index}`}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  const flushCode = (keyBase) => {
    if (!codeLines.length) return;
    blocks.push(
      <pre
        key={`code-${keyBase}`}
        className="overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100"
      >
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
    codeLines = [];
  };

  lines.forEach((line, idx) => {
    const value = line.trimEnd();

    if (value.trim().startsWith("```")) {
      if (inCodeBlock) {
        flushCode(idx);
        inCodeBlock = false;
      } else {
        flushList(idx);
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (!value.trim()) {
      flushList(idx);
      blocks.push(<div key={`space-${idx}`} className="h-2" />);
      return;
    }

    if (/^=+$/.test(value.trim())) {
      return;
    }

    if (value.trim().startsWith("- ") || value.trim().startsWith("• ")) {
      listItems.push(value.trim().replace(/^(-|•)\s*/, ""));
      return;
    }

    if (/^\d+\.\s+/.test(value.trim())) {
      listItems.push(value.trim().replace(/^\d+\.\s+/, ""));
      return;
    }

    flushList(idx);

    if (value.trim().startsWith("# ")) {
      blocks.push(
        <h1 key={`h1-${idx}`} className="chat-markdown text-xl font-semibold">
          {renderInline(value.trim().replace(/^#\s*/, ""))}
        </h1>
      );
      return;
    }

    if (value.trim().startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${idx}`} className="chat-markdown mt-2 text-lg font-semibold">
          {renderInline(value.trim().replace(/^##\s*/, ""))}
        </h2>
      );
      return;
    }

    blocks.push(
      <p key={`p-${idx}`} className="chat-markdown">
        {renderInline(value.trim())}
      </p>
    );
  });

  flushList("end");
  flushCode("end");
  return blocks;
};

export default function AiChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I’m your AI study assistant. Ask me anything and I’ll help you with notes, exam prep, and study tips.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setStatusMessage("Thinking...");

    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.post(`${API}/api/ai/chat`, { messages: nextMessages });
      const reply = res.data?.output || "Sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setStatusMessage("");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "There was an error contacting the AI. Please try again." },
      ]);
      setStatusMessage("");
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    "Explain React hooks in simple words",
    "Make revision notes for DBMS normalization",
    "Give me a short answer for OS deadlock",
    "Create a study plan for my semester exams",
  ];

  const copyMessage = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1500);
    } catch (error) {
      if (error) return;
    }
  };

  return (
    <div className="section-shell pt-24 pb-10">
      <div className="surface-card overflow-hidden p-0">
        <div className="grid min-h-[calc(100vh-9rem)] lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="mesh-panel p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Sparkles className="text-cyan-200" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">AI Workspace</p>
                <h1 className="mt-1 text-2xl font-semibold">Study Assistant</h1>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-200/80">
              Get cleaner, more readable answers for concepts, summaries, revision sheets, and exam prep.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Try asking</p>
              <div className="mt-4 space-y-3">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-white/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-3 text-sm text-slate-200/80">
              <div className="flex items-start gap-3">
                <MessageSquare size={16} className="mt-1 text-cyan-200" />
                <span>Answers are formatted with headings and bullet points for easier reading.</span>
              </div>
              <div className="flex items-start gap-3">
                <Bot size={16} className="mt-1 text-cyan-200" />
                <span>Use Shift + Enter for a new line and Enter to send quickly.</span>
              </div>
            </div>
          </aside>

          <div className="flex min-h-0 flex-col bg-white">
            <div className="border-b border-slate-200/80 px-6 py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Conversational AI</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Chat with structured, modern answers
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Ask theory questions, summaries, or exam-focused prompts and get responses in a more polished chat layout.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  AI ready
                </div>
              </div>
            </div>

            <div
              ref={listRef}
              className="flex-1 space-y-6 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-6 pb-36 sm:px-6"
            >
              {messages.map((m, index) => {
                const assistant = m.role === "assistant";
                return (
                  <div key={index} className={`flex gap-3 ${assistant ? "justify-start" : "justify-end"}`}>
                    {assistant && (
                      <div className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md sm:flex">
                        <Bot size={18} />
                      </div>
                    )}

                    <div className={`max-w-3xl ${assistant ? "" : "order-first"}`}>
                      <div
                        className={`rounded-[28px] border px-5 py-4 shadow-sm ${
                          assistant
                            ? "border-slate-200 bg-white text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                            : "border-indigo-500 bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em]">
                            {assistant ? (
                              <>
                                <Bot size={14} />
                                Assistant
                              </>
                            ) : (
                              <>
                                <User2 size={14} />
                                You
                              </>
                            )}
                          </div>

                          {assistant && (
                            <button
                              onClick={() => copyMessage(m.content, index)}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                            >
                              <Copy size={12} />
                              {copiedIndex === index ? "Copied" : "Copy"}
                            </button>
                          )}
                        </div>

                        <div className={assistant ? "space-y-2 text-[15px] leading-7" : "space-y-2 text-[15px] leading-7"}>
                          {renderMessageContent(m.content)}
                        </div>
                      </div>
                    </div>

                    {!assistant && (
                      <div className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md sm:flex">
                        <User2 size={18} />
                      </div>
                    )}
                  </div>
                );
              })}

              {sending && (
                <div className="flex gap-3">
                  <div className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md sm:flex">
                    <Bot size={18} />
                  </div>
                  <div className="max-w-xl rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      <Bot size={14} />
                      Assistant
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-500" />
                      {statusMessage}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
              <div className="rounded-[28px] border border-slate-300 bg-slate-100 p-3 shadow-[0_-12px_40px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="min-h-[110px] w-full resize-none rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Ask for explanations, summaries, revision notes, or interview-style answers..."
                  />
                  <button
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    disabled={sending || !input.trim()}
                    onClick={sendMessage}
                  >
                    <SendHorizonal size={16} />
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
