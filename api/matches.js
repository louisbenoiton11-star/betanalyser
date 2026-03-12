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

export default async function handler(req, res) {
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
      const r = await fetch(url, { headers: { "x-apisports-key": API_KEY } });
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
