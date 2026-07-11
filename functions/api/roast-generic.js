function extractMetadata(html, url) {
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
    status: "success",
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = env.ALLOWED_ORIGIN || request.headers.get("Origin") || "*";

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { name, bio, links, images, intensity } = await request.json();

    const selectedIntensity = intensity || "MEDIUM";

    const analyzedLinks = [];
    if (Array.isArray(links)) {
      const linkPromises = links
        .filter((l) => l && typeof l === "string" && l.trim())
        .slice(0, 3)
        .map(async (url) => {
          let cleanUrl = url.trim();
          if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = "https://" + cleanUrl;
          try {
            const fetchRes = await fetch(cleanUrl, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
              signal: AbortSignal.timeout(5000),
            });
            if (!fetchRes.ok) {
              return { url: cleanUrl, title: cleanUrl, description: "Could not fetch content", textPreview: "", status: "failed" };
            }
            const html = await fetchRes.text();
            return extractMetadata(html, cleanUrl);
          } catch {
            return { url: cleanUrl, title: cleanUrl, description: "Link timeout or request blocked", textPreview: "", status: "failed" };
          }
        });
      analyzedLinks.push(...await Promise.all(linkPromises));
    }

    const contentParts = [];

    let prompt = `
Roast this individual's submitted passion/work/profile details.
Intensity level: ${selectedIntensity}

User Profile details:
- Submitted Name: ${name || "Anonymous Creator"}
- Self-described Bio / Passion: "${bio || "None provided"}"
`;

    if (analyzedLinks.length > 0) {
      prompt += "\nSubmitted Web Links and Crawled Meta Information:\n";
      analyzedLinks.forEach((link, idx) => {
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
      images.slice(0, 3).forEach((imgObj) => {
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

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No response from Gemini");

    const result = JSON.parse(text.trim());
    return Response.json({
      roast: result.roast,
      toast: result.toast,
      summary: {
        name: name || "Anonymous",
        bio: bio || "",
        links: analyzedLinks,
        imageCount: images ? images.length : 0,
        images: images || [],
      },
    }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: `Internal error in generic roasting engine: ${err.message}` }, { status: 500, headers: corsHeaders });
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
