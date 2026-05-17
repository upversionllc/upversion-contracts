export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const key = process.env.ANTHROPIC_API_KEY;
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { prompt, fetchUrl, maxTokens } = body || {};

    let pageContent = "";

    if (fetchUrl) {
      try {
        const pageRes = await fetch(fetchUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
          }
        });
        const html = await pageRes.text();
        const text = html
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim()
          .slice(0, 4000);
        pageContent = text;
      } catch(e) {
        pageContent = "[Could not fetch page: " + e.message + "]";
      }
    }

    const finalPrompt = pageContent
      ? `${prompt}\n\n--- SAM.GOV PAGE CONTENT ---\n${pageContent}`
      : prompt;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-7",
        max_tokens: maxTokens || 6000,
        messages: [{ role: "user", content: finalPrompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({
        debugError: JSON.stringify(data.error),
        fullResponse: JSON.stringify(data)
      });
    }

    res.status(200).json({ ...data, pageRead: !!pageContent, pagePreview: pageContent.slice(0, 100) });

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
