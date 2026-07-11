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
    const { name, bio, links, images, intensity } = JSON.parse(event.body || "{}");
    const level = intensity || "MEDIUM";

    const analyzedLinks = [];
    if (Array.isArray(links)) {
      const promises = links.filter(l => l && typeof l === "string" && l.trim()).slice(0, 3).map(async (rawUrl) => {
        let url = rawUrl.trim();
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        try {
          const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow", signal: AbortSignal.timeout(8000) });
          if (!res.ok) return { url, title: url, description: "Failed", textPreview: "", status: "failed" };
          const html = await res.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : url;
          const bodyText = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          return { url, title, description: "Fetched", textPreview: bodyText.split(/\s+/).slice(0, 300).join(" ") || "No content", status: "success" };
        } catch {
          return { url, title: url, description: "Timeout", textPreview: "", status: "failed" };
        }
      });
      analyzedLinks.push(...await Promise.all(promises));
    }

    let prompt = `Roast this person's passion/project.
Intensity: ${level}
Name: ${name || "Anonymous"}, Bio: "${bio || "None"}"`;
    if (analyzedLinks.length > 0) {
      prompt += "\nLinks:\n";
      analyzedLinks.forEach((l, i) => { prompt += `- [${i + 1}] ${l.url}: "${l.title}" - "${l.description}"\n`; });
    }
    prompt += `
Images: ${images ? images.length : 0}
Rules:
1. 4-6 short punchy roast lines under 20 words each.
2. SAFETY: Never mock physical appearance, body, race, gender, age, disability.
3. Roast their choices, workspace, bio, tech stack, creative vibe.
4. End with one sincere compliment (The Toast).`;

    const parts = [{ text: prompt }];
    if (Array.isArray(images)) {
      images.slice(0, 3).forEach(img => {
        if (img && img.dataUrl && img.mimeType) {
          const b64 = img.dataUrl.includes(",") ? img.dataUrl.split(",")[1] : img.dataUrl;
          parts.push({ inlineData: { data: b64, mimeType: img.mimeType } });
        }
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
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

    const result = JSON.parse(text.trim());
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        roast: result.roast,
        toast: result.toast,
        summary: { name: name || "Anonymous", bio: bio || "", links: analyzedLinks, imageCount: images ? images.length : 0, images: images || [] },
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
