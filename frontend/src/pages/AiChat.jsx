import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function AiChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I’m your AI study assistant. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const renderMessage = (m) => {
    const lines = String(m.content || "").split(/\r?\n/);
    return (
      <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
        m.role === "assistant" ? "bg-gray-100 text-gray-900" : "bg-indigo-600 text-white ml-auto"
      }`}> 
        {lines.map((line, idx) => {
          if (line.startsWith("# ")) return <div key={idx} className="text-lg font-bold">{line.replace(/^#\s*/, "")}</div>;
          if (line.startsWith("## ")) return <div key={idx} className="mt-1 font-semibold">{line.replace(/^##\s*/, "")}</div>;
          if (line.startsWith("- ")) return <div key={idx} className="pl-4 list-disc">• {line.replace(/^-\s*/, "")}</div>;
          return <div key={idx} className="mt-1">{line}</div>;
        })}
      </div>
    );
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const API = import.meta.env.VITE_API_URL;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    try {
      const res = await axios.post(`${API}/api/ai/chat`, { messages: [...messages, userMsg] });
      const reply = res.data?.output || "Sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "There was an error contacting the AI." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-24 max-w-5xl mx-auto px-6 pb-6">
      <h1 className="text-3xl font-bold mb-4">AI Study Assistant</h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div ref={listRef} className="h-[60vh] overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i}>{renderMessage(m)}</div>
          ))}
        </div>

        <div className="border-t p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            className="border flex-1 p-2 rounded"
            placeholder="Type your question..."
          />
          <button className="btn-primary" disabled={sending} onClick={sendMessage}>
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}