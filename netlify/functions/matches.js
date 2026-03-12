const API_FOOTBALL_KEY = “c337cbf0c92878d290ee4a73daac3611”;

// IDs des compétitions sur api-football.com
const LEAGUE_IDS = {
“UEFA Champions League”: 2,
“UEFA Europa League”: 3,
“UEFA Conference League”: 848,
“Premier League”: 39,
“La Liga”: 140,
“Ligue 1”: 61,
“Bundesliga”: 78,
“Serie A”: 135,
“Eredivisie”: 88,
“Liga Portugal”: 94,
};

exports.handler = async (event) => {
const headers = { “Access-Control-Allow-Origin”: “*”, “Content-Type”: “application/json” };
try {
const requested = (event.queryStringParameters?.leagues || “UEFA Champions League,UEFA Europa League”).split(”,”);
const today = new Date().toISOString().split(“T”)[0];
const allMatches = [];

```
await Promise.all(requested.map(async (league) => {
  const leagueId = LEAGUE_IDS[league.trim()];
  if (!leagueId) return;
  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}&league=${leagueId}&season=2025`,
      { headers: { "x-apisports-key": API_FOOTBALL_KEY } }
    );
    const data = await res.json();
    (data.response || []).forEach(f => {
      allMatches.push({
        id: String(f.fixture.id),
        league: league.trim(),
        home: f.teams.home.name,
        away: f.teams.away.name,
        time: new Date(f.fixture.date).toLocaleTimeString("fr-FR", {
          hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris"
        }),
        status: f.fixture.status.short,
        score: f.fixture.status.short === "FT" || f.fixture.status.short === "1H" || f.fixture.status.short === "2H"
          ? { home: f.goals.home, away: f.goals.away }
          : null,
      });
    });
  } catch(e) { console.error(league, e.message); }
}));

allMatches.sort((a, b) => a.time.localeCompare(b.time));
return { statusCode: 200, headers, body: JSON.stringify({ matches: allMatches }) };
```

} catch (err) {
return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
}
};
