import { RoastIntensity } from "../types";

/**
 * Wraps text in Canvas Rendering Context 2D.
 * Returns the Y coordinate of the bottom of the rendered text block.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY;
}

/**
 * Loads an image from a URL or Base64 string and returns a Promise.
 * Gracefully handles errors and falls back.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!url.startsWith("data:")) {
      img.crossOrigin = "anonymous"; // Avoid tainted canvas CORS issues for GitHub URLs
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

/**
 * Draws a rounded rectangle with custom radiuses on a canvas path.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export interface CardDownloadPayload {
  mode: "GITHUB" | "GENERIC";
  name: string;
  usernameOrHandle: string;
  avatarUrlOrBase64: string;
  bio: string;
  intensity: RoastIntensity;
  roast: string[];
  toast: string;
  // GitHub stats
  accountAgeYears?: number;
  totalReposFetched?: number;
  graveyardCount?: number;
  mostUsedLanguage?: string;
  // Generic stats
  linkCount?: number;
  imageCount?: number;
}

/**
 * Generates and downloads the stylized high-fidelity Roast Card.
 */
export async function downloadRoastCard(payload: CardDownloadPayload): Promise<void> {
  const {
    mode,
    name,
    usernameOrHandle,
    avatarUrlOrBase64,
    bio,
    intensity,
    roast,
    toast,
    accountAgeYears = 0,
    totalReposFetched = 0,
    graveyardCount = 0,
    mostUsedLanguage = "None",
    linkCount = 0,
    imageCount = 0
  } = payload;

  // 1. Create a canvas element
  const width = 800;
  const height = 1000;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Could not acquire 2D canvas context.");
  }

  // Define Color Tokens
  const colorPaper = "#F2EDE4";
  const colorInk = "#1A1A18";
  const colorRoastRed = "#E8543E";
  const colorToastTeal = "#2E7D6E";
  const colorMutedStone = "#C9C2B4";

  // --- Draw Background ---
  ctx.fillStyle = colorPaper;
  ctx.fillRect(0, 0, width, height);

  // --- Draw Grid Lines (Ledger Style) ---
  ctx.strokeStyle = colorInk;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.04;
  for (let y = 30; y < height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // --- Draw Left Vertical Ledger Margin Line ---
  ctx.strokeStyle = colorRoastRed;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.moveTo(55, 0);
  ctx.lineTo(55, height);
  ctx.stroke();
  ctx.globalAlpha = 1.0; // Reset alpha

  // --- Draw Outer Border ---
  ctx.strokeStyle = colorInk;
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, width - 12, height - 12);
  ctx.strokeStyle = colorMutedStone;
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // --- Try loading Avatar with Fallback ---
  let avatarImg: HTMLImageElement | null = null;
  if (avatarUrlOrBase64) {
    try {
      avatarImg = await loadImage(avatarUrlOrBase64);
    } catch (err) {
      console.warn("Could not load user avatar/image, rendering initials fallback", err);
    }
  }

  // --- Draw Header ---
  ctx.fillStyle = colorInk;
  ctx.font = "900 38px 'Kanit', system-ui, -apple-system, sans-serif";
  ctx.fillText(mode === "GITHUB" ? "ROAST MY GITHUB" : "ROAST ANYTHING", 80, 85);

  ctx.fillStyle = colorRoastRed;
  ctx.font = "bold 13px 'JetBrains Mono', monospace";
  ctx.fillText("AUTOMATED CODE REVIEW · BUREAU OF UNSOLICITED OPINIONS", 80, 115);

  // Draw separator line
  ctx.strokeStyle = colorInk;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.moveTo(80, 135);
  ctx.lineTo(width - 80, 135);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // --- Draw Profile Area ---
  const avatarSize = 90;
  const profileX = 80;
  const profileY = 160;

  // Avatar block
  ctx.save();
  drawRoundedRect(ctx, profileX, profileY, avatarSize, avatarSize, 14);
  ctx.clip();
  if (avatarImg) {
    ctx.drawImage(avatarImg, profileX, profileY, avatarSize, avatarSize);
  } else {
    // Initials Fallback
    ctx.fillStyle = colorInk;
    ctx.fillRect(profileX, profileY, avatarSize, avatarSize);
    ctx.fillStyle = colorPaper;
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      (name || usernameOrHandle || "AN").slice(0, 2).toUpperCase(),
      profileX + avatarSize / 2,
      profileY + avatarSize / 2
    );
    ctx.textAlign = "left"; // reset
    ctx.textBaseline = "alphabetic"; // reset
  }
  ctx.restore();

  // Avatar Border
  ctx.strokeStyle = colorInk;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, profileX, profileY, avatarSize, avatarSize, 14);
  ctx.stroke();

  // User details text
  ctx.fillStyle = colorInk;
  ctx.font = "900 24px 'Kanit', system-ui, -apple-system, sans-serif";
  ctx.fillText(name || "Anonymous", 195, 190);

  ctx.fillStyle = colorInk;
  ctx.globalAlpha = 0.5;
  ctx.font = "bold 15px 'JetBrains Mono', monospace";
  ctx.fillText(mode === "GITHUB" ? `@${usernameOrHandle}` : `Handle: ${usernameOrHandle || 'None'}`, 195, 215);
  ctx.globalAlpha = 1.0;

  // Bio summary if exists
  if (bio) {
    ctx.fillStyle = colorInk;
    ctx.font = "italic 13px 'Inter', sans-serif";
    const truncatedBio = bio.length > 70 ? bio.slice(0, 68) + "..." : bio;
    ctx.fillText(`"${truncatedBio}"`, 195, 240);
  }

  // --- Intensity Stamp (Top-Right) ---
  const stampWidth = 160;
  const stampHeight = 44;
  const stampX = width - 80 - stampWidth;
  const stampY = 160;

  ctx.save();
  ctx.translate(stampX + stampWidth / 2, stampY + stampHeight / 2);
  ctx.rotate(0.08); // Slight stamp tilt for analog warmth

  // Border of the stamp
  ctx.strokeStyle = colorRoastRed;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-stampWidth / 2, -stampHeight / 2, stampWidth, stampHeight);
  ctx.setLineDash([4, 2]);
  ctx.strokeStyle = colorRoastRed;
  ctx.lineWidth = 1;
  ctx.strokeRect(-stampWidth / 2 + 3, -stampHeight / 2 + 3, stampWidth - 6, stampHeight - 6);
  ctx.setLineDash([]); // clear

  // Fill text inside stamp
  ctx.fillStyle = colorRoastRed;
  ctx.font = "900 14px 'Kanit', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${intensity} SEVERITY`, 0, 0);
  ctx.restore();

  // Reset standard text alignment
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // --- Stats Section ---
  const statsY = 285;
  ctx.strokeStyle = colorInk;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.1;
  ctx.strokeRect(80, statsY, width - 160, 65);
  ctx.globalAlpha = 1.0;

  // Draw 4 stat items based on mode
  const colWidth = (width - 160) / 4;
  const labels = mode === "GITHUB" 
    ? ["ACCOUNT AGE", "TOTAL REPOS", "GRAVEYARD COUNT", "PRIMARY LANGUAGE"]
    : ["INPUT LENGTH", "LINKS GIVEN", "IMAGES LOADED", "ASSESSMENT COOP"];
    
  const values = mode === "GITHUB"
    ? [
        `${accountAgeYears.toFixed(1)} Yrs`,
        `${totalReposFetched}`,
        `${graveyardCount}`,
        mostUsedLanguage || "None"
      ]
    : [
        `${bio.length} Chars`,
        `${linkCount}`,
        `${imageCount}`,
        "Roast Anything"
      ];

  for (let i = 0; i < 4; i++) {
    const xPos = 80 + i * colWidth;
    
    // Divider
    if (i > 0) {
      ctx.strokeStyle = colorInk;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.moveTo(xPos, statsY + 12);
      ctx.lineTo(xPos, statsY + 53);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    ctx.fillStyle = colorInk;
    ctx.globalAlpha = 0.4;
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], xPos + colWidth / 2, statsY + 25);

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = mode === "GITHUB" && i === 2 && graveyardCount > 0 ? colorRoastRed : colorInk;
    ctx.font = "bold 15px 'JetBrains Mono', monospace";
    ctx.fillText(values[i], xPos + colWidth / 2, statsY + 48);
  }
  ctx.textAlign = "left"; // reset

  // --- ACT 1: THE ROASTS ---
  const roastHeaderY = 390;
  ctx.fillStyle = colorRoastRed;
  ctx.font = "bold 13px 'JetBrains Mono', monospace";
  ctx.fillText("ACT I: THE CRITICAL DISCLOSURES", 80, roastHeaderY);

  // Border below header
  ctx.strokeStyle = colorRoastRed;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.moveTo(80, roastHeaderY + 10);
  ctx.lineTo(width - 80, roastHeaderY + 10);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  let currentY = roastHeaderY + 38;
  const wrapWidth = width - 160 - 45; // 45px for number indicator

  roast.forEach((line, idx) => {
    // Draw index badge
    const badgeSize = 22;
    ctx.fillStyle = colorRoastRed;
    drawRoundedRect(ctx, 80, currentY - 17, badgeSize, badgeSize, 4);
    ctx.fill();

    ctx.fillStyle = colorPaper;
    ctx.font = "bold 12px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${idx + 1}`, 80 + badgeSize / 2, currentY - 17 + badgeSize / 2);
    ctx.textAlign = "left"; // reset
    ctx.textBaseline = "alphabetic"; // reset

    // Draw roast text
    ctx.fillStyle = colorInk;
    ctx.font = "bold 15px 'Kanit', system-ui, -apple-system, sans-serif";
    const bottomY = wrapText(ctx, line, 115, currentY, wrapWidth, 23);
    
    currentY = bottomY + 36;
  });

  // --- ACT 2: THE TOAST ---
  const toastY = height - 290;
  
  // Outer frame for the Toast (Teal color scheme)
  ctx.strokeStyle = colorToastTeal;
  ctx.lineWidth = 1.5;
  ctx.fillStyle = "#EAF2F0"; // Very soft pastel teal highlight
  drawRoundedRect(ctx, 80, toastY, width - 160, 160, 10);
  ctx.fill();
  ctx.stroke();

  // Internal borders/double frame
  ctx.strokeStyle = colorToastTeal;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;
  drawRoundedRect(ctx, 84, toastY + 4, width - 168, 152, 8);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // Title for Act 2
  ctx.fillStyle = colorToastTeal;
  ctx.font = "bold 11px 'JetBrains Mono', monospace";
  ctx.fillText("ACT II: THE REDEEMING TOAST", 105, toastY + 30);

  // Quote mark accent
  ctx.font = "bold 64px serif";
  ctx.globalAlpha = 0.12;
  ctx.fillText("“", 100, toastY + 95);
  ctx.globalAlpha = 1.0;

  // Sincere toast text
  ctx.fillStyle = colorInk;
  ctx.font = "italic 15px 'Inter', sans-serif";
  wrapText(ctx, `"${toast}"`, 130, toastY + 68, width - 260, 24);

  // --- Footer ---
  const footerY = height - 55;
  ctx.fillStyle = colorInk;
  ctx.globalAlpha = 0.4;
  ctx.font = "bold 10px 'JetBrains Mono', monospace";
  ctx.fillText("OFFICIALLY FILED RECORD | ROAST MY GITHUB / ROAST ANYTHING", 80, footerY);

  ctx.textAlign = "right";
  ctx.fillText("SCAN COMPLETED BY GEMINI 3.5 FLASH", width - 80, footerY);
  ctx.globalAlpha = 1.0;
  ctx.textAlign = "left"; // reset

  // 3. Initiate Download
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `roast-anything-${usernameOrHandle || "creator"}.png`;
  link.href = dataUrl;
  link.click();
}
