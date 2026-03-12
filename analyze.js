const ANTHROPIC_KEY = "sk-ant-api03-TZdJClmeAMiQ6_jmLaoXqXnudbCr_yyYv0FyIsOkPW39tSYbK5HZwCBC3K3ML6M9PCThBf3ScH3ht_bLjwOmA-UKq6vAAA";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(204).end();

  const { match } = req.body;
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris"
  });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: "Tu es un analyste sportif expert en paris. Nous sommes le " + today + ", saison 2025-2026.\n\nMatch : " + match.home + " vs " + match.away + "\nCompetition : " + match.league + " - " + match.time + "\nCotes : 1=" + match.odds.home + " X=" + match.odds.draw + " 2=" + match.odds.away + "\n\nAnalyse en 5 sections :\n## Analyse des equipes\n## Facteurs determinants\n## Pronostic\n## Paris recommandes\n## Risques\n\nRappel jeu responsable en fin." }]
      })
    });
    const data = await r.json();
    const text = data.content?.map(b => b.text || "").join("") || "Analyse indisponible.";
    res.status(200).json({ analysis: text });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
