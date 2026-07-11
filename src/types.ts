export type RoastIntensity = 'MILD' | 'MEDIUM' | 'NUCLEAR' | 'BRUTAL';

export interface GitHubStats {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  accountAgeYears: number;
  createdAt: string;
  totalReposFetched: number;
  noDescriptionCount: number;
  graveyardCount: number; // repos not updated in 1+ years
  lazyNamedReposCount: number;
  lazyReposList: string[];
  mostUsedLanguage: string;
  languages: { [key: string]: number }; // percentage or count
  starredReposCount: number; // repos with stars
  maxStars: number;
  totalStars: number;
  recentRepos: { name: string; description: string; language: string; stars: number; updatedAt: string }[];
}

export interface RoastResponse {
  roast: string[];
  toast: string;
}

export interface GenericSubmission {
  name: string;
  bio: string;
  links: string[];
  images: { dataUrl: string; mimeType: string }[];
  intensity: RoastIntensity;
}

export interface LinkAnalysisResult {
  url: string;
  title: string;
  description: string;
  textPreview: string;
  status: 'success' | 'failed';
}

export interface GenericDataSummary {
  name: string;
  bio: string;
  links: LinkAnalysisResult[];
  imageCount: number;
  images: { dataUrl: string; mimeType: string }[]; // Keep base64 references for canvas/visual display if needed
}

