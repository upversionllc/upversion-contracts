export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  
  const SAM_KEY = process.env.SAM_API_KEY;
  const naicsCodes = ["541613", "611420", "541511", "424120"];
  const allResults = [];

  function formatDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return ${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${d.getFullYear()};
  }

  for (const naics of naicsCodes) {
    try {
      const params = new URLSearchParams({
        api_key: SAM_KEY, naicsCode: naics,
        limit: "10", postedFrom: formatDate(90),
        postedTo: formatDate(0), active: "true",
      });
      const r = await fetch(https://api.sam.gov/opportunities/v2/search?${params});
      const data = await r.json();
      if (data.opportunitiesData) allResults.push(...data.opportunitiesData);
    } catch(e) { console.error(e); }
  }

  const seen = new Set();
  const deduped = allResults.filter(o => {
    const id = o.noticeId || o.solicitationNumber;
    if (seen.has(id)) return false;
    seen.add(id); return true;
  });

  res.status(200).json({ opportunities: deduped });
}
