exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { stats, intensity } = JSON.parse(event.body || "{}");
    if (!stats || !stats.username) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Stats required" }) };
    }

    const level = intensity || "MEDIUM";
    const prompt = `Roast this developer's GitHub profile.
Intensity: ${level}
Username: ${stats.username}, Name: ${stats.name || "Anonymous"}, Bio: "${stats.bio || "None"}"
Followers: ${stats.followers}, Following: ${stats.following}, Account Age: ${stats.accountAgeYears ? stats.accountAgeYears.toFixed(1) : "Unknown"} years
Total Repos: ${stats.totalReposFetched}, No Description: ${stats.noDescriptionCount}, Graveyard: ${stats.graveyardCount}
Lazy Named: ${stats.lazyNamedReposCount} (${(stats.lazyReposList || []).join(", ") || "none"})
Primary Language: ${stats.mostUsedLanguage}, Languages: ${JSON.stringify(stats.languages)}
Stars: ${stats.totalStars} total, ${stats.maxStars} max
Rules:
1. 4-6 short punchy roast lines under 20 words each, referencing real data.
2. Intensity: MILD=friendly, MEDIUM=witty, NUCLEAR=savage, BRUTAL=existential crisis.
3. End with one sincere non-sarcastic compliment (The Toast).`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: { roast: { type: "ARRAY", items: { type: "STRING" } }, toast: { type: "STRING" } },
              required: ["roast", "toast"],
            },
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Gemini error: " + errText }) };
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "No Gemini response" }) };
    }

    return { statusCode: 200, headers, body: text.trim() };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
