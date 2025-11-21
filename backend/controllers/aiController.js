export const chatWithGroq = async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "GROQ_API_KEY not configured" });

    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const systemPrompt = {
      role: "system",
      content:
        "You are an AI study assistant. Format responses based on query length: If short, answer in 1–3 concise lines. If broad or complex, organize with a clear title, bullet or numbered subheadings, and a short concluding summary. Use simple Markdown (# headings, - bullets). Keep answers focused and helpful.",
    };
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [systemPrompt, ...messages],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ message: "Groq error", error: text });
    }
    const data = await response.json();
    const output = data?.choices?.[0]?.message?.content || "";
    res.json({ output });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};