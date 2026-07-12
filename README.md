<div align="center">

<img src="https://github.com/nandandas2407-web/roaster/blob/main/banner.png?raw=true" alt="roaster0 — Bureau of Unsolicited Opinions" width="100%" />

<br>

![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini-3.5-4285F4?style=for-the-badge)

**Live App:** [roaster0.netlify.app](https://roaster0.netlify.app)

</div>

---

## What is roaster0?

roaster0 is an AI-powered web application that roasts GitHub profiles and passion projects using Google's Gemini AI. It analyzes your public coding habits, repository data, language choices, and commit patterns to deliver savage, hyper-specific comedic critiques — followed by a sincere compliment called **"The Toast."**

### How It Works

1. Enter a GitHub username (or switch to "Roast Anything" mode)
2. Choose your roast severity: **MILD**, **MEDIUM**, **NUCLEAR**, or **BRUTAL**
3. Watch as roast lines appear one by one with dramatic stamp animations
4. Listen to the AI-narrated roast via Web Speech API
5. Receive **The Toast** — a genuine, earned compliment
6. Download a stylized roast card or share the results

---

## Features

- **GitHub Profile Roasting** — Enter any public GitHub username for a data-driven roast
- **Roast Anything** — Submit any bio, link, or image for AI-powered comedy
- **4 Intensity Levels** — From friendly banter to existential crisis
- **The Toast** — Every roast ends with a sincere, earned compliment
- **Roast Cards** — Downloadable Canvas-rendered cards in the ledger-paper aesthetic
- **Text-to-Speech** — AI narrates the roast with Web Speech API
- **Audio Effects** — Procedural Web Audio sound effects for stamps and reveals
- **3D Card Tilt** — Mouse-tracking perspective transforms
- **Share Anywhere** — One-click sharing with pre-formatted text

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 5.8, Tailwind CSS 4 |
| Animations | Framer Motion, CSS Keyframes |
| Audio | Web Speech API, Web Audio API |
| Canvas | HTML5 Canvas, CanvasHelper |
| Backend | Cloudflare Workers (ES Modules) |
| AI | Google Gemini 3.5 Flash |
| Hosting | Netlify (Frontend), Cloudflare (API) |

---

## Architecture

```
roaster0
├── src/
│   ├── App.tsx              # Main application component
│   ├── types.ts             # TypeScript type definitions
│   └── utils/
│       ├── canvasHelper.ts  # Roast card rendering
│       └── synth.ts         # Web Audio sound effects
├── worker/
│   └── index.mjs            # Cloudflare Worker (API backend)
├── netlify/
│   └── functions/           # Netlify Functions (fallback)
├── public/
│   └── favicon.svg          # Logo
└── index.html               # Entry point with SEO meta tags
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/github-data?username={user}` | Fetch GitHub profile stats |
| `POST` | `/api/roast` | Generate roast from GitHub data |
| `POST` | `/api/roast-generic` | Generate roast from any input |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install

```bash
git clone https://github.com/nandandas2407-web/roaster.git
cd roaster
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `GITHUB_TOKEN` | GitHub personal access token (optional) |
| `ALLOWED_ORIGIN` | CORS allowed origin |

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Credits

Built by **[nandandas2407-web](https://github.com/nandandas2407-web)**

---

<div align="center">

**Roast First. Toast Always.**

</div>
