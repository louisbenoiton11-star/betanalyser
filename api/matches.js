const API_KEY = "c337cbf0c92878d290ee4a73daac3611";

const LEAGUE_IDS = {
  "UEFA Champions League": 2,
  "UEFA Europa League": 3,
  "UEFA Conference League": 848,
  "Premier League": 39,
  "La Liga": 140,
  "Ligue 1": 61,
  "Bundesliga": 78,
  "Serie A": 135,
  "Eredivisie": 88,
  "Liga Portugal": 94
};

module.exports = async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const requested = req.query.leagues
    ? req.query.leagues.split(",")
    : ["UEFA Champions League", "UEFA Europa League"];

  const today = new Date().toISOString().split("T")[0];
  const allMatches = [];

  for (const league of requested) {
    const leagueId = LEAGUE_IDS[league.trim()];
    if (!leagueId) continue;
    try {
      const url = "https://v3.football.api-sports.io/fixtures?date=" + today + "&league=" + leagueId + "&season=2025";
      const r = await fetch(url, { headers: { "const ANTHROPIC_KEY = "sk-ant-api03-TZdJClmeAMiQ6_jmLaoXqXnudbCr_yyYv0FyIsOkPW39tSYbK5HZwCBC3K3ML6M9PCThBf3ScH3ht_bLjwOmA-UKq6vAAA";

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
} } });
      const data = await r.json();
      for (const f of (data.response || [])) {
        const time = new Date(f.fixture.date).toLocaleTimeString("fr-FR", {
          hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris"
        });
        const s = f.fixture.status.short;
        allMatches.push({
          id: String(f.fixture.id),
          league: league.trim(),
          home: f.teams.home.name,
          away: f.teams.away.name,
          time: time,
          status: s,
          score: (s === "1H" || s === "2H" || s === "HT" || s === "FT")
            ? { home: f.goals.home, away: f.goals.away } : null
        });
      }
    } catch(e) { console.error(league, e.message); }
  }

  allMatches.sort((a, b) => a.time.localeCompare(b.time));
  res.status(200).json({ matches: allMatches });
}
