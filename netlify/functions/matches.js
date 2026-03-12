const API_KEY = “c337cbf0c92878d290ee4a73daac3611”;

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
“Liga Portugal”: 94
};

exports.handler = async function(event) {
const headers = {
“Access-Control-Allow-Origin”: “*”,
“Content-Type”: “application/json”
};

try {
const requested = (event.queryStringParameters && event.queryStringParameters.leagues)
? event.queryStringParameters.leagues.split(”,”)
: [“UEFA Champions League”, “UEFA Europa League”];

```
const today = new Date().toISOString().split("T")[0];
const allMatches = [];

for (const league of requested) {
  const leagueId = LEAGUE_IDS[league.trim()];
  if (!leagueId) continue;
  try {
    const url = "https://v3.football.api-sports.io/fixtures?date=" + today + "&league=" + leagueId + "&season=2025";
    const res = await fetch(url, {
      headers: { "x-apisports-key": API_KEY }
    });
    const data = await res.json();
    const fixtures = data.response || [];
    for (const f of fixtures) {
      const date = new Date(f.fixture.date);
      const time = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Paris"
      });
      const status = f.fixture.status.short;
      const isLive = status === "1H" || status === "2H" || status === "HT";
      const isDone = status === "FT";
      allMatches.push({
        id: String(f.fixture.id),
        league: league.trim(),
        home: f.teams.home.name,
        away: f.teams.away.name,
        time: time,
        status: status,
        score: (isLive || isDone) ? { home: f.goals.home, away: f.goals.away } : null
      });
    }
  } catch(e) {
    console.error(league, e.message);
  }
}

allMatches.sort(function(a, b) {
  return a.time.localeCompare(b.time);
});

return {
  statusCode: 200,
  headers: headers,
  body: JSON.stringify({ matches: allMatches })
};
```

} catch(err) {
return {
statusCode: 500,
headers: headers,
body: JSON.stringify({ error: err.message })
};
}
};
