export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const SAM_KEY = process.env.SAM_API_KEY;
  const naicsCodes = ["541613", "611420", "541511", "424120"];
  const allResults = [];

  const today = new Date();
  const past = new Date();
  past.setDate(past.getDate() - 90);
  const fmt = d => ${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${d.getFullYear()};

  for (const naics of naicsCodes) {
    try {
      const url = https://api.sam.gov/opportunities/v2/search?api_key=${SAM_KEY}&naicsCode=${naics}&limit=10&postedFrom=${fmt(past)}&postedTo=${fmt(today)}&active=true;
      const r = await fetch(url);
      const data = await r.json();
      if (data.opportunitiesData) allResults.push(...data.opportunitiesData);
    } catch(e) { console.error(naics, e.message); }
  }

  const seen = new Set();
  const deduped = allResults.filter(o => {
    const id = o.noticeId || o.solicitationNumber;
    if (seen.has(id)) return false;
    seen.add(id); return true;
  });

  res.status(200).json({ opportunities: deduped, total: deduped.length });
}
