const FD_KEY = "415b120c6c9b4dc28a6d35bed6f0d9a7";

const LEAGUE_CODES = {
  "UEFA Champions League": "CL",
  "UEFA Europa League": "EL",
  "UEFA Conference League": "ECL",
  "Premier League": "PL",
  "La Liga": "PD",
  "Ligue 1": "FL1",
  "Bundesliga": "BL1",
  "Serie A": "SA",
  "Eredivisie": "DED",
  "Liga Portugal": "PPL",
};
const CODE_TO_NAME = Object.fromEntries(Object.entries(LEAGUE_CODES).map(([k,v]) => [v,k]));

exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  try {
    const requested = (event.queryStringParameters?.leagues || "PL,CL").split(",");
    const codes = requested.map(l => LEAGUE_CODES[l.trim()] || l.trim()).filter(Boolean);
    const today = new Date().toISOString().split("T")[0];
    const allMatches = [];

    await Promise.all(codes.map(async (code) => {
      try {
        const res = await fetch(
          `https://api.football-data.org/v4/competitions/${code}/matches?dateFrom=${today}&dateTo=${today}`,
          { headers: { "X-Auth-Token": FD_KEY } }
        );
        if (!res.ok) return;
        const data = await res.json();
        (data.matches || []).forEach(m => {
          allMatches.push({
            id: String(m.id),
            league: CODE_TO_NAME[code] || code,
            home: m.homeTeam.shortName || m.homeTeam.name,
            away: m.awayTeam.shortName || m.awayTeam.name,
            time: new Date(m.utcDate).toLocaleTimeString("fr-FR", {
              hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris"
            }),
            status: m.status,
            score: m.score?.fullTime || null,
          });
        });
      } catch(e) { console.error(code, e.message); }
    }));

    allMatches.sort((a, b) => a.time.localeCompare(b.time));
    return { statusCode: 200, headers, body: JSON.stringify({ matches: allMatches }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
