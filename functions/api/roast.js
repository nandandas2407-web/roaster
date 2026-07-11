export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = env.ALLOWED_ORIGIN || request.headers.get("Origin") || "*";

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { stats, intensity } = await request.json();

    if (!stats || !stats.username) {
      return Response.json({ error: "GitHub statistics are required to generate a roast" }, { status: 400, headers: corsHeaders });
    }

    const selectedIntensity = intensity || "MEDIUM";

    const prompt = `
Roast this developer's GitHub profile and repository data.
Intensity level: ${selectedIntensity}

User Profile Details:
- Username: ${stats.username}
- Name: ${stats.name || "Anonymous"}
- Bio: "${stats.bio || "None"}"
- Followers: ${stats.followers}
- Following: ${stats.following}
- Account Age: ${stats.accountAgeYears.toFixed(1)} years (Created: ${stats.createdAt})

Repository Statistics:
- Total public repositories analyzed: ${stats.totalReposFetched}
- Repositories without descriptions: ${stats.noDescriptionCount} (out of ${stats.totalReposFetched})
- Graveyard Count (repos untouched/unpushed for over 1 year): ${stats.graveyardCount}
- Lazily/generic-named repositories: ${stats.lazyNamedReposCount} (including names like: ${stats.lazyReposList.join(", ") || "none"})
- Primary/Most-used language: ${stats.mostUsedLanguage || "None"}
- Language breakdown: ${JSON.stringify(stats.languages)}
- Total Stars: ${stats.totalStars}
- Maximum stars on a single repo: ${stats.maxStars}

Recent / Notable Repositories:
${stats.recentRepos.map(r => `- Repo "${r.name}": language="${r.language || "none"}", stars=${r.stars}, description="${r.description || "no description"}", updated="${r.updatedAt}"`).join("\n")}

Guidelines:
1. Provide a funny, creative roast based strictly on this developer's public coding habits and stats.
2. Adjust your sarcasm and cruelty based on the intensity level:
   - MILD: Affectionate, friendly ribbing. Gentle teasing about their choice of languages or inactive repos.
   - MEDIUM: Sharp, witty, and cuts straight to their bad coding habits, funny repo names, and missing descriptions.
   - NUCLEAR: Full savage. Show no mercy. Absolutely destroy their abandoned repos, lazy names, star counts, and questionable commit energy, but keep it centered strictly on their code.
   - BRUTAL: Soul-crushing existential crisis. Utterly unhinged, devastating and dangerously savage. Question their career choices, mock how they live with their commit habits, and point out why their code represents a form of psychological chaos, while remaining safe and centered purely on their work/code metadata.
3. Your roast must be an array of 4 to 6 short, punchy, quotable single sentences (under 20 words each). Each bullet must reference real specific data (e.g. referencing actual repository names like "${stats.recentRepos[0]?.name || "their repos"}", their zero-star habits, their graveyard of untouched projects, or their bio). Never invent fake names or facts.
4. Sincere pivot (The Toast): provide one sincere, genuinely warm, earned compliment recognizing their persistence, clean dedication, exploration of multiple technologies, or early creation. Do NOT make this sarcastic. It must be a heartwarming redemption.
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                roast: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "An array of 4 to 6 savage, highly specific roast lines referencing actual data from their GitHub profile and repos.",
                },
                toast: {
                  type: "STRING",
                  description: "One sincere, non-sarcastic, positive compliment recognizing their dedication, skills, consistency, or adoption, based on actual data.",
                },
              },
              required: ["roast", "toast"],
            },
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error: ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No response from Gemini");

    const result = JSON.parse(text.trim());
    return Response.json(result, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: `Internal error invoking roasting engine: ${err.message}` }, { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions(context) {
  const origin = context.env.ALLOWED_ORIGIN || "*";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
