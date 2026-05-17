export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const key = process.env.ANTHROPIC_API_KEY;
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const prompt = body?.prompt || "";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-7",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        debugError: JSON.stringify(data.error),
        fullResponse: JSON.stringify(data)
      });
    }

    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
