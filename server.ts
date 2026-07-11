import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { GitHubStats, RoastIntensity, GenericSubmission, GenericDataSummary } from "./src/types.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" })); // Increase limit for Base64 images
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Helper function to crawl meta-tags and preview text
function extractMetadata(html: string, url: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || 
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : "";

  // Strip scripts, styles, and html tags to get raw body text up to 300 words
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
    status: "success" as const
  };
}

// Initialize Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// API endpoint to fetch and parse GitHub statistics
app.get("/api/github-data", async (req, res) => {
  const { username } = req.query;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const headers: HeadersInit = {
      'User-Agent': 'roast-my-github-app',
      'Accept': 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    
    if (userRes.status === 404) {
      return res.status(404).json({ error: "No such developer. Either they don't exist or they're too ashamed to have a GitHub. Try another." });
    }

    if (userRes.status === 403 || userRes.status === 429) {
      return res.status(429).json({ error: "GitHub API rate limit reached! The crowd is roasting too hard. Try again in a few minutes." });
    }

    if (!userRes.ok) {
      return res.status(500).json({ error: `GitHub API error: ${userRes.statusText}` });
    }

    const userData = await userRes.json();

    // Fetch repositories (up to 100)
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });
    
    if (!reposRes.ok) {
      return res.status(500).json({ error: `GitHub API repos fetch error: ${reposRes.statusText}` });
    }

    const reposData = await reposRes.json();

    if (!Array.isArray(reposData)) {
      return res.status(500).json({ error: "Invalid repository data from GitHub" });
    }

    // Aggregate stats
    const totalReposFetched = reposData.length;
    let noDescriptionCount = 0;
    let graveyardCount = 0;
    let lazyNamedReposCount = 0;
    const lazyReposList: string[] = [];
    const languagesMap: { [key: string]: number } = {};
    let starredReposCount = 0;
    let maxStars = 0;
    let totalStars = 0;

    const lazyKeywords = ['test', 'asdf', 'new-project', 'untitled', 'hello-world', 'demo', 'temp', 'my-app', 'example', 'practice', 'final', 'project', 'hw', 'lab'];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentRepos = reposData.map((repo: any) => {
      const name = repo.name;
      const description = repo.description || "";
      const language = repo.language || "";
      const stars = repo.stargazers_count || 0;
      const updatedAt = repo.updated_at || "";

      if (!description.trim()) {
        noDescriptionCount++;
      }

      // Check graveyard (not updated in > 1 year)
      if (updatedAt) {
        const updateDate = new Date(updatedAt);
        if (updateDate < oneYearAgo) {
          graveyardCount++;
        }
      }

      // Check lazy named repos
      const nameLower = name.toLowerCase();
      if (lazyKeywords.some(keyword => nameLower === keyword || nameLower.includes(keyword))) {
        lazyNamedReposCount++;
        if (lazyReposList.length < 5) {
          lazyReposList.push(name);
        }
      }

      // Languages counting
      if (language) {
        languagesMap[language] = (languagesMap[language] || 0) + 1;
      }

      // Star metrics
      if (stars > 0) {
        starredReposCount++;
        totalStars += stars;
        if (stars > maxStars) {
          maxStars = stars;
        }
      }

      return {
        name,
        description,
        language,
        stars,
        updatedAt
      };
    });

    // Calculate language percentages
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

    // Account age
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
      recentRepos: recentRepos.slice(0, 10), // Take top 10 most recent for context
    };

    return res.json(stats);
  } catch (err: any) {
    console.error("Error fetching GitHub statistics:", err);
    return res.status(500).json({ error: `Internal error compiling profile metrics: ${err.message}` });
  }
});

// API endpoint to generate roast using Gemini
app.post("/api/roast", async (req, res) => {
  const { stats, intensity } = req.body as { stats: GitHubStats; intensity: RoastIntensity };

  if (!stats || !stats.username) {
    return res.status(400).json({ error: "GitHub statistics are required to generate a roast" });
  }

  const selectedIntensity = intensity || 'MEDIUM';

  try {
    const prompt = `
Roast this developer's GitHub profile and repository data.
Intensity level: ${selectedIntensity}

User Profile Details:
- Username: ${stats.username}
- Name: ${stats.name || 'Anonymous'}
- Bio: "${stats.bio || 'None'}"
- Followers: ${stats.followers}
- Following: ${stats.following}
- Account Age: ${stats.accountAgeYears.toFixed(1)} years (Created: ${stats.createdAt})

Repository Statistics:
- Total public repositories analyzed: ${stats.totalReposFetched}
- Repositories without descriptions: ${stats.noDescriptionCount} (out of ${stats.totalReposFetched})
- Graveyard Count (repos untouched/unpushed for over 1 year): ${stats.graveyardCount}
- Lazily/generic-named repositories: ${stats.lazyNamedReposCount} (including names like: ${stats.lazyReposList.join(', ') || 'none'})
- Primary/Most-used language: ${stats.mostUsedLanguage || 'None'}
- Language breakdown: ${JSON.stringify(stats.languages)}
- Total Stars: ${stats.totalStars}
- Maximum stars on a single repo: ${stats.maxStars}

Recent / Notable Repositories:
${stats.recentRepos.map(r => `- Repo "${r.name}": language="${r.language || 'none'}", stars=${r.stars}, description="${r.description || 'no description'}", updated="${r.updatedAt}"`).join('\n')}

Guidelines:
1. Provide a funny, creative roast based strictly on this developer's public coding habits and stats.
2. Adjust your sarcasm and cruelty based on the intensity level:
   - MILD: Affectionate, friendly ribbing. Gentle teasing about their choice of languages or inactive repos.
   - MEDIUM: Sharp, witty, and cuts straight to their bad coding habits, funny repo names, and missing descriptions.
   - NUCLEAR: Full savage. Show no mercy. Absolutely destroy their abandoned repos, lazy names, star counts, and questionable commit energy, but keep it centered strictly on their code.
   - BRUTAL: Soul-crushing existential crisis. Utterly unhinged, devastating and dangerously savage. Question their career choices, mock how they live with their commit habits, and point out why their code represents a form of psychological chaos, while remaining safe and centered purely on their work/code metadata.
3. Your roast must be an array of 4 to 6 short, punchy, quotable single sentences (under 20 words each). Each bullet must reference real specific data (e.g. referencing actual repository names like "${stats.recentRepos[0]?.name || 'their repos'}", their zero-star habits, their graveyard of untouched projects, or their bio). Never invent fake names or facts.
4. Sincere pivot (The Toast): provide one sincere, genuinely warm, earned compliment recognizing their persistence, clean dedication, exploration of multiple technologies, or early creation. Do NOT make this sarcastic. It must be a heartwarming redemption.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roast: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 4 to 6 savage, highly specific roast lines referencing actual data from their GitHub profile and repos."
            },
            toast: {
              type: Type.STRING,
              description: "One sincere, non-sarcastic, positive compliment recognizing their dedication, skills, consistency, or adoption, based on actual data."
            }
          },
          required: ["roast", "toast"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const result = JSON.parse(text.trim());
    return res.json(result);
  } catch (err: any) {
    console.error("Error generating roast with Gemini:", err);
    return res.status(500).json({ error: `Internal error invoking roasting engine: ${err.message}` });
  }
});

// API endpoint to generate a generic roast from text, links, and/or images
app.post("/api/roast-generic", async (req, res) => {
  const { name, bio, links, images, intensity } = req.body;
  
  const selectedIntensity = intensity || 'MEDIUM';

  try {
    // 1. Resolve & Crawl Links in parallel
    const analyzedLinks: any[] = [];
    if (Array.isArray(links)) {
      const linkPromises = links
        .filter(l => l && typeof l === 'string' && l.trim())
        .slice(0, 3)
        .map(async (url) => {
          let cleanUrl = url.trim();
          if (!/^https?:\/\//i.test(cleanUrl)) {
            cleanUrl = "https://" + cleanUrl;
          }
          try {
            // Using global fetch with timeout
            const fetchRes = await fetch(cleanUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
              signal: AbortSignal.timeout(5000)
            });
            if (!fetchRes.ok) {
              return { url: cleanUrl, title: cleanUrl, description: "Could not fetch content", textPreview: "", status: "failed" as const };
            }
            const html = await fetchRes.text();
            return extractMetadata(html, cleanUrl);
          } catch (err) {
            return { url: cleanUrl, title: cleanUrl, description: "Link timeout or request blocked", textPreview: "", status: "failed" as const };
          }
        });
      analyzedLinks.push(...await Promise.all(linkPromises));
    }

    // 2. Build Gemini Multimodal Contents Array
    const contentParts: any[] = [];
    
    let prompt = `
Roast this individual's submitted passion/work/profile details.
Intensity level: ${selectedIntensity}

User Profile details:
- Submitted Name: ${name || 'Anonymous Creator'}
- Self-described Bio / Passion: "${bio || 'None provided'}"
`;

    if (analyzedLinks.length > 0) {
      prompt += `\nSubmitted Web Links and Crawled Meta Information:\n`;
      analyzedLinks.forEach((link, idx) => {
        if (link.status === 'success') {
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

    // Add base64 images as multimodal blocks if present
    if (Array.isArray(images)) {
      images.slice(0, 3).forEach((imgObj) => {
        if (imgObj && imgObj.dataUrl && imgObj.mimeType) {
          let base64Data = imgObj.dataUrl;
          if (base64Data.includes(",")) {
            base64Data = base64Data.split(",")[1];
          }
          contentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: imgObj.mimeType
            }
          });
        }
      });
    }

    // Call Gemini Model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentParts,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roast: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 4 to 6 savage, highly specific roast lines referencing actual details/vibes of what they submitted."
            },
            toast: {
              type: Type.STRING,
              description: "One sincere, non-sarcastic, positive compliment recognizing their dedication, layout, skills, or adoption."
            }
          },
          required: ["roast", "toast"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const result = JSON.parse(text.trim());
    return res.json({
      roast: result.roast,
      toast: result.toast,
      summary: {
        name: name || 'Anonymous',
        bio: bio || '',
        links: analyzedLinks,
        imageCount: images ? images.length : 0,
        images: images || []
      }
    });

  } catch (err: any) {
    console.error("Error generating generic roast:", err);
    return res.status(500).json({ error: `Internal error in generic roasting engine: ${err.message}` });
  }
});

// Setup Vite dev server or serve production build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production files from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
