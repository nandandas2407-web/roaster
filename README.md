<div align="center">

# roaster0

**A fun, AI-powered web app that roasts any GitHub profile or passion project with savage, hyper-specific humor -- then redeems it with a genuine, earned compliment.**

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [GitHub Mode](#github-mode)
  - [Roast Anything Mode](#roast-anything-mode)
- [API Endpoints](#api-endpoints)
- [Roast Intensity Levels](#roast-intensity-levels)
- [Sound Design](#sound-design)
- [Card Generation](#card-generation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

roaster0 is an interactive web application that leverages Google's Gemini AI to deliver savage, hyper-specific roasts based on a developer's public GitHub activity -- or any passion, project, or creative endeavor you throw at it. The app analyzes repository data, coding habits, language choices, and more to craft personalized comedic critiques, followed by a sincere, heartwarming compliment (called "The Toast").

The app features a distinctive **physical ledger paper aesthetic** with hand-coded SVG illustrations, procedural Web Audio sound effects, 3D card tilt interactions, and downloadable roast cards rendered on HTML5 Canvas.

---

## Features

### Core Functionality
- **GitHub Profile Roasting** -- Enter any public GitHub username and receive a data-driven, savage roast analyzing their repos, languages, commit habits, and more
- **Roast Anything Mode** -- Submit a name, bio, web links, and/or images for a multimodal AI-powered roast of any passion or project
- **Four Roast Intensity Levels** -- Choose from MILD, MEDIUM, NUCLEAR, or BRUTAL severity
- **The Toast** -- Every roast ends with a sincere, earned compliment recognizing real effort and dedication

### User Experience
- **Animated Roast Reveal** -- Roast lines appear one by one with dramatic stamp animations
- **Audio Narration** -- Web Speech API reads each roast line aloud with adjustable pacing by intensity
- **Procedural Sound Effects** -- Custom Web Audio synthesizer generates tactile click, slam, and ambient hum sounds
- **3D Card Tilt** -- Interactive mouse-tracking parallax effect on the main scorecard
- **Heat Gauge** -- Real-time animated gauge tracking roast progression
- **Surprise Me** -- Randomly selects a notable developer to roast
- **Download Roast Card** -- Generate a stylized PNG card of your roast results
- **Copy to Clipboard** -- Share roast results as formatted text

### Technical Features
- **Multimodal AI Analysis** -- Accepts text, URLs, and images for comprehensive roasting
- **Link Crawling** -- Automatically fetches and extracts metadata from submitted URLs
- **Image Compression** -- Client-side image resizing and JPEG compression before upload
- **Responsive Design** -- Works on desktop and mobile devices
- **Type-Safe** -- Full TypeScript coverage across the codebase

---

## Demo

Visit the live app and try roasting a popular developer like `torvalds`, `gaearon`, or `shadcn`!

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI framework with hooks and concurrent features |
| **TypeScript 5.8** | Type safety and developer experience |
| **Tailwind CSS 4** | Utility-first styling via `@tailwindcss/vite` |
| **Vite 6** | Fast development server and production bundler |
| **Express 4** | Backend API server for GitHub data and Gemini calls |
| **Google Gemini API** | AI-powered roast generation via `@google/genai` |
| **Motion (Framer Motion)** | Spring-based animations and gesture handling |
| **Lucide React** | Lightweight, consistent icon library |
| **Web Audio API** | Procedural sound synthesis |
| **Web Speech API** | Text-to-speech audio narration |
| **HTML5 Canvas** | Downloadable roast card generation |

---

## Prerequisites

- **Node.js** -- Version 18.0 or higher (LTS recommended)
- **npm** -- Version 9.0 or higher
- **Gemini API Key** -- Obtain from [Google AI Studio](https://aistudio.google.com/apikey)
- **GitHub Token** (optional) -- For higher API rate limits

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/nandandas2407-web/roaster.git
   cd roaster
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys (see [Environment Variables](#environment-variables)).

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**

   Navigate to `http://localhost:3000`

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key for AI roast generation |
| `APP_URL` | No | The URL where the app is hosted (used for self-referential links) |
| `GITHUB_TOKEN` | No | GitHub personal access token to bypass API rate limits |
| `VITE_API_URL` | No | Backend API URL for Cloudflare Worker (leave empty for same-origin) |

Example `.env.local`:

```
GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"
GITHUB_TOKEN=""
```

---

## Running the App

### Development Mode

```bash
npm run dev
```

Starts the Express server with Vite middleware for hot module replacement. The app runs at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

Builds the Vite frontend and bundles the server, then runs the production server from `dist/`.

### Linting

```bash
npm run lint
```

Runs TypeScript type checking with `tsc --noEmit`.

---

## Project Structure

```
roaster/
|-- index.html                    # Entry HTML with page title
|-- package.json                  # Dependencies and scripts
|-- tsconfig.json                 # TypeScript configuration
|-- vite.config.ts                # Vite + Tailwind + React config
|-- netlify.toml                  # Netlify build config
|-- server.ts                     # Express backend (local dev)
|-- .env.example                  # Environment variable template
|-- assets/                       # Static assets
|-- src/
|   |-- main.tsx                  # React app entry point
|   |-- App.tsx                   # Main application component
|   |-- types.ts                  # TypeScript interfaces and types
|   |-- index.css                 # Tailwind imports + custom animations
|   |-- utils/
|       |-- canvasHelper.ts       # HTML5 Canvas roast card generator
|       |-- synth.ts              # Web Audio API sound synthesizer
|-- worker/
    |-- index.ts                  # Cloudflare Worker (production API)
    |-- wrangler.toml             # Cloudflare Worker config
    |-- package.json              # Worker dependencies
    |-- tsconfig.json             # Worker TypeScript config
```

---

## How It Works

### GitHub Mode

1. **User submits a GitHub username** and selects a roast intensity level
2. **Server fetches GitHub data** via the GitHub REST API, collecting:
   - User profile (name, bio, followers, following, account age)
   - All public repositories (up to 100)
   - Repository metadata (descriptions, languages, stars, last updated)
3. **Server computes derived statistics**:
   - Graveyard count (repos not updated in 1+ year)
   - Lazy-named repos (test, demo, asdf, untitled, etc.)
   - Language distribution percentages
   - Total and max star counts
4. **Gemini AI generates the roast** using a structured prompt with severity guidelines
5. **Response is parsed and displayed** as animated, staggered roast stamps
6. **The Toast** follows as a sincere, data-driven compliment

### Roast Anything Mode

1. **User submits** a name, bio/passion description, up to 3 web links, and up to 3 images
2. **Links are crawled** in parallel, extracting titles, meta descriptions, and text previews
3. **Images are compressed** client-side to JPEG at 75% quality (max 1024px dimension)
4. **All materials are sent to Gemini** as a multimodal prompt (text + inline base64 images)
5. **Safety guardrails** prevent mocking of physical appearance in uploaded images
6. **Roast and Toast** are generated and displayed with the same animated reveal

---

## API Endpoints

### `GET /api/github-data`

Fetches and aggregates GitHub statistics for a given username.

**Query Parameters:**
- `username` (string, required) -- The GitHub username to analyze

**Response:**
```json
{
  "username": "torvalds",
  "name": "Linus Torvalds",
  "avatarUrl": "https://avatars.githubusercontent.com/u/1024025",
  "bio": "I made Linux",
  "followers": 200000,
  "following": 0,
  "accountAgeYears": 30.5,
  "totalReposFetched": 7,
  "noDescriptionCount": 2,
  "graveyardCount": 1,
  "lazyNamedReposCount": 0,
  "lazyReposList": [],
  "mostUsedLanguage": "C",
  "languages": { "C": 80, "Shell": 20 },
  "starredReposCount": 3,
  "maxStars": 150000,
  "totalStars": 160000,
  "recentRepos": [...]
}
```

### `POST /api/roast`

Generates a roast for a GitHub profile using Gemini AI.

**Request Body:**
```json
{
  "stats": { ... },
  "intensity": "MEDIUM"
}
```

**Response:**
```json
{
  "roast": [
    "Your repo naming is a cry for help.",
    "You have 24 repos untouched since 2022.",
    ...
  ],
  "toast": "Your dedication to open source is genuinely inspiring."
}
```

### `POST /api/roast-generic`

Generates a roast from submitted text, links, and images using Gemini multimodal.

**Request Body:**
```json
{
  "name": "Jane",
  "bio": "I love building indie games",
  "links": ["https://mygame.dev"],
  "images": [{ "dataUrl": "data:image/jpeg;base64,...", "mimeType": "image/jpeg" }],
  "intensity": "NUCLEAR"
}
```

**Response:**
```json
{
  "roast": [ ... ],
  "toast": "...",
  "summary": {
    "name": "Jane",
    "bio": "I love building indie games",
    "links": [...],
    "imageCount": 1,
    "images": [...]
  }
}
```

---

## Roast Intensity Levels

| Level | Description | Sound | Pacing |
|---|---|---|---|
| **MILD** | Affectionate, friendly ribbing. Gentle teasing about languages or inactive repos. | Light click, soft stamp | Fast, upbeat narration |
| **MEDIUM** | Sharp, witty, cuts straight to bad habits, funny repo names, and missing descriptions. | Standard stamp sound | Normal narration speed |
| **NUCLEAR** | Utter destruction. No mercy for abandoned repos, lazy names, or zero-star habits. | Heavy slam + white noise sizzle | Slower, deeper narration |
| **BRUTAL** | Soul-crushing existential crisis. Unhinged, devastating, 18+ only. Questions career choices and code philosophy. | Maximum impact + ambient hum wobble | Slowest, lowest pitch narration |

---

## Sound Design

The app features a custom **Web Audio API synthesizer** (`src/utils/synth.ts`) that generates procedural sound effects:

- **Click** -- Subtle sine wave click for button hovers (1200Hz to 800Hz sweep)
- **Analysis Start** -- Dual-oscillator sweep (110Hz to 440Hz + 220Hz to 880Hz)
- **Stamp** -- Physical slam effect with sub thump (150Hz to 45Hz), mechanical clank (triangle wave), and optional white noise sizzle for NUCLEAR/BRUTAL modes
- **Ambient Hum** -- Background suspense drone:
  - MILD/MEDIUM: Gentle 80Hz sine
  - NUCLEAR: Ominous 60Hz triangle
  - BRUTAL: 55Hz sawtooth with 3Hz vibrato modulation

All sounds can be muted/unmuted via the in-app audio toggle. Mute state persists in `localStorage`.

---

## Card Generation

The downloadable roast card is rendered entirely on **HTML5 Canvas** (`src/utils/canvasHelper.ts`):

- **Dimensions:** 800 x 1000 pixels
- **Style:** Physical ledger paper aesthetic with grid lines, double borders, and margin rules
- **Content includes:**
  - App header and subtitle
  - User avatar (loaded via CORS-friendly `<img>` tag)
  - Name, handle, and bio
  - Intensity severity stamp (rotated, double-bordered)
  - Stats grid (account age, repos, graveyard count, primary language)
  - Roast lines with numbered badges
  - The Toast in a teal-accented card frame
  - Footer attribution

The card is exported as a PNG data URL and triggers a browser download.

---

## Deployment

This app is split into two parts:
- **Frontend** (React) -- deployed to **Netlify**
- **Backend** (API) -- deployed to **Cloudflare Workers**

### Deploy the Backend (Cloudflare Workers)

1. **Install Wrangler CLI** (if not already installed):

   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Install worker dependencies**:

   ```bash
   cd worker
   npm install
   ```

4. **Set secret environment variables**:

   ```bash
   wrangler secret put GEMINI_API_KEY
   wrangler secret put GITHUB_TOKEN
   ```

5. **Deploy the worker**:

   ```bash
   wrangler deploy
   ```

   Your worker will be available at: `https://roaster-api.<your-subdomain>.workers.dev`

6. **Update `wrangler.toml`** with your Netlify domain:

   ```toml
   [vars]
   ALLOWED_ORIGIN = "https://roaster0.netlify.app"
   ```

   Then re-deploy: `wrangler deploy`

### Deploy the Frontend (Netlify)

1. **Push your code to GitHub**:

   ```bash
   git add -A
   git commit -m "Deploy frontend to Netlify"
   git push origin main
   ```

2. **On Netlify**:
   - Connect your GitHub repository
   - Set build settings:
     - **Build command:** `vite build`
     - **Publish directory:** `dist`

3. **Set environment variable** on Netlify:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://roaster-api.<your-subdomain>.workers.dev` |

4. **Deploy** -- Netlify will build and deploy automatically.

### Local Development

For local development, the Express server handles both frontend and API:

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your keys
npm run dev
```

The app runs at `http://localhost:3000` with the Express backend proxying API calls.

---

## Contributing

Contributions are welcome! Here is how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the linter (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with TypeScript, Tailwind CSS, and a healthy dose of sarcasm.**

</div>
