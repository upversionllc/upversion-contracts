export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  const key = process.env.SAM_API_KEY;
  const codes = ["541613", "611420", "541511", "424120"];
  const results = [];
  
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - 90);
  
  const pad = n => String(n).padStart(2, "0");
  const fmt = d => pad(d.getMonth()+1)+"/"+pad(d.getDate())+"/"+d.getFullYear();
  
  for (const code of codes) {
    try {
      const url = "https://api.sam.gov/prod/opportunities/v2/search"
        + "?api_key=" + key
        + "&naicsCode=" + code
        + "&limit=10"
        + "&postedFrom=" + fmt(past)
        + "&postedTo=" + fmt(now)
        + "&active=true";
      const r = await fetch(url);
      const data = await r.json();
      if (data.opportunitiesData) results.push(...data.opportunitiesData);
    } catch(e) { console.error(code, e.message); }
  }
  
  res.status(200).json({ opportunities: results, total: results.length });
}
