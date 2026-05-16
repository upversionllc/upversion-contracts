module.exports = async function(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  var SAM_KEY = process.env.SAM_API_KEY;
  var results = [];
  var codes = ["541613", "611420", "541511", "424120"];
  
  var today = new Date();
  var past = new Date();
  past.setDate(past.getDate() - 90);
  
  function fmt(d) {
    return (d.getMonth()+1).toString().padStart(2,"0") + "/" + d.getDate().toString().padStart(2,"0") + "/" + d.getFullYear();
  }
  
  for (var i = 0; i < codes.length; i++) {
    try {
      var url = "https://api.sam.gov/opportunities/v2/search?api_key=" + SAM_KEY + "&naicsCode=" + codes[i] + "&limit=10&postedFrom=" + fmt(past) + "&postedTo=" + fmt(today) + "&active=true";
      var r = await fetch(url);
      var data = await r.json();
      if (data.opportunitiesData) results = results.concat(data.opportunitiesData);
    } catch(e) {}
  }
  
  res.status(200).json({ opportunities: results, total: results.length });
}
