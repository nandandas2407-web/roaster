export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = params.path ? params.path.join('/') : '';
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    if (path === 'github-data') {
      return handleGithubData(request, env, headers);
    } else if (path === 'roast') {
      return handleRoast(request, env, headers);
    } else if (path === 'roast-generic') {
      return handleRoastGeneric(request, env, headers);
    }
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}

async function handleGithubData(request, env, headers) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');
  if (!username) {
    return new Response(JSON.stringify({ error: 'Username required' }), { status: 400, headers });
  }

  const ghHeaders = {
    'User-Agent': 'roaster0-app',
    'Accept': 'application/vnd.github.v3+json'
  };
  if (env.GITHUB_TOKEN) {
    ghHeaders['Authorization'] = `token ${env.GITHUB_TOKEN}`;
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, ghHeaders),
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, ghHeaders)
  ]);

  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers });
  }

  const user = await userRes.json();
  const repos = await reposRes.json();

  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const totalIssues = repos.reduce((sum, r) => sum + (r.open_issues_count || 0), 0);
  const languages = [...new Set(repos.filter(r => r.language).map(r => r.language))];

  return new Response(JSON.stringify({
    login: user.login,
    name: user.name || user.login,
    bio: user.bio || '',
    public_repos: user.public_repos,
    followers: user.followers,
    following: user.following,
    created_at: user.created_at,
    avatar_url: user.avatar_url,
    total_stars: totalStars,
    total_forks: totalForks,
    total_issues: totalIssues,
    languages,
    top_repos: repos.slice(0, 5).map(r => ({
      name: r.name,
      description: r.description || '',
      stargazers_count: r.stargazers_count,
      language: r.language,
      forks_count: r.forks_count
    }))
  }), { headers });
}

async function handleRoast(request, env, headers) {
  const { username, githubData } = await request.json();
  if (!username || !githubData) {
    return new Response(JSON.stringify({ error: 'Username and githubData required' }), { status: 400, headers });
  }

  const prompt = `You are a savage but funny roaster. Generate 8-10 brutal roasts for GitHub user "${username}".
GitHub stats: ${githubData.public_repos} repos, ${githubData.followers} followers, ${githubData.total_stars || 0} stars, languages: ${(githubData.languages || []).join(', ')}.
Bio: "${githubData.bio || 'No bio'}".
Top repos: ${(githubData.top_repos || []).map(r => `${r.name} (${r.stargazers_count}★)`).join(', ')}.
Format: JSON array of objects with "text" and "category" fields.`;

  const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const data = await result.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  try {
    const roasts = JSON.parse(text);
    return new Response(JSON.stringify({ roasts }), { headers });
  } catch {
    return new Response(JSON.stringify({ roasts: [{ text: text || 'Failed to generate roasts', category: 'general' }] }), { headers });
  }
}

async function handleRoastGeneric(request, env, headers) {
  const { username } = await request.json();
  if (!username) {
    return new Response(JSON.stringify({ error: 'Username required' }), { status: 400, headers });
  }

  const prompt = `Generate 6 funny roasts for GitHub user "${username}". Format: JSON array of objects with "text" and "category" fields.`;

  const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const data = await result.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  try {
    const roasts = JSON.parse(text);
    return new Response(JSON.stringify({ roasts }), { headers });
  } catch {
    return new Response(JSON.stringify({ roasts: [{ text: text || 'Failed to generate roasts', category: 'general' }] }), { headers });
  }
}
