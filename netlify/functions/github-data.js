exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const params = new URLSearchParams(event.queryStringParameters || {});
  const username = params.get("username");
  if (!username) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Username is required" }) };
  }

  const ghHeaders = { "User-Agent": "roaster0-app", "Accept": "application/vnd.github.v3+json" };

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers: ghHeaders }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers: ghHeaders }),
    ]);

    if (userRes.status === 404) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "No such developer." }) };
    }
    if (!userRes.ok) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "GitHub API error: " + userRes.statusText }) };
    }

    const userData = await userRes.json();
    const reposData = await reposRes.json();
    if (!Array.isArray(reposData)) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Invalid repo data" }) };
    }

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        username: userData.login, name: userData.name || userData.login, avatarUrl: userData.avatar_url || "",
        bio: userData.bio || "", followers: userData.followers || 0, following: userData.following || 0,
        accountAgeYears, createdAt, totalReposFetched: reposData.length, noDescriptionCount, graveyardCount,
        lazyNamedReposCount, lazyReposList, mostUsedLanguage, languages, starredReposCount, maxStars, totalStars,
        recentRepos: recentRepos.slice(0, 10),
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
