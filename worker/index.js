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
      return Response.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
  },
};

async function handleGithubData(url, env, corsHeaders) {
  const username = url.searchParams.get("username");
  if (!username) return Response.json({ error: "Username is required" }, { status: 400, headers: corsHeaders });

  const headers = { "User-Agent": "roaster0-app", "Accept": "application/vnd.github.v3+json" };
  if (env.GITHUB_TOKEN) headers["Authorization"] = `token ${env.GITHUB_TOKEN}`;

  const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
  if (userRes.status === 404) return Response.json({ error: "No such developer." }, { status: 404, headers: corsHeaders });
  if (userRes.status === 403 || userRes.status === 429) return Response.json({ error: "Rate limit reached." }, { status: 429, headers: corsHeaders });
  if (!userRes.ok) return Response.json({ error: `GitHub API error: ${userRes.statusText}` }, { status: 500, headers: corsHeaders });

  const userData = await userRes.json();
  const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });
  if (!reposRes.ok) return Response.json({ error: `Repos fetch error: ${reposRes.statusText}` }, { status: 500, headers: corsHeaders });

  const reposData = await reposRes.json();
  if (!Array.isArray(reposData)) return Response.json({ error: "Invalid repo data" }, { status: 500, headers: corsHeaders });

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

  return Response.json({
    username: userData.login, name: userData.name || userData.login, avatarUrl: userData.avatar_url || "",
    bio: userData.bio || "", followers: userData.followers || 0, following: userData.following || 0,
    accountAgeYears, createdAt, totalReposFetched: reposData.length, noDescriptionCount, graveyardCount,
    lazyNamedReposCount, lazyReposList, mostUsedLanguage, languages, starredReposCount, maxStars, totalStars,
    recentRepos: recentRepos.slice(0, 10),
  }, { headers: corsHeaders });
}

async function handleRoast(request, env, corsHeaders) {
  const { stats, intensity } = await request.json();
  if (!stats || !stats.username) return Response.json({ error: "Stats required" }, { status: 400, headers: corsHeaders });

  const level = intensity || "MEDIUM";
  const prompt = `Roast this developer's GitHub profile.
Intensity: ${level}
Username: ${stats.username}, Name: ${stats.name || "Anonymous"}, Bio: "${stats.bio || "None"}"
Followers: ${stats.followers}, Following: ${stats.following}, Account Age: ${stats.accountAgeYears.toFixed(1)} years
Total Repos: ${stats.totalReposFetched}, No Description: ${stats.noDescriptionCount}, Graveyard: ${stats.graveyardCount}
Lazy Named: ${stats.lazyNamedReposCount} (${stats.lazyReposList.join(", ") || "none"})
Primary Language: ${stats.mostUsedLanguage}, Languages: ${JSON.stringify(stats.languages)}
Stars: ${stats.totalStars} total, ${stats.maxStars} max
Recent Repos:
${stats.recentRepos.map(r => `- "${r.name}": lang=${r.language}, stars=${r.stars}, desc="${r.description || "none"}"`).join("\n")}
Rules:
1. 4-6 short punchy roast lines under 20 words each, referencing real data.
2. Intensity: MILD=friendly, MEDIUM=witty, NUCLEAR=savage, BRUTAL=existential crisis.
3. End with one sincere non-sarcastic compliment (The Toast).`;

  const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: { type: "OBJECT", properties: { roast: { type: "ARRAY", items: { type: "STRING" } }, toast: { type: "STRING" } }, required: ["roast", "toast"] },
      },
    }),
  });

  if (!geminiRes.ok) throw new Error(`Gemini error: ${await geminiRes.text()}`);
  const data = await geminiRes.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No Gemini response");
  return Response.json(JSON.parse(text.trim()), { headers: corsHeaders });
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

  let prompt = `Roast this person's passion/project.
Intensity: ${level}
Name: ${name || "Anonymous"}, Bio: "${bio || "None"}"`;
  if (analyzedLinks.length > 0) {
    prompt += "\nLinks:\n";
    analyzedLinks.forEach((l, i) => { prompt += `- [${i+1}] ${l.url}: "${l.title}" - "${l.description}"\n`; });
  }
  prompt += `\nImages: ${images?.length || 0}
Rules:
1. 4-6 short punchy roast lines under 20 words each.
2. SAFETY: Never mock physical appearance, body, race, gender, age, disability.
3. Roast their choices, workspace, bio, tech stack, creative vibe.
4. End with one sincere compliment (The Toast).`;

  const parts = [{ text: prompt }];
  if (Array.isArray(images)) {
    images.slice(0, 3).forEach(img => {
      if (img?.dataUrl && img?.mimeType) {
        let b64 = img.dataUrl.includes(",") ? img.dataUrl.split(",")[1] : img.dataUrl;
        parts.push({ inlineData: { data: b64, mimeType: img.mimeType } });
      }
    });
  }

  const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: { type: "OBJECT", properties: { roast: { type: "ARRAY", items: { type: "STRING" } }, toast: { type: "STRING" } }, required: ["roast", "toast"] },
      },
    }),
  });

  if (!geminiRes.ok) throw new Error(`Gemini error: ${await geminiRes.text()}`);
  const data = await geminiRes.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No Gemini response");
  const result = JSON.parse(text.trim());
  return Response.json({ roast: result.roast, toast: result.toast, summary: { name: name || "Anonymous", bio: bio || "", links: analyzedLinks, imageCount: images?.length || 0, images: images || [] } }, { headers: corsHeaders });
}
