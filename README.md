<div align="center">

# roaster0

### The Bureau of Unsolicited Code Opinions




**Enter a GitHub username or submit your passion project. Get destroyed by AI. Then redeemed.**

<br>

![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini-3.5-4285F4?style=for-the-badge)

<br>

**Live App:** [roaster0.netlify.app](https://roaster0.netlify.app)

</div>

---

## What is roaster0?

roaster0 is  an AI-powered web application that roasts GitHub profiles and passion projects using Google's Gemini AI. It analyzes your public coding habits, repository data, language choices, and commit patterns to deliver savage, hyper-specific comedic critiques -- followed by a sincere, heartwarming compliment called **"The Toast."**

The app features a distinctive **physical ledger paper aesthetic** with hand-coded SVG illustrations, procedural Web Audio sound effects, 3D card tilt interactions, and downloadable roast cards rendered on HTML5 Canvas.

### How It Works in 30 Seconds

1. Enter a GitHub username (or switch to "Roast Anything" mode)
2. Choose your roast severity: MILD, MEDIUM, NUCLEAR, or BRUTAL
3. Watch as roast lines appear one by one with dramatic stamp animations
4. Listen to the AI-narrated roast via Web Speech API
5. Receive "The Toast" -- a genuine, earned compliment
6. Download a stylized roast card or share the results

---

## Table of Contents

- [Features](#features)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Roast Intensity Levels](#roast-intensity-levels)
- [Sound Design](#sound-design)
- [Card Generation](#card-generation)
- [Browser Support](#browser-support)
- [Performance](#performance)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

---

## Features

### Core Functionality

| Feature | Description |
|---|---|
| **GitHub Profile Roasting** | Enter any public GitHub username and receive a data-driven, savage roast analyzing repos, languages, commit habits, and more |
| **Roast Anything Mode** | Submit a name, bio, web links, and/or images for a multimodal AI-powered roast of any passion or project |
| **Four Intensity Levels** | Choose from MILD (friendly), MEDIUM (witty), NUCLEAR (savage), or BRUTAL (existential crisis) |
| **The Toast** | Every roast ends with a sincere, earned compliment recognizing real effort and dedication |

### User Experience

| Feature | Description |
|---|---|
| **Animated Roast Reveal** | Roast lines appear one by one with dramatic rubber-stamp animations and 1.8s comedic pauses |
| **Audio Narration** | Web Speech API reads each roast line aloud with adjustable pacing and pitch by intensity level |
| **Procedural Sound Effects** | Custom Web Audio synthesizer generates tactile click, slam, and ambient hum sounds |
| **3D Card Tilt** | Interactive mouse-tracking parallax effect on the main scorecard with spring physics |
| **Heat Gauge** | Real-time animated gauge tracking roast progression from 0 to 135 degrees |
| **Surprise Me** | Randomly selects from 24 notable developers (including Linus Torvalds, Dan Abramov, and more) |
| **Download Roast Card** | Generate a stylized 800x1000 PNG card with ledger paper aesthetic |
| **Copy to Clipboard** | Share roast results as formatted text to any platform |
| **Audio Toggle** | Mute/unmute all sounds with persistent localStorage preference |

### Technical Features

| Feature | Description |
|---|---|
| **Multimodal AI Analysis** | Accepts text, URLs, and images for comprehensive roasting |
| **Link Crawling** | Automatically fetches and extracts metadata (title, description, text preview) from submitted URLs |
| **Image Compression** | Client-side image resizing to 1024px and JPEG compression at 75% quality before upload |
| **Safety Guardrails** | AI is instructed to never mock physical appearance, body, race, gender, age, or disability |
| **Responsive Design** | Works seamlessly on desktop, tablet, and mobile devices |
| **Type-Safe** | Full TypeScript coverage across the entire codebase |

---

## Live Demo

Try roasting these popular developers:

| Developer | GitHub Username | Notable For |
|---|---|---|
| Linus Torvalds | `torvalds` | Linux kernel creator |
| Dan Abramov | `gaearon` | React core team |
| Ben Halpern | `benhalpern` | Founder of DEV |
| Shadcn | `shadcn` | shadcn/ui creator |
| Taylor Otwell | `taylorotwell` | Laravel creator |
| Ryan Dahl | `ry` | Node.js/Deno creator |

**Visit:** [roaster0.netlify.app](https://roaster0.netlify.app)

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI framework with hooks and concurrent features |
| **TypeScript** | 5.8 | Type safety and developer experience |
| **Tailwind CSS** | 4.x | Utility-first styling via `@tailwindcss/vite` |
| **Vite** | 6.x | Fast development server and production bundler |
| **Motion** | 12.x | Spring-based animations and gesture handling (Framer Motion successor) |
| **Lucide React** | 0.546 | Lightweight, consistent icon library |

### Backend

| Technology | Purpose |
|---|---|
| **Cloudflare Workers** | Serverless API backend (production) |
| **Express 4** | Backend API server (local development) |
| **Google Gemini 2.0 Flash** | AI-powered roast generation with structured JSON output |
| **GitHub REST API v3** | Fetching user profiles and repository data |

### APIs & Browser Features

| Feature | Purpose |
|---|---|
| **Web Audio API** | Procedural sound synthesis (no audio files needed) |
| **Web Speech API** | Text-to-speech audio narration with voice selection |
| **HTML5 Canvas** | Downloadable roast card generation |
| **Drag and Drop API** | Image upload with visual feedback |
| **Clipboard API** | One-click copy to clipboard |

---

## Architecture

```
                    +-------------------+
                    |   User's Browser  |
                    |  (React SPA)      |
                    +--------+----------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+     +-------------v-----------+
    |   Netlify CDN     |     |  Cloudflare Workers     |
    | (Static Assets)   |     |  (API Backend)          |
    |                   |     |                         |
    | - index.html      |     | - /api/github-data      |
    | - React bundle    |     | - /api/roast            |
    | - CSS/JS assets   |     | - /api/roast-generic    |
    +-------------------+     +------------+------------+
                                       |
                          +------------+------------+
                          |                         |
                +---------v---------+   +-----------v-----------+
                |   GitHub API      |   |   Google Gemini API   |
                | (User Profiles)   |   |   (AI Roast Engine)   |
                +-------------------+   +-----------------------+
```

### Local Development Architecture

```
                    +-------------------+
                    |   User's Browser  |
                    +--------+----------+
                             |
                    +--------v----------+
                    |   Express Server  |
                    |   (Port 3000)     |
                    |                   |
                    | - Vite Middleware  |
                    | - API Routes      |
                    +-------------------+
```

---

## Prerequisites

- **Node.js** -- Version 18.0 or higher (LTS recommended)
- **npm** -- Version 9.0 or higher
- **Gemini API Key** -- Obtain from [Google AI Studio](https://aistudio.google.com/apikey)
- **GitHub Token** (optional) -- For higher API rate limits ([Create one](https://github.com/settings/tokens))
- **Cloudflare Account** -- For deploying the Worker backend (free tier available)
- **Netlify Account** -- For deploying the frontend (free tier available)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/nandandas2407-web/roaster.git
cd roaster

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (see Environment Variables below)

# 4. Start development server
npm run dev

# 5. Open in browser
# Navigate to http://localhost:3000
```

---

## Environment Variables

### Local Development (`.env.local`)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key for AI roast generation |
| `APP_URL` | No | The URL where the app is hosted (default: `http://localhost:3000`) |
| `GITHUB_TOKEN` | No | GitHub personal access token to bypass rate limits (5,000 requests/hour vs 60) |
| `VITE_API_URL` | No | Backend API URL for Cloudflare Worker (leave empty for same-origin) |

**Example `.env.local`:**

```env
GEMINI_API_KEY="AIzaSy..."
APP_URL="http://localhost:3000"
GITHUB_TOKEN="ghp_..."
VITE_API_URL=""
```

### Cloudflare Worker (via Dashboard)

| Variable | Type | Description |
|---|---|---|
| `GEMINI_API_KEY` | Secret | Your Google Gemini API key |
| `GITHUB_TOKEN` | Secret | GitHub personal access token |
| `ALLOWED_ORIGIN` | Plain Text | CORS allowed origin (e.g., `https://roaster0.netlify.app`) |

### Netlify (via Dashboard)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Your Cloudflare Worker URL (e.g., `https://roaster-api.xxx.workers.dev`) |

---

## Project Structure

```
roaster/
|-- index.html                     # Entry HTML with page title
|-- package.json                   # Dependencies and npm scripts
|-- package-lock.json              # Locked dependency versions
|-- tsconfig.json                  # TypeScript configuration
|-- vite.config.ts                 # Vite + Tailwind + React config
|-- netlify.toml                   # Netlify build config + SPA redirect
|-- server.ts                      # Express backend (local dev only)
|-- .env.example                   # Environment variable template
|-- .gitignore                     # Git ignore rules
|-- README.md                      # This file
|
|-- src/                           # Frontend source code
|   |-- main.tsx                   # React app entry point
|   |-- App.tsx                    # Main application component (1880+ lines)
|   |-- types.ts                   # TypeScript interfaces and types
|   |-- index.css                  # Tailwind imports + custom CSS animations
|   |
|   |-- utils/                     # Utility modules
|       |-- canvasHelper.ts        # HTML5 Canvas roast card generator (435 lines)
|       |-- synth.ts               # Web Audio API sound synthesizer (228 lines)
|
|-- worker/                        # Cloudflare Worker backend
|   |-- index.mjs                  # Worker script (ES module format)
|
|-- assets/                        # Static assets directory
```

---

## How It Works

### GitHub Mode

1. **User submits a GitHub username** and selects a roast intensity level (MILD/MEDIUM/NUCLEAR/BRUTAL)

2. **Server fetches GitHub data** via the GitHub REST API:
   - `GET /users/{username}` -- User profile (name, bio, followers, following, created_at)
   - `GET /users/{username}/repos?sort=updated&per_page=100` -- All public repositories

3. **Server computes derived statistics:**
   - **Graveyard count** -- Repos not updated in over 1 year
   - **Lazy-named repos** -- Repos matching keywords like `test`, `demo`, `asdf`, `untitled`, `hello-world`, `temp`, `my-app`, `example`, `practice`, `final`, `project`, `hw`, `lab`
   - **Language distribution** -- Percentage breakdown of all languages used
   - **Star metrics** -- Total stars, max stars on a single repo, number of starred repos
   - **Account age** -- Years since account creation

4. **Gemini AI generates the roast** using a carefully crafted prompt with:
   - Complete profile and repository data
   - Intensity-specific guidelines (MILD through BRUTAL)
   - Structured JSON output schema requiring `roast` (array of 4-6 lines) and `toast` (string)

5. **Frontend displays the roast** with:
   - Staggered stamp animations (1.8s delay between lines)
   - Real-time heat gauge progression
   - Optional audio narration via Web Speech API
   - Procedural sound effects for each stamp

6. **The Toast** appears after all roast lines, delivering a sincere, data-driven compliment

### Roast Anything Mode

1. **User submits** a name, bio/passion description, up to 3 web links, and up to 3 images

2. **Links are crawled** in parallel:
   - Automatic `https://` prefix if missing
   - 5-second timeout per link
   - Extracts: `<title>`, `<meta name="description">`, first 300 words of visible text

3. **Images are compressed** client-side:
   - Resized to max 1024px dimension
   - Converted to JPEG at 75% quality
   - Base64 encoded for transmission

4. **All materials are sent to Gemini** as a multimodal prompt:
   - Text content (name, bio, link metadata)
   - Inline base64 images (up to 3)
   - Safety guardrails preventing physical appearance mocking

5. **Roast and Toast** are generated and displayed with the same animated reveal

---

## API Reference

### `GET /api/github-data`

Fetches and aggregates GitHub statistics for a given username.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `username` | string | Yes | The GitHub username to analyze |

**Example Request:**

```
GET https://roaster-api.xxx.workers.dev/api/github-data?username=torvalds
```

**Example Response:**

```json
{
  "username": "torvalds",
  "name": "Linus Torvalds",
  "avatarUrl": "https://avatars.githubusercontent.com/u/1024025",
  "bio": "",
  "followers": 311278,
  "following": 0,
  "accountAgeYears": 14.85,
  "createdAt": "2011-09-03T15:26:22Z",
  "totalReposFetched": 12,
  "noDescriptionCount": 0,
  "graveyardCount": 0,
  "lazyNamedReposCount": 0,
  "lazyReposList": [],
  "mostUsedLanguage": "C",
  "languages": { "C": 75, "Shell": 15, "Python": 10 },
  "starredReposCount": 3,
  "maxStars": 15000,
  "totalStars": 25000,
  "recentRepos": [
    {
      "name": "linux",
      "description": "Linux kernel source tree",
      "language": "C",
      "stars": 15000,
      "updatedAt": "2026-07-10T12:00:00Z"
    }
  ]
}
```

**Error Responses:**

| Status | Error | Cause |
|---|---|---|
| 400 | `Username is required` | Missing or empty username parameter |
| 404 | `No such developer.` | GitHub user does not exist |
| 429 | `Rate limit reached.` | GitHub API rate limit exceeded (wait and retry) |

---

### `POST /api/roast`

Generates a roast for a GitHub profile using Gemini AI.

**Request Body:**

```json
{
  "stats": {
    "username": "torvalds",
    "name": "Linus Torvalds",
    "avatarUrl": "https://avatars.githubusercontent.com/u/1024025",
    "bio": "",
    "followers": 311278,
    "following": 0,
    "accountAgeYears": 14.85,
    "createdAt": "2011-09-03T15:26:22Z",
    "totalReposFetched": 12,
    "noDescriptionCount": 0,
    "graveyardCount": 0,
    "lazyNamedReposCount": 0,
    "lazyReposList": [],
    "mostUsedLanguage": "C",
    "languages": { "C": 75 },
    "starredReposCount": 3,
    "maxStars": 15000,
    "totalStars": 25000,
    "recentRepos": []
  },
  "intensity": "NUCLEAR"
}
```

**Response:**

```json
{
  "roast": [
    "311K followers and you still code like nobody is watching.",
    "Your commit messages read like diary entries from a hermit.",
    "Twelve repos? That's not a portfolio, that's a storage unit.",
    "Zero following? Even your code has trust issues.",
    "C as your primary language in 2026 is a personality trait."
  ],
  "toast": "Your relentless dedication to building Linux changed the entire world. That's not hyperbole -- it's literally fact."
}
```

---

### `POST /api/roast-generic`

Generates a roast from submitted text, links, and images using Gemini multimodal.

**Request Body:**

```json
{
  "name": "Jane",
  "bio": "I love building indie games and pixel art",
  "links": ["https://mygame.dev", "https://twitter.com/janedev"],
  "images": [
    {
      "dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "mimeType": "image/jpeg"
    }
  ],
  "intensity": "BRUTAL"
}
```

**Response:**

```json
{
  "roast": [
    "Indie games AND pixel art? Pick a struggle, Jane.",
    "Your portfolio link looks like it was designed in 2019.",
    "Calling it a 'side hustle' doesn't make it less of a hobby.",
    "Two links? Your online presence is more minimal than your code comments.",
    "The 'passion project' pipeline claims another victim."
  ],
  "toast": "Building indie games takes real courage. You're creating entire worlds from scratch -- that's genuinely impressive.",
  "summary": {
    "name": "Jane",
    "bio": "I love building indie games and pixel art",
    "links": [
      {
        "url": "https://mygame.dev",
        "title": "Jane's Game Dev Portfolio",
        "description": "Indie game developer",
        "textPreview": "Welcome to my portfolio...",
        "status": "success"
      }
    ],
    "imageCount": 1,
    "images": []
  }
}
```

---

## Deployment

The app is deployed as two separate services:

| Service | Platform | URL |
|---|---|---|
| **Frontend** (React) | Netlify | [roaster0.netlify.app](https://roaster0.netlify.app) |
| **Backend** (API) | Cloudflare Workers | `https://roaster-api.nandandas2407.workers.dev` |

### Deploy the Backend (Cloudflare Workers)

**Option A: Via Cloudflare Dashboard**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages** -> **Create** -> **Worker**
2. Name it `roaster-api`
3. Click **Edit code** -> paste the contents of `worker/index.mjs`
4. Click **Deploy**
5. Go to **Settings** -> **Variables and Secrets** and add:
   - `GEMINI_API_KEY` (Secret)
   - `GITHUB_TOKEN` (Secret)
   - `ALLOWED_ORIGIN` = `https://roaster0.netlify.app` (Plain Text)

**Option B: Via Cloudflare API (curl)**

```bash
# Set your credentials
ACCOUNT_ID="your-account-id"
API_TOKEN="your-api-token"

# Deploy the Worker
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/scripts/roaster-api" \
  -H "Authorization: Bearer $API_TOKEN" \
  -F 'metadata={"main_module":"index.mjs","compatibility_date":"2024-12-01","bindings":[{"type":"plain_text","name":"ALLOWED_ORIGIN","text":"https://roaster0.netlify.app"},{"type":"secret_text","name":"GEMINI_API_KEY","text":"YOUR_KEY"},{"type":"secret_text","name":"GITHUB_TOKEN","text":"YOUR_TOKEN"}]}' \
  -F 'index.mjs=@worker/index.mjs;type=application/javascript+module'
```

**Option C: Via Wrangler CLI**

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GITHUB_TOKEN
npx wrangler deploy
```

### Deploy the Frontend (Netlify)

1. Go to [Netlify](https://app.netlify.com) -> **Add new site** -> **Import an existing project**
2. Connect your GitHub repository: `nandandas2407-web/roaster`
3. Configure build settings:
   - **Branch:** `main`
   - **Build command:** `vite build`
   - **Publish directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL` = `https://roaster-api.nandandas2407.workers.dev`
5. Click **Deploy site**

### Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
npm run dev
# Open http://localhost:3000
```

The Express server handles both the frontend (via Vite middleware) and API routes locally.

---

## Roast Intensity Levels

| Level | Emoji | Description | Audio | Narration |
|---|---|---|---|---|
| **MILD** | 😊 | Affectionate, friendly ribbing. Gentle teasing about languages or inactive repos. | Light click, soft stamp | Fast, upbeat (1.05x speed, 1.15x pitch) |
| **MEDIUM** | 😏 | Sharp, witty, cuts straight to bad habits, funny repo names, and missing descriptions. | Standard stamp | Normal (1.0x speed, 1.0x pitch) |
| **NUCLEAR** | ☢️ | Utter destruction. No mercy for abandoned repos, lazy names, or zero-star habits. | Heavy slam + white noise | Slower, deeper (0.92x speed, 0.85x pitch) |
| **BRUTAL** | 💀 | Soul-crushing existential crisis. Unhinged, devastating, 18+ only. Questions career choices and code philosophy. | Maximum impact + ambient hum wobble | Slowest, lowest (0.82x speed, 0.65x pitch) |

---

## Sound Design

The app features a custom **Web Audio API synthesizer** (`src/utils/synth.ts`) that generates all sound effects procedurally in the browser -- no audio files needed.

### Sound Effects

| Sound | Trigger | Technical Details |
|---|---|---|
| **Click** | Button hover | Sine wave, 1200Hz to 800Hz exponential sweep, 50ms duration |
| **Analysis Start** | Roast initiation | Dual-oscillator sweep: sine 110-440Hz + triangle 220-880Hz, 1.2s |
| **Stamp** | Each roast line reveal | Sub thump (sine 150-45Hz), mechanical clank (triangle), optional white noise for NUCLEAR/BRUTAL |
| **Ambient Hum** | NUCLEAR/BRUTAL modes | Background drone: sine 80Hz (MILD), triangle 60Hz (NUCLEAR), sawtooth 55Hz with 3Hz vibrato (BRUTAL) |

### Intensity-Based Audio

- **MILD:** Light stamp (0.15 volume, 0.25s decay), no ambient hum
- **MEDIUM:** Standard stamp (0.3 volume, 0.4s decay), gentle hum
- **NUCLEAR:** Heavy stamp (0.45 volume, 0.6s decay), white noise sizzle, ominous 60Hz hum
- **BRUTAL:** Maximum stamp (0.6 volume, 0.8s decay), white noise sizzle, 55Hz sawtooth with vibrato, card shakes

---

## Card Generation

The downloadable roast card is rendered entirely on **HTML5 Canvas** (`src/utils/canvasHelper.ts`) -- no server-side rendering needed.

### Card Specifications

| Property | Value |
|---|---|
| **Dimensions** | 800 x 1000 pixels |
| **Format** | PNG (lossless) |
| **Style** | Physical ledger paper with grid lines, double borders, margin rules |
| **Font Stack** | Kanit (display), Inter (body), JetBrains Mono (monospace) |

### Card Contents

1. **Header** -- "ROASTER0" title with red accent
2. **Profile Section** -- Avatar (CORS-loaded or initials fallback), name, handle, bio
3. **Intensity Stamp** -- Rotated, double-bordered severity badge
4. **Stats Grid** -- Account age, total repos, graveyard count, primary language
5. **Roast Lines** -- Numbered badges with each roast line
6. **The Toast** -- Teal-accented card frame with sincere compliment
7. **Footer** -- Attribution and scan completion notice

---

## Browser Support

| Browser | Status |
|---|---|
| Chrome 90+ | Full support |
| Firefox 90+ | Full support |
| Safari 15+ | Full support |
| Edge 90+ | Full support |
| Mobile Chrome | Full support |
| Mobile Safari | Full support |

### Required Browser APIs

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) -- Sound synthesis
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) -- Text-to-speech
- [HTML5 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) -- Card generation
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) -- Network requests
- [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) -- Image uploads

---

## Performance

- **Bundle Size:** ~150KB gzipped (React + Tailwind + Motion)
- **Largest Contentful Paint:** < 2s on 4G
- **Time to Interactive:** < 3s on desktop
- **API Response Time:** < 500ms (GitHub data), < 5s (AI roast generation)
- **Image Compression:** Client-side JPEG at 75% quality, max 1024px dimension
- **Rate Limiting:** 60 requests/hour (unauthenticated) or 5,000 requests/hour (with GitHub token)

---

## Security

### API Keys

- **Never commit API keys** to the repository
- Use `.env.local` for local development (already in `.gitignore`)
- Use Cloudflare Worker secrets for production
- Use Netlify environment variables for the frontend

### CORS

The Cloudflare Worker enforces CORS via the `ALLOWED_ORIGIN` environment variable. Only requests from the configured origin are allowed.

### Rate Limiting

- GitHub API: 60 requests/hour (unauthenticated), 5,000 requests/hour (with token)
- Gemini API: Varies by plan (free tier available)

### Content Safety

The AI is instructed with strict safety guardrails:
- Never mock physical appearance, body shape, weight, race, ethnicity, gender, sexual orientation, age, or disability
- Roast only choices, context, framing, workspace, bio, tech stack, and creative vibe
- BRUTAL mode requires age confirmation (18+)

---

## Troubleshooting

### "Assessment Failed - Failed to fetch"

**Cause:** The `VITE_API_URL` environment variable is not set on Netlify.

**Fix:**
1. Go to Netlify -> Site configuration -> Environment variables
2. Add `VITE_API_URL` = `https://roaster-api.nandandas2407.workers.dev`
3. Redeploy the site

### "Assessment Failed - Unexpected token '<'"

**Cause:** The API URL is returning HTML instead of JSON (likely a 404 or wrong URL).

**Fix:**
1. Verify your Worker is deployed: visit `https://roaster-api.xxx.workers.dev/api/github-data?username=torvalds`
2. Ensure it returns JSON, not HTML
3. Check that the Worker code was deployed correctly

### "GitHub API rate limit reached"

**Cause:** Too many requests to the GitHub API without authentication.

**Fix:**
1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens)
2. Add it as `GITHUB_TOKEN` in your environment variables
3. Redeploy

### No audio playing

**Cause:** Browser autoplay policy blocks audio before user interaction.

**Fix:** Click anywhere on the page first, then use the audio controls. The Web Audio API requires a user gesture to start.

### Images not uploading

**Cause:** File too large or wrong format.

**Fix:** Use PNG, JPG, or WebP files under 10MB. Images are automatically compressed client-side.

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Run** the linter: `npm run lint`
5. **Test** locally: `npm run dev`
6. **Commit** your changes: `git commit -m 'Add amazing feature'`
7. **Push** to the branch: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

### Development Guidelines

- Follow existing code conventions
- Add TypeScript types for new features
- Keep components focused and small
- Test on both desktop and mobile
- Update README if adding new features

---

## Credits

- **AI Engine:** [Google Gemini](https://ai.google.dev/) for roast generation
- **Icons:** [Lucide React](https://lucide.dev/) for consistent, lightweight icons
- **Animations:** [Motion](https://motion.dev/) for spring-based animations
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- **Fonts:** [Inter](https://rsms.me/inter/), [Kanit](https://fonts.google.com/specimen/Kanit), [JetBrains Mono](https://www.jetbrains.com/labs/mono/)

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with TypeScript, Tailwind CSS, and a healthy dose of sarcasm.**

[roaster0.netlify.app](https://roaster0.netlify.app)

</div>
