export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  const origin = env.ALLOWED_ORIGIN || request.headers.get("Origin") || "*";

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (!username || typeof username !== "string") {
    return Response.json({ error: "Username is required" }, { status: 400, headers: corsHeaders });
  }

  try {
    const headers = {
      "User-Agent": "roast-my-github-app",
      "Accept": "application/vnd.github.v3+json",
    };

    if (env.GITHUB_TOKEN) {
      headers["Authorization"] = `token ${env.GITHUB_TOKEN}`;
    }

    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });

    if (userRes.status === 404) {
      return Response.json({ error: "No such developer. Either they don't exist or they're too ashamed to have a GitHub. Try another." }, { status: 404, headers: corsHeaders });
    }

    if (userRes.status === 403 || userRes.status === 429) {
      return Response.json({ error: "GitHub API rate limit reached! The crowd is roasting too hard. Try again in a few minutes." }, { status: 429, headers: corsHeaders });
    }

    if (!userRes.ok) {
      return Response.json({ error: `GitHub API error: ${userRes.statusText}` }, { status: 500, headers: corsHeaders });
    }

    const userData = await userRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });

    if (!reposRes.ok) {
      return Response.json({ error: `GitHub API repos fetch error: ${reposRes.statusText}` }, { status: 500, headers: corsHeaders });
    }

    const reposData = await reposRes.json();

    if (!Array.isArray(reposData)) {
      return Response.json({ error: "Invalid repository data from GitHub" }, { status: 500, headers: corsHeaders });
    }

    const totalReposFetched = reposData.length;
    let noDescriptionCount = 0;
    let graveyardCount = 0;
    let lazyNamedReposCount = 0;
    const lazyReposList = [];
    const languagesMap = {};
    let starredReposCount = 0;
    let maxStars = 0;
    let totalStars = 0;

    const lazyKeywords = ["test", "asdf", "new-project", "untitled", "hello-world", "demo", "temp", "my-app", "example", "practice", "final", "project", "hw", "lab"];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentRepos = reposData.map((repo) => {
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
    const languages = {};
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

    const stats = {
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

    return Response.json(stats, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: `Internal error compiling profile metrics: ${err.message}` }, { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions(context) {
  const origin = context.env.ALLOWED_ORIGIN || "*";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
