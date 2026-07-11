export interface Env {
  GEMINI_API_KEY: string;
  GITHUB_TOKEN: string;
  ALLOWED_ORIGIN: string;
}

interface GitHubStats {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  accountAgeYears: number;
  createdAt: string;
  totalReposFetched: number;
  noDescriptionCount: number;
  graveyardCount: number;
  lazyNamedReposCount: number;
  lazyReposList: string[];
  mostUsedLanguage: string;
  languages: { [key: string]: number };
  starredReposCount: number;
  maxStars: number;
  totalStars: number;
  recentRepos: { name: string; description: string; language: string; stars: number; updatedAt: string }[];
}

function getCorsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data: unknown, status = 200, origin = "*"): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(origin),
    },
  });
}

function extractMetadata(html: string, url: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : "";

  const bodyText = html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = bodyText.split(/\s+/).slice(0, 300).join(" ");

  return {
    url,
    title: title || url,
    description: description || "No meta description found.",
    textPreview: words || "No readable content preview available.",
    status: "success" as const,
  };
}

async function handleGithubData(request: Request, env: Env, origin: string): Promise<Response> {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  if (!username || typeof username !== "string") {
    return json({ error: "Username is required" }, 400, origin);
  }

  try {
    const headers: Record<string, string> = {
      "User-Agent": "roast-my-github-app",
      "Accept": "application/vnd.github.v3+json",
    };

    if (env.GITHUB_TOKEN) {
      headers["Authorization"] = `token ${env.GITHUB_TOKEN}`;
    }

    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });

    if (userRes.status === 404) {
      return json({ error: "No such developer. Either they don't exist or they're too ashamed to have a GitHub. Try another." }, 404, origin);
    }

    if (userRes.status === 403 || userRes.status === 429) {
      return json({ error: "GitHub API rate limit reached! The crowd is roasting too hard. Try again in a few minutes." }, 429, origin);
    }

    if (!userRes.ok) {
      return json({ error: `GitHub API error: ${userRes.statusText}` }, 500, origin);
    }

    const userData = await userRes.json() as any;

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });

    if (!reposRes.ok) {
      return json({ error: `GitHub API repos fetch error: ${reposRes.statusText}` }, 500, origin);
    }

    const reposData = await reposRes.json() as any[];

    if (!Array.isArray(reposData)) {
      return json({ error: "Invalid repository data from GitHub" }, 500, origin);
    }

    const totalReposFetched = reposData.length;
    let noDescriptionCount = 0;
    let graveyardCount = 0;
    let lazyNamedReposCount = 0;
    const lazyReposList: string[] = [];
    const languagesMap: { [key: string]: number } = {};
    let starredReposCount = 0;
    let maxStars = 0;
    let totalStars = 0;

    const lazyKeywords = ["test", "asdf", "new-project", "untitled", "hello-world", "demo", "temp", "my-app", "example", "practice", "final", "project", "hw", "lab"];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentRepos = reposData.map((repo: any) => {
      const name = repo.name;
      const description = repo.description || "";
      const language = repo.language || "";
      const stars = repo.stargazers_count || 0;
      const updatedAt = repo.updated_at || "";

      if (!description.trim()) noDescriptionCount++;

      if (updatedAt) {
        const updateDate = new Date(updatedAt);
        if (updateDate < oneYearAgo) graveyardCount++;
      }

      const nameLower = name.toLowerCase();
      if (lazyKeywords.some(keyword => nameLower === keyword || nameLower.includes(keyword))) {
        lazyNamedReposCount++;
        if (lazyReposList.length < 5) lazyReposList.push(name);
      }

      if (language) languagesMap[language] = (languagesMap[language] || 0) + 1;

      if (stars > 0) {
        starredReposCount++;
        totalStars += stars;
        if (stars > maxStars) maxStars = stars;
      }

      return { name, description, language, stars, updatedAt };
    });

    const totalLanguages = Object.values(languagesMap).reduce((a, b) => a + b, 0);
    const languages: { [key: string]: number } = {};
    let mostUsedLanguage = "None";
    let maxLanguageCount = 0;

    if (totalLanguages > 0) {
      for (const [lang, count] of Object.entries(languagesMap)) {
        languages[lang] = Math.round((count / totalLanguages) * 100);
        if (count > maxLanguageCount) {
          maxLanguageCount = count;
          mostUsedLanguage = lang;
        }
      }
    }

    const createdAt = userData.created_at || new Date().toISOString();
    const accountAgeYears = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    const stats: GitHubStats = {
      username: userData.login,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url || "",
      bio: userData.bio || "",
      followers: userData.followers || 0,
      following: userData.following || 0,
      accountAgeYears,
      createdAt,
      totalReposFetched,
      noDescriptionCount,
      graveyardCount,
      lazyNamedReposCount,
      lazyReposList,
      mostUsedLanguage,
      languages,
      starredReposCount,
      maxStars,
      totalStars,
      recentRepos: recentRepos.slice(0, 10),
    };

    return json(stats, 200, origin);
  } catch (err: any) {
    return json({ error: `Internal error compiling profile metrics: ${err.message}` }, 500, origin);
  }
}

async function handleRoast(request: Request, env: Env, origin: string): Promise<Response> {
  try {
    const { stats, intensity } = await request.json() as { stats: GitHubStats; intensity: string };

    if (!stats || !stats.username) {
      return json({ error: "GitHub statistics are required to generate a roast" }, 400, origin);
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

    const geminiData = await geminiRes.json() as any;
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No response from Gemini");

    const result = JSON.parse(text.trim());
    return json(result, 200, origin);
  } catch (err: any) {
    return json({ error: `Internal error invoking roasting engine: ${err.message}` }, 500, origin);
  }
}

async function handleRoastGeneric(request: Request, env: Env, origin: string): Promise<Response> {
  try {
    const { name, bio, links, images, intensity } = await request.json() as any;

    const selectedIntensity = intensity || "MEDIUM";

    const analyzedLinks: any[] = [];
    if (Array.isArray(links)) {
      const linkPromises = links
        .filter((l: any) => l && typeof l === "string" && l.trim())
        .slice(0, 3)
        .map(async (url: string) => {
          let cleanUrl = url.trim();
          if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = "https://" + cleanUrl;
          try {
            const fetchRes = await fetch(cleanUrl, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
              signal: AbortSignal.timeout(5000),
            });
            if (!fetchRes.ok) {
              return { url: cleanUrl, title: cleanUrl, description: "Could not fetch content", textPreview: "", status: "failed" as const };
            }
            const html = await fetchRes.text();
            return extractMetadata(html, cleanUrl);
          } catch {
            return { url: cleanUrl, title: cleanUrl, description: "Link timeout or request blocked", textPreview: "", status: "failed" as const };
          }
        });
      analyzedLinks.push(...await Promise.all(linkPromises));
    }

    const contentParts: any[] = [];

    let prompt = `
Roast this individual's submitted passion/work/profile details.
Intensity level: ${selectedIntensity}

User Profile details:
- Submitted Name: ${name || "Anonymous Creator"}
- Self-described Bio / Passion: "${bio || "None provided"}"
`;

    if (analyzedLinks.length > 0) {
      prompt += "\nSubmitted Web Links and Crawled Meta Information:\n";
      analyzedLinks.forEach((link: any, idx: number) => {
        if (link.status === "success") {
          prompt += `- Link [${idx + 1}]: ${link.url}\n  Title: "${link.title}"\n  Meta Description: "${link.description}"\n  Text Content Snippet: "${link.textPreview}"\n`;
        } else {
          prompt += `- Link [${idx + 1}]: ${link.url} (Failed to crawl due to access restrictions or timeout)\n`;
        }
      });
    }

    prompt += `
Number of Images attached: ${images ? images.length : 0}

Guidelines & Strict Safety Constraints:
1. Provide a funny, highly creative roast based strictly on the user's submitted description, words, code, link information, and attached visual image vibes.
2. Adjust your sarcasm and cruelty based on the intensity level:
   - MILD: Teasing, light-hearted ribbing about their passion or workspace.
   - MEDIUM: Direct, witty, and targets obvious preposterous habits or bios.
   - NUCLEAR: Extreme roasting, highly critical of their choices, code, layout or aesthetics.
   - BRUTAL: Pure existential devastation. Deliver a soul-crushing critique of their creative or technical project, question their sanity, mock the hubris of their bio or portfolio, while strictly respecting the safety rules below (no physical/body mocking).
3. CRITICAL SAFETY GUARDRAIL: Under absolutely no circumstances are you allowed to mock, insult, or make reference to physical appearance, body shape, weight, race, ethnicity, gender, sexual orientation, age, disability, facial features, or other protected characteristics of individuals who may be visible in any uploaded images.
   - Instead, roast their choices, their context, their framing, their workspace background, the clutter on their desk, their chaotic folder structures, their pretentious bio words, or the vibe of their creative work.
   - Keep the humor sharp but good-natured, centered around their hobby, passion, technology choices, or general creator energy.
4. Your roast must be an array of 4 to 6 short, punchy, quotable single sentences (under 20 words each). Each bullet must reference specific items/words/concepts from their bio, the text on their links, or details from the image itself (like a specific item in the photo, a choice of color, or text in their bio). Never invent fake facts or names.
5. Sincere pivot (The Toast): provide one sincere, genuinely warm, earned compliment recognizing their real effort, courage in building/sharing, creativity, layout, or consistency. Do NOT make this sarcastic. It must be a heartwarming redemption.
`;

    contentParts.push({ text: prompt });

    if (Array.isArray(images)) {
      images.slice(0, 3).forEach((imgObj: any) => {
        if (imgObj && imgObj.dataUrl && imgObj.mimeType) {
          let base64Data = imgObj.dataUrl;
          if (base64Data.includes(",")) base64Data = base64Data.split(",")[1];
          contentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: imgObj.mimeType,
            },
          });
        }
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: contentParts }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                roast: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "An array of 4 to 6 savage, highly specific roast lines referencing actual details/vibes of what they submitted.",
                },
                toast: {
                  type: "STRING",
                  description: "One sincere, non-sarcastic, positive compliment recognizing their dedication, layout, skills, or adoption.",
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

    const geminiData = await geminiRes.json() as any;
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No response from Gemini");

    const result = JSON.parse(text.trim());
    return json({
      roast: result.roast,
      toast: result.toast,
      summary: {
        name: name || "Anonymous",
        bio: bio || "",
        links: analyzedLinks,
        imageCount: images ? images.length : 0,
        images: images || [],
      },
    }, 200, origin);
  } catch (err: any) {
    return json({ error: `Internal error in generic roasting engine: ${err.message}` }, 500, origin);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN || request.headers.get("Origin") || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }

    if (url.pathname === "/api/github-data" && request.method === "GET") {
      return handleGithubData(request, env, origin);
    }

    if (url.pathname === "/api/roast" && request.method === "POST") {
      return handleRoast(request, env, origin);
    }

    if (url.pathname === "/api/roast-generic" && request.method === "POST") {
      return handleRoastGeneric(request, env, origin);
    }

    return json({ error: "Not found" }, 404, origin);
  },
};
