exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };

  try {
    const { match } = JSON.parse(event.body);
    const today = new Date().toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris"
    });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.sk-ant-api03-TZdJClmeAMiQ6_jmLaoXqXnudbCr_yyYv0FyIsOkPW39tSYbK5HZwCB C3K3ML6M9PCThBf3ScH3ht_bLjwOmA-UKq6vAAA,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: `Tu es un analyste sportif expert en paris. Nous sommes le ${today}, saison 2025-2026.

Match : ${match.home} vs ${match.away}
Compétition : ${match.league} · Heure : ${match.time}
Cotes indicatives : 1=${match.odds.home} X=${match.odds.draw} 2=${match.odds.away}

Analyse en 5 sections :
## 🔍 Analyse des équipes
## 📊 Facteurs déterminants
## 🎯 Pronostic (avec niveau de confiance)
## 💡 Paris recommandés (1X2, BTTS, over/under...)
## ⚠️ Risques

Termine par un rappel jeu responsable.` }]
      })
    });

    const data = await res.json();
    const text = data.content?.map(b => b.text || "").join("") || "Analyse indisponible.";
    return { statusCode: 200, headers, body: JSON.stringify({ analysis: text }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
