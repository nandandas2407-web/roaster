export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN || request.headers.get("Origin") || "*";

    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (url.pathname === "/api/github-data" && request.method === "GET") {
        return await handleGithubData(url, env, corsHeaders);
      }
      if (url.pathname === "/api/roast" && request.method === "POST") {
        return await handleRoast(request, env, corsHeaders);
      }
      if (url.pathname === "/api/roast-generic" && request.method === "POST") {
        return await handleRoastGeneric(request, env, corsHeaders);
      }
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  },
};

async function handleGithubData(url, env, corsHeaders) {
  const username = url.searchParams.get("username");
  if (!username) return new Response(JSON.stringify({ error: "Username is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const headers = { "User-Agent": "roaster0-app", "Accept": "application/vnd.github.v3+json" };
  if (env.GITHUB_TOKEN) headers["Authorization"] = "token " + env.GITHUB_TOKEN;

  const userRes = await fetch("https://api.github.com/users/" + username, { headers });
  if (userRes.status === 404) return new Response(JSON.stringify({ error: "No such developer." }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (userRes.status === 403 || userRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!userRes.ok) return new Response(JSON.stringify({ error: "GitHub API error: " + userRes.statusText }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const userData = await userRes.json();
  const reposRes = await fetch("https://api.github.com/users/" + username + "/repos?sort=updated&per_page=100", { headers });
  if (!reposRes.ok) return new Response(JSON.stringify({ error: "Repos fetch error: " + reposRes.statusText }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const reposData = await reposRes.json();
  if (!Array.isArray(reposData)) return new Response(JSON.stringify({ error: "Invalid repo data" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  let noDescriptionCount = 0, graveyardCount = 0, lazyNamedReposCount = 0;
  const lazyReposList = [], languagesMap = {};
  let starredReposCount = 0, maxStars = 0, totalStars = 0;
  const lazyKeywords = ["test", "asdf", "new-project", "untitled", "hello-world", "demo", "temp", "my-app", "example", "practice", "final", "project", "hw", "lab"];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const recentRepos = reposData.map((repo) => {
    const name = repo.name, description = repo.description || "", language = repo.language || "", stars = repo.stargazers_count || 0, updatedAt = repo.updated_at || "";
    if (!description.trim()) noDescriptionCount++;
    if (updatedAt && new Date(updatedAt) < oneYearAgo) graveyardCount++;
    const nameLower = name.toLowerCase();
    if (lazyKeywords.some(k => nameLower === k || nameLower.includes(k))) { lazyNamedReposCount++; if (lazyReposList.length < 5) lazyReposList.push(name); }
    if (language) languagesMap[language] = (languagesMap[language] || 0) + 1;
    if (stars > 0) { starredReposCount++; totalStars += stars; if (stars > maxStars) maxStars = stars; }
    return { name, description, language, stars, updatedAt };
  });

  const totalLangs = Object.values(languagesMap).reduce((a, b) => a + b, 0);
  const languages = {};
  let mostUsedLanguage = "None", maxLangCount = 0;
  if (totalLangs > 0) {
    for (const [lang, count] of Object.entries(languagesMap)) {
      languages[lang] = Math.round((count / totalLangs) * 100);
      if (count > maxLangCount) { maxLangCount = count; mostUsedLanguage = lang; }
    }
  }

  const createdAt = userData.created_at || new Date().toISOString();
  const accountAgeYears = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  return new Response(JSON.stringify({
    username: userData.login, name: userData.name || userData.login, avatarUrl: userData.avatar_url || "",
    bio: userData.bio || "", followers: userData.followers || 0, following: userData.following || 0,
    accountAgeYears, createdAt, totalReposFetched: reposData.length, noDescriptionCount, graveyardCount,
    lazyNamedReposCount, lazyReposList, mostUsedLanguage, languages, starredReposCount, maxStars, totalStars,
    recentRepos: recentRepos.slice(0, 10),
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function handleRoast(request, env, corsHeaders) {
  const { stats, intensity } = await request.json();
  if (!stats || !stats.username) return new Response(JSON.stringify({ error: "Stats required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const level = intensity || "MEDIUM";
  const prompt = "Roast this developer's GitHub profile.\nIntensity: " + level + "\nUsername: " + stats.username + ", Name: " + (stats.name || "Anonymous") + ", Bio: \"" + (stats.bio || "None") + "\"\nFollowers: " + stats.followers + ", Following: " + stats.following + ", Account Age: " + stats.accountAgeYears.toFixed(1) + " years\nTotal Repos: " + stats.totalReposFetched + ", No Description: " + stats.noDescriptionCount + ", Graveyard: " + stats.graveyardCount + "\nLazy Named: " + stats.lazyNamedReposCount + " (" + (stats.lazyReposList.join(", ") || "none") + ")\nPrimary Language: " + stats.mostUsedLanguage + ", Languages: " + JSON.stringify(stats.languages) + "\nStars: " + stats.totalStars + " total, " + stats.maxStars + " max\nRecent Repos:\n" + stats.recentRepos.map(function(r) { return "- \"" + r.name + "\": lang=" + r.language + ", stars=" + r.stars + ", desc=\"" + (r.description || "none") + "\""; }).join("\n") + "\nRules:\n1. 4-6 short punchy roast lines under 20 words each, referencing real data.\n2. Intensity: MILD=friendly, MEDIUM=witty, NUCLEAR=savage, BRUTAL=existential crisis.\n3. End with one sincere non-sarcastic compliment (The Toast).";

  const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + env.GEMINI_API_KEY, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: { type: "OBJECT", properties: { roast: { type: "ARRAY", items: { type: "STRING" } }, toast: { type: "STRING" } }, required: ["roast", "toast"] },
      },
    }),
  });

  if (!geminiRes.ok) throw new Error("Gemini error: " + (await geminiRes.text()));
  const data = await geminiRes.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No Gemini response");
  return new Response(text.trim(), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function extractMetadata(html, url) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : "";
  const bodyText = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "").replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = bodyText.split(/\s+/).slice(0, 300).join(" ");
  return { url, title: title || url, description: description || "No meta description found.", textPreview: words || "No readable content.", status: "success" };
}

async function handleRoastGeneric(request, env, corsHeaders) {
  const { name, bio, links, images, intensity } = await request.json();
  const level = intensity || "MEDIUM";

  const analyzedLinks = [];
  if (Array.isArray(links)) {
    const promises = links.filter(l => l && typeof l === "string" && l.trim()).slice(0, 3).map(async (url) => {
      let cleanUrl = url.trim();
      if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = "https://" + cleanUrl;
      try {
        const res = await fetch(cleanUrl, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(5000) });
        if (!res.ok) return { url: cleanUrl, title: cleanUrl, description: "Failed", textPreview: "", status: "failed" };
        return extractMetadata(await res.text(), cleanUrl);
      } catch { return { url: cleanUrl, title: cleanUrl, description: "Timeout", textPreview: "", status: "failed" }; }
    });
    analyzedLinks.push(...await Promise.all(promises));
  }

  let prompt = "Roast this person's passion/project.\nIntensity: " + level + "\nName: " + (name || "Anonymous") + ", Bio: \"" + (bio || "None") + "\"";
  if (analyzedLinks.length > 0) {
    prompt += "\nLinks:\n";
    analyzedLinks.forEach((l, i) => { prompt += "- [" + (i+1) + "] " + l.url + ": \"" + l.title + "\" - \"" + l.description + "\"\n"; });
  }
  prompt += "\nImages: " + (images ? images.length : 0) + "\nRules:\n1. 4-6 short punchy roast lines under 20 words each.\n2. SAFETY: Never mock physical appearance, body, race, gender, age, disability.\n3. Roast their choices, workspace, bio, tech stack, creative vibe.\n4. End with one sincere compliment (The Toast).";

  const parts = [{ text: prompt }];
  if (Array.isArray(images)) {
    images.slice(0, 3).forEach(img => {
      if (img && img.dataUrl && img.mimeType) {
        let b64 = img.dataUrl.includes(",") ? img.dataUrl.split(",")[1] : img.dataUrl;
        parts.push({ inlineData: { data: b64, mimeType: img.mimeType } });
      }
    });
  }

  const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + env.GEMINI_API_KEY, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: { type: "OBJECT", properties: { roast: { type: "ARRAY", items: { type: "STRING" } }, toast: { type: "STRING" } }, required: ["roast", "toast"] },
      },
    }),
  });

  if (!geminiRes.ok) throw new Error("Gemini error: " + (await geminiRes.text()));
  const data = await geminiRes.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No Gemini response");
  const result = JSON.parse(text.trim());
  return new Response(JSON.stringify({ roast: result.roast, toast: result.toast, summary: { name: name || "Anonymous", bio: bio || "", links: analyzedLinks, imageCount: images ? images.length : 0, images: images || [] } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
