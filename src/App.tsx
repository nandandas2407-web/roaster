import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Copy, 
  Check, 
  Github, 
  FileCode, 
  Clock, 
  User, 
  Users, 
  HelpCircle,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp,
  Download,
  Globe,
  Plus,
  Trash2,
  Image as ImageIcon,
  ShieldCheck,
  Lock,
  X,
  Volume2,
  VolumeX,
  Play,
  Square
} from "lucide-react";
import { GitHubStats, RoastIntensity, RoastResponse, GenericDataSummary } from "./types";
import { downloadRoastCard } from "./utils/canvasHelper";
import { synth } from "./utils/synth";

const API_BASE = import.meta.env.VITE_API_URL || "";

const POPULAR_DEVS = [
  { username: "torvalds", name: "Linus Torvalds" },
  { username: "gaearon", name: "Dan Abramov" },
  { username: "benhalpern", name: "Ben Halpern" },
  { username: "rusty-dev", name: "Sample Dev" }
];

const SURPRISE_DEVS = [
  { username: "torvalds", name: "Linus Torvalds" },
  { username: "gaearon", name: "Dan Abramov" },
  { username: "benhalpern", name: "Ben Halpern" },
  { username: "taylorotwell", name: "Taylor Otwell" },
  { username: "ry", name: "Ryan Dahl" },
  { username: "sindresorhus", name: "Sindre Sorhus" },
  { username: "vjeux", name: "Christopher Chedeau" },
  { username: "rich-harris", name: "Rich Harris" },
  { username: "dhh", name: "David Heinemeier Hansson" },
  { username: "mrdoob", name: "Mr.doob" },
  { username: "shadcn", name: "Shadcn" },
  { username: "antfu", name: "Anthony Fu" },
  { username: "mcollina", name: "Matteo Collina" },
  { username: "leeerob", name: "Lee Robinson" },
  { username: "rauchg", name: "Guillermo Rauch" },
  { username: "tannerlinsley", name: "Tanner Linsley" },
  { username: "substack", name: "James Halliday" },
  { username: "tj", name: "TJ Holowaychuk" },
  { username: "tenderlove", name: "Aaron Patterson" },
  { username: "gvanrossum", name: "Guido van Rossum" },
  { username: "jashkenas", name: "Jeremy Ashkenas" },
  { username: "tpope", name: "Tim Pope" },
  { username: "getify", name: "Kyle Simpson" },
  { username: "josevalim", name: "José Valim" }
];

const LaughingManSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm select-none">
    {/* Laughing closed eyes */}
    <path d="M40,75 Q55,60 70,75" stroke="#1C1C1C" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M130,75 Q145,60 160,75" stroke="#1C1C1C" strokeWidth="4.5" strokeLinecap="round" />
    {/* Tears of laughter */}
    <path d="M32,80 C27,95 42,95 42,80 Z" fill="#E8543E" opacity="0.85" stroke="#1C1C1C" strokeWidth="1.5" />
    <path d="M168,80 C173,95 158,95 158,80 Z" fill="#E8543E" opacity="0.85" stroke="#1C1C1C" strokeWidth="1.5" />
    {/* Laughing open mouth */}
    <path d="M60,95 Q100,145 140,95 Z" fill="#E8543E" stroke="#1C1C1C" strokeWidth="4.5" strokeLinejoin="round" />
    <path d="M75,100 Q100,110 125,100" stroke="#1C1C1C" strokeWidth="3.5" strokeLinecap="round" />
    {/* Eyebrows */}
    <path d="M35,55 Q55,42 75,58" stroke="#1C1C1C" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M125,58 Q145,42 165,55" stroke="#1C1C1C" strokeWidth="3.5" strokeLinecap="round" />
    {/* Big Pointing Hand pointing forward */}
    <circle cx="100" cy="145" r="22" fill="#F2EDE4" stroke="#1C1C1C" strokeWidth="4.5" />
    {/* Pointing Index Finger pointing directly forward */}
    <rect x="85" y="102" width="30" height="42" rx="15" fill="#F2EDE4" stroke="#1C1C1C" strokeWidth="4.5" />
    <circle cx="100" cy="115" r="5" fill="#E8543E" />
    {/* Finger lines */}
    <path d="M78,138 Q85,141 90,138" stroke="#1C1C1C" strokeWidth="3" />
    <path d="M78,148 Q85,151 90,148" stroke="#1C1C1C" strokeWidth="3" />
  </svg>
);

const FacepalmMonkeySVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm select-none">
    {/* Big ears */}
    <circle cx="45" cy="100" r="24" fill="#F2EDE4" stroke="#1C1C1C" strokeWidth="4.5" />
    <circle cx="45" cy="100" r="12" stroke="#E8543E" strokeWidth="3.5" />
    <circle cx="155" cy="100" r="24" fill="#F2EDE4" stroke="#1C1C1C" strokeWidth="4.5" />
    <circle cx="155" cy="100" r="12" stroke="#E8543E" strokeWidth="3.5" />
    {/* Monkey Head */}
    <circle cx="100" cy="100" r="54" fill="#F2EDE4" stroke="#1C1C1C" strokeWidth="4.5" />
    {/* Inner face mask */}
    <path d="M100,55 C75,55 60,70 65,100 C70,130 100,145 100,145 C100,145 130,130 135,100 C140,70 125,55 100,55 Z" fill="#F2EDE4" stroke="#1C1C1C" strokeWidth="3.5" />
    {/* Eyes (one squinting, one covered by hand) */}
    <path d="M80,85 Q85,78 90,85" stroke="#1C1C1C" strokeWidth="4.5" strokeLinecap="round" />
    {/* Sad/nervous sweating drop */}
    <path d="M125,80 C125,87 121,87 121,80 Q121,75 125,80 Z" fill="#E8543E" stroke="#1C1C1C" strokeWidth="1" />
    {/* Worry lines on forehead */}
    <path d="M90,65 H110" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M85,71 H115" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" />
    {/* Embarrassed blushing cheeks */}
    <circle cx="75" cy="102" r="6" fill="#E8543E" opacity="0.65" />
    <circle cx="125" cy="102" r="6" fill="#E8543E" opacity="0.65" />
    {/* Curved frowning mouth */}
    <path d="M85,122 Q100,112 115,122" stroke="#1C1C1C" strokeWidth="4.5" strokeLinecap="round" />
    {/* Giant Facepalm Hand */}
    <path d="M115,150 C125,140 135,115 135,90 C135,80 125,70 115,85 C108,95 108,110 110,130" stroke="#1C1C1C" strokeWidth="4.5" strokeLinecap="round" fill="#F2EDE4" />
    {/* Finger separations on the facepalming hand */}
    <path d="M125,83 C127,90 125,100 121,110" stroke="#1C1C1C" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M131,90 C133,97 131,105 127,115" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const HorrifiedCatSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm select-none">
    {/* Cat Ears */}
    <path d="M45,85 L30,35 L75,60 Z" fill="#F2EDE4" stroke="#1C1C1C" strokeWidth="4.5" strokeLinejoin="round" />
    <path d="M38,48 L45,70 L55,60 Z" fill="#E8543E" />
    <path d="M155,85 L170,35 L125,60 Z" fill="#F2EDE4" stroke="#1C1C1C" strokeWidth="4.5" strokeLinejoin="round" />
    <path d="M162,48 L155,70 L145,60 Z" fill="#E8543E" />
    {/* Head */}
    <circle cx="100" cy="100" r="54" fill="#F2EDE4" stroke="#1C1C1C" strokeWidth="4.5" />
    {/* Massive Shocked Eyes */}
    <circle cx="75" cy="90" r="18" fill="white" stroke="#1C1C1C" strokeWidth="3.5" />
    <circle cx="75" cy="90" r="7" fill="#1C1C1C" />
    <circle cx="78" cy="87" r="3" fill="white" />
    
    <circle cx="125" cy="90" r="18" fill="white" stroke="#1C1C1C" strokeWidth="3.5" />
    <circle cx="125" cy="90" r="7" fill="#1C1C1C" />
    <circle cx="128" cy="87" r="3" fill="white" />
    {/* Cat Snout / Whiskers area */}
    <path d="M90,110 Q100,115 100,110 Q100,115 110,110" stroke="#1C1C1C" strokeWidth="3.5" strokeLinecap="round" />
    {/* Tiny nose */}
    <polygon points="96,104 104,104 100,108" fill="#E8543E" />
    {/* Horrified open mouth (jaw dropped) */}
    <rect x="88" y="115" width="24" height="35" rx="12" fill="#E8543E" stroke="#1C1C1C" strokeWidth="4.5" />
    <path d="M93,125 Q100,130 107,125" stroke="#1C1C1C" strokeWidth="3.5" />
    {/* Whiskers */}
    <path d="M40,105 H15" stroke="#1C1C1C" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M42,115 H20" stroke="#1C1C1C" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M160,105 H185" stroke="#1C1C1C" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M158,115 H180" stroke="#1C1C1C" strokeWidth="3.5" strokeLinecap="round" />
    {/* Paws on cheeks */}
    <path d="M35,135 C45,130 55,115 50,105" stroke="#1C1C1C" strokeWidth="4.5" strokeLinecap="round" fill="#F2EDE4" />
    <path d="M165,135 C155,130 145,115 150,105" stroke="#1C1C1C" strokeWidth="4.5" strokeLinecap="round" fill="#F2EDE4" />
  </svg>
);

const WailingMugSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm select-none">
    {/* Mug Handle */}
    <path d="M140,80 C170,80 170,130 140,130" stroke="#1C1C1C" strokeWidth="4.5" fill="none" />
    {/* Mug Body */}
    <rect x="50" y="60" width="90" height="85" rx="8" fill="#F2EDE4" stroke="#1C1C1C" strokeWidth="4.5" />
    {/* Mug Rim */}
    <ellipse cx="95" cy="60" rx="45" ry="10" fill="#F2EDE4" stroke="#1C1C1C" strokeWidth="4.5" />
    {/* Hot Steam */}
    <path d="M75,40 Q80,25 75,15" stroke="#E8543E" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M95,43 Q100,28 95,18" stroke="#E8543E" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M115,40 Q120,25 115,15" stroke="#E8543E" strokeWidth="3.5" strokeLinecap="round" />
    {/* Sad crying face on Mug */}
    <path d="M70,85 L80,90 L70,95" stroke="#1C1C1C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M120,85 L110,90 L120,95" stroke="#1C1C1C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Tears stream */}
    <path d="M75,90 V125" stroke="#E8543E" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M115,90 V125" stroke="#E8543E" strokeWidth="3.5" strokeLinecap="round" />
    {/* Sad open mouth */}
    <path d="M85,110 Q95,125 105,110 Z" fill="#E8543E" stroke="#1C1C1C" strokeWidth="3.5" />
    {/* Bugs crawling out */}
    <circle cx="130" cy="55" r="4" fill="#1C1C1C" />
    <path d="M130,55 L135,51" stroke="#1C1C1C" strokeWidth="2" />
    <path d="M130,55 L135,59" stroke="#1C1C1C" strokeWidth="2" />
    
    <line x1="42" y1="100" x2="48" y2="100" stroke="#1C1C1C" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M45,100 L40,95" stroke="#1C1C1C" strokeWidth="2" />
    <path d="M45,100 L40,105" stroke="#1C1C1C" strokeWidth="2" />
  </svg>
);

export default function App() {
  const [username, setUsername] = useState("");
  const [intensity, setIntensity] = useState<RoastIntensity>("MEDIUM");
  
  // App state
  const [status, setStatus] = useState<"LANDING" | "FETCHING" | "ROAST_REVEAL" | "TOAST_REVEAL">("LANDING");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [roastData, setRoastData] = useState<RoastResponse | null>(null);
  
  // Tab selectors
  const [activeTab, setActiveTab] = useState<"GITHUB" | "GENERIC">("GITHUB");
  const [sessionMode, setSessionMode] = useState<"GITHUB" | "GENERIC" | null>(null);

  // Generic mode specific states
  const [genericName, setGenericName] = useState("");
  const [genericBio, setGenericBio] = useState("");
  const [genericLinks, setGenericLinks] = useState<string[]>([""]);
  const [genericImages, setGenericImages] = useState<{ dataUrl: string; mimeType: string }[]>([]);
  const [ageGateConfirmed, setAgeGateConfirmed] = useState(false);
  const [genericSummary, setGenericSummary] = useState<GenericDataSummary | null>(null);

  // Sound & Parallax Custom States
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem("roast_muted") === "true";
    } catch {
      return false;
    }
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || (typeof window !== "undefined" && window.innerWidth < 768)) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Tilt angle
    const rY = (mouseX / width) * 12;
    const rX = -(mouseY / height) * 12;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Sync with synth
  useEffect(() => {
    synth.setMute(isMuted);
    try {
      localStorage.setItem("roast_muted", String(isMuted));
    } catch (e) {}
  }, [isMuted]);

  // Drag and drop image states
  const [isDragging, setIsDragging] = useState(false);

  // Loading sub-steps
  const [fetchStage, setFetchStage] = useState<string>("");
  const [fetchProgress, setFetchProgress] = useState(0);

  // Reveal state
  const [revealedRoastCount, setRevealedRoastCount] = useState(0);
  const [gaugeValue, setGaugeValue] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);

  // Web Speech API / Audio Narration states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isSpeakingToast, setIsSpeakingToast] = useState(false);

  const speakText = (text: string, onStart: () => void, onEnd: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onEnd();
      return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get list of voices
    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural Google voices, then normal US English, then GB, then any English
    let selectedVoice = voices.find(v => v.lang.startsWith("en-US") && v.name.toLowerCase().includes("google")) ||
                        voices.find(v => v.lang.startsWith("en-US") && v.name.toLowerCase().includes("natural")) ||
                        voices.find(v => v.lang.startsWith("en-US")) ||
                        voices.find(v => v.lang.startsWith("en-GB")) ||
                        voices.find(v => v.lang.startsWith("en")) ||
                        voices[0];
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Configure distinct emotional/severity vocal pacing & frequencies
    if (intensity === "MILD") {
      utterance.rate = 1.05;
      utterance.pitch = 1.15;
    } else if (intensity === "MEDIUM") {
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    } else if (intensity === "NUCLEAR") {
      utterance.rate = 0.92;
      utterance.pitch = 0.85;
    } else { // BRUTAL
      utterance.rate = 0.82;
      utterance.pitch = 0.65;
    }

    utterance.onstart = onStart;
    utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakLineIndex = (index: number) => {
    if (!roastData) return;

    if (index >= roastData.roast.length) {
      setSpeakingIndex(null);
      setIsSpeakingToast(true);
      
      speakText(
        `But first, redemption. ${roastData.toast}`,
        () => {},
        () => {
          setIsSpeaking(false);
          setIsSpeakingToast(false);
        }
      );
      return;
    }

    setSpeakingIndex(index);
    setIsSpeakingToast(false);

    // If the index is not yet revealed in the UI, reveal it now
    if (status === "ROAST_REVEAL" && index >= revealedRoastCount) {
      setRevealedRoastCount(index + 1);
      const totalLines = roastData.roast.length;
      const baseMultiplier = intensity === "MILD" ? 0.35 : intensity === "MEDIUM" ? 0.7 : intensity === "NUCLEAR" ? 0.95 : 1.35;
      const targetGauge = Math.min(intensity === "BRUTAL" ? 135 : 100, Math.round(((index + 1) / totalLines) * 100 * baseMultiplier));
      setGaugeValue(targetGauge);
    }

    speakText(
      roastData.roast[index],
      () => {},
      () => {
        // Dramatic delay before moving to the next line
        setTimeout(() => {
          setIsSpeaking((current) => {
            if (current) {
              speakLineIndex(index + 1);
            }
            return current;
          });
        }, 1100);
      }
    );
  };

  const stopAudioRoast = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingIndex(null);
    setIsSpeakingToast(false);
  };

  const startAudioRoast = () => {
    if (!roastData) return;
    synth.playClick();
    setIsSpeaking(true);
    
    // If we are currently revealing lines, reset count to 1 and let narration drive it from the beginning
    if (status === "ROAST_REVEAL" && revealedRoastCount < roastData.roast.length) {
      setRevealedRoastCount(1);
      speakLineIndex(0);
    } else {
      speakLineIndex(0);
    }
  };

  // Clean up any ongoing narration when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Client-side image resize and compress to keep payload lightweight
  const processFiles = (fileList: File[]) => {
    const remainingSlots = 3 - genericImages.length;
    if (remainingSlots <= 0) {
      alert("You can upload a maximum of 3 images.");
      return;
    }
    
    const filesToProcess = fileList.slice(0, remainingSlots);
    
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Only images are supported.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDimension = 1024;
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75); // compress to JPG 75% quality
            setGenericImages((prev) => [...prev, { dataUrl: compressedDataUrl, mimeType: "image/jpeg" }]);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(Array.from(files));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleAddLink = () => {
    if (genericLinks.length < 3) {
      setGenericLinks([...genericLinks, ""]);
    }
  };

  const handleRemoveLink = (index: number) => {
    const updated = genericLinks.filter((_, idx) => idx !== index);
    setGenericLinks(updated.length > 0 ? updated : [""]);
  };

  const handleLinkChange = (index: number, val: string) => {
    const updated = [...genericLinks];
    updated[index] = val;
    setGenericLinks(updated);
  };

  // Sample data fallback for demo purposes if API/token limits are reached
  const getSampleStats = (user: string): GitHubStats => {
    return {
      username: user,
      name: user === "torvalds" ? "Linus Torvalds" : user === "gaearon" ? "Dan Abramov" : user === "yyx990803" ? "Evan You" : "Enthusiastic Coder",
      avatarUrl: `https://github.com/${user}.png`,
      bio: "Software developer & tech enthusiast obsessed with clean interfaces.",
      followers: 18200,
      following: 12,
      accountAgeYears: 9.4,
      createdAt: "2016-10-12T00:00:00Z",
      totalReposFetched: 42,
      noDescriptionCount: 19,
      graveyardCount: 24,
      lazyNamedReposCount: 7,
      lazyReposList: ["test-app", "demo-api", "asdf-v2", "my-notes", "practice-repo"],
      mostUsedLanguage: "TypeScript",
      languages: { "TypeScript": 65, "JavaScript": 20, "Rust": 10, "CSS": 5 },
      starredReposCount: 15,
      maxStars: 1420,
      totalStars: 2850,
      recentRepos: [
        { name: "test-app", description: "", language: "TypeScript", stars: 0, updatedAt: "2023-01-01" },
        { name: "revolutionary-core", description: "The actual code of the universe", language: "Rust", stars: 1420, updatedAt: "2026-05-15" },
        { name: "demo-api", description: "simple testing ground", language: "TypeScript", stars: 1, updatedAt: "2024-03-01" },
        { name: "asdf-v2", description: "", language: "JavaScript", stars: 0, updatedAt: "2022-09-12" },
      ]
    };
  };

  const handleSurpriseMe = () => {
    synth.playClick();
    const current = username.trim().toLowerCase();
    const pool = SURPRISE_DEVS.filter(d => d.username.toLowerCase() !== current);
    const chosen = pool.length > 0 
      ? pool[Math.floor(Math.random() * pool.length)]
      : SURPRISE_DEVS[Math.floor(Math.random() * SURPRISE_DEVS.length)];
      
    setUsername(chosen.username);
    startAnalysis(chosen.username);
  };

  const startAnalysis = async (targetUser: string) => {
    if (!targetUser.trim()) {
      setError("Please enter a valid GitHub username to begin.");
      return;
    }
    
    // Play startup telemetry sound effect
    synth.playAnalysisStart();

    setError(null);
    setStatus("FETCHING");
    setFetchStage("Accessing public registers...");
    setFetchProgress(10);
    setRevealedRoastCount(0);
    setGaugeValue(0);

    const steps = [
      { p: 25, label: "Scanning profile details & bio integrity..." },
      { p: 50, label: "Analyzing repositories & graveyard counts..." },
      { p: 75, label: "Compiling lazy naming heuristics..." },
      { p: 90, label: "Assembling structured roast signals..." },
      { p: 100, label: "Finalizing dataset..." }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setFetchProgress(steps[stepIdx].p);
        setFetchStage(steps[stepIdx].label);
        stepIdx++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    try {
      // Clean target username
      const cleanUser = targetUser.trim().replace(/^@/, "");
      
      let fetchedStats: GitHubStats;

      if (cleanUser.toLowerCase() === "rusty-dev") {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        fetchedStats = getSampleStats("rusty-dev");
      } else {
        const response = await fetch(`${API_BASE}/api/github-data?username=${encodeURIComponent(cleanUser)}`);
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "GitHub account scanning failed.");
        }
        fetchedStats = await response.json();
      }

      setStats(fetchedStats);
      setSessionMode("GITHUB");
      setFetchStage("Summoning the comedic elements...");
      
      // Request Roast from Gemini
      const roastResponse = await fetch(`${API_BASE}/api/roast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats: fetchedStats, intensity }),
      });

      if (!roastResponse.ok) {
        const errData = await roastResponse.json();
        throw new Error(errData.error || "Gemini roasting engine failed.");
      }

      const result: RoastResponse = await roastResponse.json();
      setRoastData(result);
      
      // Complete transition
      setTimeout(() => {
        setStatus("ROAST_REVEAL");
        setGaugeValue(25);
      }, 500);

    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "An unexpected error occurred during analysis.");
      setStatus("LANDING");
    }
  };

  const startGenericAnalysis = async () => {
    if (!ageGateConfirmed) {
      setError("Lightweight Age-Gate: You must confirm you are 18+ to begin.");
      return;
    }

    const hasBio = genericBio.trim().length > 0;
    const hasLinks = genericLinks.some(l => l.trim().length > 0);
    const hasImages = genericImages.length > 0;

    if (!hasBio && !hasLinks && !hasImages) {
      setError("Incomplete Submission: Please supply at least a bio, a link, or an image to fuel the roast.");
      return;
    }

    // Play startup telemetry sound effect
    synth.playAnalysisStart();

    setError(null);
    setStatus("FETCHING");
    setFetchStage("Verifying age-gate credentials & starting sandbox...");
    setFetchProgress(10);
    setRevealedRoastCount(0);
    setGaugeValue(0);

    const steps = [
      { p: 30, label: "Scanning submitted bio elements & tone..." },
      { p: 50, label: "Crawling link headers & meta-description integrity..." },
      { p: 75, label: "Decoding visual context clues & multimodal dimensions..." },
      { p: 90, label: "Summoning comedy writers..." },
      { p: 100, label: "Formulating critical assessment..." }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setFetchProgress(steps[stepIdx].p);
        setFetchStage(steps[stepIdx].label);
        stepIdx++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    try {
      const response = await fetch(`${API_BASE}/api/roast-generic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: genericName,
          bio: genericBio,
          links: genericLinks.filter(l => l.trim()),
          images: genericImages,
          intensity
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "The roasting engine failed to process these materials.");
      }

      const result = await response.json();
      setRoastData({
        roast: result.roast,
        toast: result.toast
      });
      setGenericSummary(result.summary);
      setSessionMode("GENERIC");

      setTimeout(() => {
        setStatus("ROAST_REVEAL");
        setGaugeValue(25);
      }, 500);

    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "An unexpected error occurred during generic analysis.");
      setStatus("LANDING");
    }
  };

  // Staggered stamp reveal trigger
  useEffect(() => {
    // If Web Speech narration is actively playing, let the voice player drive the line reveal rate instead
    if (isSpeaking) return;

    if (status === "ROAST_REVEAL" && roastData) {
      const totalLines = roastData.roast.length;
      if (revealedRoastCount < totalLines) {
        const timer = setTimeout(() => {
          const nextCount = revealedRoastCount + 1;
          setRevealedRoastCount(nextCount);
          
          // Calculate gauge intensity targets based on selected mode
          const baseMultiplier = intensity === "MILD" ? 0.35 : intensity === "MEDIUM" ? 0.7 : intensity === "NUCLEAR" ? 0.95 : 1.35;
          const targetGauge = Math.min(intensity === "BRUTAL" ? 135 : 100, Math.round((nextCount / totalLines) * 100 * baseMultiplier));
          setGaugeValue(targetGauge);

        }, 1800); // 1.8s delay between stamps for comedic pauses
        return () => clearTimeout(timer);
      } else {
        // Pivot to Act 2 (The Toast) after a solid gap
        const timer = setTimeout(() => {
          setStatus("TOAST_REVEAL");
        }, 2200);
        return () => clearTimeout(timer);
      }
    }
  }, [status, revealedRoastCount, roastData, intensity, isSpeaking]);

  // Procedural audio triggering based on reveal states
  useEffect(() => {
    if (status === "ROAST_REVEAL" && revealedRoastCount > 0) {
      synth.playStamp(intensity);
      if (revealedRoastCount === 1) {
        synth.startHum(intensity);
      }
    }
  }, [revealedRoastCount, status, intensity]);

  useEffect(() => {
    if (status === "TOAST_REVEAL" || status === "LANDING") {
      synth.stopHum();
    }
  }, [status]);

  const handleCopy = () => {
    if (!roastData) return;
    const isGitHub = sessionMode === "GITHUB";
    const title = isGitHub 
      ? `🔥 MY GITHUB ROAST (${intensity} INTENSITY):` 
      : `🔥 MY PASSION ROAST (${intensity} INTENSITY):`;
    const attribution = isGitHub 
      ? "Roast yours at Roast My GitHub!" 
      : "Roast anything at Roast My GitHub / Roast Anything!";

    const shareText = `${title}\n\n` + 
      roastData.roast.map(line => `• "${line}"`).join("\n") + 
      `\n\n💚 THE TOAST:\n"${roastData.toast}"\n\n${attribution}`;
    
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCard = async () => {
    if (!roastData) return;
    setDownloadingCard(true);
    try {
      if (sessionMode === "GITHUB" && stats) {
        await downloadRoastCard({
          mode: "GITHUB",
          name: stats.name || stats.username,
          usernameOrHandle: stats.username,
          avatarUrlOrBase64: stats.avatarUrl,
          bio: stats.bio,
          intensity,
          roast: roastData.roast,
          toast: roastData.toast,
          accountAgeYears: stats.accountAgeYears,
          totalReposFetched: stats.totalReposFetched,
          graveyardCount: stats.graveyardCount,
          mostUsedLanguage: stats.mostUsedLanguage
        });
      } else if (sessionMode === "GENERIC" && genericSummary) {
        await downloadRoastCard({
          mode: "GENERIC",
          name: genericSummary.name || "Anonymous",
          usernameOrHandle: genericSummary.name || "creator",
          avatarUrlOrBase64: (genericSummary.images && genericSummary.images[0]?.dataUrl) || "",
          bio: genericSummary.bio || "No description provided.",
          intensity,
          roast: roastData.roast,
          toast: roastData.toast,
          linkCount: genericSummary.links.length,
          imageCount: genericSummary.imageCount
        });
      }
    } catch (err: any) {
      console.error("Error creating download canvas:", err);
      // Fallback
      handleCopy();
    } finally {
      setDownloadingCard(false);
    }
  };

  const getIntensityDescription = (mode: RoastIntensity) => {
    switch (mode) {
      case "MILD": return "Teasing & playful. Good for sensitive souls.";
      case "MEDIUM": return "Direct, sharp, and targets common habits.";
      case "NUCLEAR": return "Utter destruction. No mercy for your graveyard.";
      case "BRUTAL": return "Soul-crushing existential crisis. Unhinged and dangerously savage. Strictly 18+.";
    }
  };

  const restart = () => {
    stopAudioRoast();
    setStats(null);
    setRoastData(null);
    setGenericSummary(null);
    setSessionMode(null);
    setStatus("LANDING");
    setRevealedRoastCount(0);
    setGaugeValue(0);
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-roast-red/20 selection:text-ink flex flex-col justify-between py-6 md:py-12 px-4 transition-colors duration-1000 relative overflow-hidden">
      {/* Visual background textures/borders resembling physical ledger paper */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[radial-gradient(#1a1a18_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Floating Theme Background Illustrations - Premium Hand-Coded Vectors with interactive Spring Motion */}
      {status === "LANDING" && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0 mix-blend-multiply">
          {/* Top Left Laughing Man */}
          <motion.div 
            whileHover={{ scale: 1.15, rotate: 6, opacity: 0.45 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="hidden md:block absolute top-[10%] left-[2%] lg:left-[4%] w-48 h-48 lg:w-64 lg:h-64 opacity-[0.06] transition-all duration-500 animate-float-1 pointer-events-none md:pointer-events-auto cursor-help" 
            title="Laughing at your late-night commits"
          >
            <LaughingManSVG />
          </motion.div>

          {/* Top Right Facepalm Monkey */}
          <motion.div 
            whileHover={{ scale: 1.15, rotate: -8, opacity: 0.45 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="hidden md:block absolute top-[15%] right-[2%] lg:right-[4%] w-44 h-44 lg:w-60 lg:h-60 opacity-[0.06] transition-all duration-500 animate-float-2 pointer-events-none md:pointer-events-auto cursor-help" 
            title="Facepalming at your empty READMEs"
          >
            <FacepalmMonkeySVG />
          </motion.div>

          {/* Bottom Left Horrified Cat */}
          <motion.div 
            whileHover={{ scale: 1.15, rotate: 5, opacity: 0.45 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="hidden md:block absolute bottom-[8%] left-[2%] lg:left-[5%] w-40 h-40 lg:w-56 lg:h-56 opacity-[0.06] transition-all duration-500 animate-float-3 pointer-events-none md:pointer-events-auto cursor-help" 
            title="Horrified by force pushes to main"
          >
            <HorrifiedCatSVG />
          </motion.div>

          {/* Bottom Right Glitched Bug Cup */}
          <motion.div 
            whileHover={{ scale: 1.15, rotate: -6, opacity: 0.45 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="hidden md:block absolute bottom-[12%] right-[2%] lg:right-[5%] w-36 h-36 lg:w-52 lg:h-52 opacity-[0.06] transition-all duration-500 animate-float-4 pointer-events-none md:pointer-events-auto cursor-help" 
            title="Crying mug overflowing with infinite loops"
          >
            <WailingMugSVG />
          </motion.div>
        </div>
      )}
      
      <header className="max-w-2xl mx-auto w-full text-center space-y-3 mb-8 z-10 relative">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-ink/10 pb-4 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-ink/10 rounded-full text-[10px] sm:text-xs font-mono tracking-wider bg-ink/5">
            <Github className="w-3 h-3 animate-spin-slow" /> AUTOMATED CODE REVIEW
          </div>
          <button
            type="button"
            onClick={() => {
              setIsMuted(!isMuted);
              // Small delay to let the state register before playing click if unmuted
              setTimeout(() => {
                if (isMuted) synth.playClick();
              }, 50);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink/5 hover:bg-ink/10 border border-ink/10 rounded-full text-[10px] sm:text-xs font-mono text-ink/70 hover:text-ink transition-all cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-roast-red animate-pulse" />
                <span>SOUNDS MUTED</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-toast-teal animate-bounce-slow" />
                <span>AUDIO ACTIVE</span>
              </>
            )}
          </button>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight uppercase leading-none text-ink pt-2">
          Roast My <span className="text-roast-red">GitHub</span>
        </h1>
        <p className="font-mono text-sm tracking-wide text-ink/70">
          Bureau of Unsolicited Opinions
        </p>
      </header>

      <main className="flex-grow flex items-center justify-center max-w-2xl mx-auto w-full z-10">
        <AnimatePresence mode="wait">
          {/* LANDING STATE */}
          {status === "LANDING" && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full rounded-2xl p-6 md:p-10 relative overflow-hidden space-y-8 neumorphic-card neumorphic-card-hover border border-white/50"
              id="landing-card"
            >
              {/* Symmetrical ledger margin line */}
              <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-roast-red/10 hidden md:block" />

              {/* Mode Switcher Tabs */}
              <div className="inline-flex p-1.5 gap-1.5 md:ml-8 rounded-xl bg-[#ebe5dc] border border-ink/5 mb-2 neumorphic-inset-well">
                <button
                  type="button"
                  onClick={() => { synth.playClick(); setActiveTab("GITHUB"); setError(null); }}
                  onMouseEnter={() => synth.playClick()}
                  className={`px-4 py-2 font-display text-xs font-extrabold uppercase tracking-wider transition-all rounded-lg flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "GITHUB" 
                      ? "bg-[#F2EDE4] text-ink border border-white/70 shadow-sm" 
                      : "text-ink/65 hover:text-ink hover:bg-white/20 border border-transparent"
                  }`}
                >
                  <Github className="w-3.5 h-3.5" /> Roast GitHub
                </button>
                <button
                  type="button"
                  onClick={() => { synth.playClick(); setActiveTab("GENERIC"); setError(null); }}
                  onMouseEnter={() => synth.playClick()}
                  className={`px-4 py-2 font-display text-xs font-extrabold uppercase tracking-wider transition-all rounded-lg flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "GENERIC" 
                      ? "bg-[#F2EDE4] text-ink border border-white/70 shadow-sm" 
                      : "text-ink/65 hover:text-ink hover:bg-white/20 border border-transparent"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-roast-red" /> Roast Anything
                </button>
              </div>

              {activeTab === "GITHUB" ? (
                <>
                  <div className="space-y-4 md:pl-8">
                    <div className="text-2xl md:text-3xl font-display font-extrabold uppercase leading-tight">
                      "We'll roast your GitHub. <br/>
                      <span className="text-toast-teal">Then we'll mean it.</span>"
                    </div>
                    <p className="text-sm md:text-base text-ink/80 leading-relaxed font-sans">
                      Your GitHub is the rawest diary of your late-night obsessions—the abandoned hacks, the meaningless commit messages, the READMEs left empty. Enter a username, choose your heat, and receive a savage critique paired with a genuine, earned tribute.
                    </p>
                  </div>

                  {/* Input section */}
                  <div className="space-y-6 md:pl-8">
                    <div className="space-y-2">
                      <label htmlFor="username-input" className="block text-xs font-mono uppercase tracking-wider text-ink/60">
                        GitHub Account Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink/40">
                          <span className="font-mono text-lg">@</span>
                        </div>
                        <input
                          id="username-input"
                          type="text"
                          className="block w-full pl-10 pr-4 py-4 bg-paper border border-ink/10 rounded-xl focus:outline-none font-mono text-lg transition-all placeholder:text-ink/30 neumorphic-input"
                          placeholder="e.g. torvalds"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && startAnalysis(username)}
                        />
                      </div>
                    </div>

                    {/* Intensity Selector */}
                    <div className="space-y-3">
                      <span className="block text-xs font-mono uppercase tracking-wider text-ink/60">
                        Roast Severity Level
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2 bg-[#ebe5dc] rounded-xl border border-ink/5 neumorphic-inset-well">
                        {(["MILD", "MEDIUM", "NUCLEAR", "BRUTAL"] as RoastIntensity[]).map((level) => (
                          <motion.button
                            key={level}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { synth.playClick(); setIntensity(level); }}
                            onMouseEnter={() => synth.playClick()}
                            className={`py-2.5 rounded-lg font-mono text-[10px] md:text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                              intensity === level 
                                ? level === "MILD" 
                                  ? "bg-paper text-ink shadow-md border border-ink/10" 
                                  : level === "MEDIUM"
                                    ? "bg-roast-red/10 text-roast-red border border-roast-red/25 shadow-sm"
                                    : level === "NUCLEAR"
                                      ? "bg-roast-red text-paper shadow-md"
                                      : "bg-black text-roast-red border border-roast-red/50 shadow-lg font-black bg-[linear-gradient(45deg,#0c0a09,#1c1917)] shadow-roast-red/20 animate-pulse"
                                : "text-ink/65 hover:text-ink hover:bg-paper/35"
                            }`}
                          >
                            {level}
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-xs font-sans text-ink/60 italic pl-1">
                        {getIntensityDescription(intensity)}
                      </p>
                    </div>

                    {error && (
                      <div className="p-4 bg-roast-red/5 border border-roast-red/20 rounded-xl flex gap-3 text-sm text-roast-red">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                          <span className="font-mono font-bold block uppercase text-xs mb-0.5">Assessment Failed</span>
                          {error}
                        </div>
                      </div>
                    )}

                    {/* Submit Trigger Group */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <motion.button
                        type="button"
                        id="submit-cta"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startAnalysis(username)}
                        onMouseEnter={() => synth.playClick()}
                        className="flex-grow bg-ink hover:bg-roast-red text-paper hover:text-paper font-display text-base tracking-widest py-4.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-extrabold uppercase shadow-lg group cursor-pointer"
                      >
                        Read Me For Filth
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSurpriseMe}
                        onMouseEnter={() => synth.playClick()}
                        className="sm:w-auto px-6 py-4.5 rounded-xl font-display text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0 border border-ink/10 neumorphic-btn text-ink"
                      >
                        <Sparkles className="w-4 h-4 text-roast-red" />
                        Surprise Me
                      </motion.button>
                    </div>
                  </div>

                  {/* Demo Pre-loads */}
                  <div className="pt-6 border-t border-ink/10 md:pl-8 space-y-3">
                    <span className="block text-[11px] font-mono uppercase tracking-wider text-ink/40">
                      Or examine notable records instantly:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {POPULAR_DEVS.map((dev) => (
                        <motion.button
                          key={dev.username}
                          whileHover={{ scale: 1.04, y: -0.5 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            synth.playClick();
                            setUsername(dev.username);
                            startAnalysis(dev.username);
                          }}
                          onMouseEnter={() => synth.playClick()}
                          className="px-3.5 py-2 rounded-lg border border-ink/10 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer neumorphic-btn text-ink"
                        >
                          <User className="w-3.5 h-3.5 text-ink/50" />
                          {dev.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4 md:pl-8">
                    <div className="text-2xl md:text-3xl font-display font-extrabold uppercase leading-tight">
                      "Roast absolutely anything. <br/>
                      <span className="text-toast-teal">Then we'll redeem it.</span>"
                    </div>
                    <p className="text-sm md:text-base text-ink/80 leading-relaxed font-sans">
                      Not a public developer? No worries. Submit your name, describe your absolute obsession, link your portfolio or project page, and upload screenshots of your artwork, coding setup, resume, or any evidence of your passion. Gemini's multimodal power will analyze all of it.
                    </p>
                  </div>

                  {/* Generic Input Fields form */}
                  <div className="space-y-6 md:pl-8">
                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="generic-name" className="block text-xs font-mono uppercase tracking-wider text-ink/60">
                        Your Name or Handle <span className="text-ink/30 font-sans italic">(Optional)</span>
                      </label>
                      <input
                        id="generic-name"
                        type="text"
                        className="block w-full px-4 py-4 bg-paper border border-ink/10 rounded-xl focus:outline-none font-sans text-base transition-all placeholder:text-ink/30 neumorphic-input"
                        placeholder="e.g. Linus / Jane / Indie Dev"
                        value={genericName}
                        onChange={(e) => setGenericName(e.target.value)}
                      />
                    </div>

                    {/* Bio / Passion free text */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label htmlFor="generic-bio" className="block text-xs font-mono uppercase tracking-wider text-ink/60">
                          Describe Your Passion, Project or Side Hustle
                        </label>
                        <span className="text-[10px] text-ink/40 font-mono">{genericBio.length}/1000</span>
                      </div>
                      <textarea
                        id="generic-bio"
                        maxLength={1000}
                        rows={4}
                        className="block w-full px-4 py-4 bg-paper border border-ink/10 rounded-xl focus:outline-none font-sans text-sm transition-all placeholder:text-ink/30 resize-none leading-relaxed neumorphic-input"
                        placeholder="What have you spent too many hours on lately? Your indie music, a chaotic excel workbook, a niche gaming collection, or your unpolished portfolio? Go on..."
                        value={genericBio}
                        onChange={(e) => setGenericBio(e.target.value)}
                      />
                    </div>

                    {/* Associated links */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-mono uppercase tracking-wider text-ink/60">
                          Web Links <span className="text-ink/30 font-sans italic">(Max 3)</span>
                        </label>
                        {genericLinks.length < 3 && (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddLink}
                            className="text-[10px] font-mono font-bold text-toast-teal flex items-center gap-1 hover:underline cursor-pointer px-2 py-1 rounded bg-[#ebe5dc] shadow-sm border border-ink/5"
                          >
                            <Plus className="w-3 h-3" /> Add Link
                          </motion.button>
                        )}
                      </div>
                      <div className="space-y-2.5">
                        {genericLinks.map((link, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <div className="relative flex-grow">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40">
                                <Globe className="w-4 h-4" />
                              </div>
                              <input
                                type="url"
                                className="block w-full pl-10 pr-4 py-3 bg-paper border border-ink/10 rounded-xl focus:outline-none font-mono text-xs transition-all placeholder:text-ink/30 neumorphic-input"
                                placeholder="https://myproject.com or social profile link"
                                value={link}
                                onChange={(e) => handleLinkChange(idx, e.target.value)}
                              />
                            </div>
                            {genericLinks.length > 1 && (
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRemoveLink(idx)}
                                className="p-3 text-ink/40 hover:text-roast-red rounded-xl hover:bg-roast-red/5 border border-ink/10 hover:border-roast-red/20 transition-all cursor-pointer neumorphic-btn"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Multimodal Image dropzone */}
                    <div className="space-y-2">
                      <span className="block text-xs font-mono uppercase tracking-wider text-ink/60">
                        Evidence Screen-Grabs / Images <span className="text-ink/30 font-sans italic">(Max 3)</span>
                      </span>
                      
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-5.5 text-center transition-all cursor-pointer relative ${
                          isDragging 
                            ? "border-roast-red bg-roast-red/[0.02]" 
                            : "border-ink/15 bg-[#ebe5dc]/30 neumorphic-inset-well hover:border-ink/30"
                        }`}
                      >
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleImageUpload}
                          disabled={genericImages.length >= 3}
                        />
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="p-2.5 bg-[#F2EDE4] border border-ink/10 rounded-xl shadow-sm text-ink/60 neumorphic-btn">
                            <ImageIcon className="w-5 h-5 text-roast-red animate-pulse" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-ink">
                              Drag & drop images here, or <span className="text-roast-red">browse</span>
                            </p>
                            <p className="text-[10px] text-ink/40 mt-0.5 font-mono">
                              PNG, JPG, WebP (up to 10MB)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Thumbnail Previews */}
                      {genericImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 pt-2">
                          {genericImages.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square border border-ink/10 rounded-xl overflow-hidden bg-ink/5">
                              <img 
                                src={img.dataUrl} 
                                alt="Upload thumbnail" 
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setGenericImages(genericImages.filter((_, i) => i !== idx))}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-ink/80 hover:bg-roast-red text-paper shadow transition-all cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Intensity Selector */}
                    <div className="space-y-3">
                      <span className="block text-xs font-mono uppercase tracking-wider text-ink/60">
                        Roast Severity Level
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2 bg-[#ebe5dc] rounded-xl border border-ink/5 neumorphic-inset-well">
                        {(["MILD", "MEDIUM", "NUCLEAR", "BRUTAL"] as RoastIntensity[]).map((level) => (
                          <motion.button
                            key={level}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { synth.playClick(); setIntensity(level); }}
                            onMouseEnter={() => synth.playClick()}
                            className={`py-2.5 rounded-lg font-mono text-[10px] md:text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                              intensity === level 
                                ? level === "MILD" 
                                  ? "bg-paper text-ink shadow-md border border-ink/10" 
                                  : level === "MEDIUM"
                                    ? "bg-roast-red/10 text-roast-red border border-roast-red/25 shadow-sm"
                                    : level === "NUCLEAR"
                                      ? "bg-roast-red text-paper shadow-md"
                                      : "bg-black text-roast-red border border-roast-red/50 shadow-lg font-black bg-[linear-gradient(45deg,#0c0a09,#1c1917)] shadow-roast-red/20 animate-pulse"
                                : "text-ink/65 hover:text-ink hover:bg-paper/35"
                            }`}
                          >
                            {level}
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-xs font-sans text-ink/60 italic pl-1">
                        {getIntensityDescription(intensity)}
                      </p>
                    </div>

                    {/* Age Gate and Permission Disclaimer */}
                    <div className="p-4 rounded-xl flex items-start gap-3 border border-ink/5 bg-[#ebe5dc]/35 neumorphic-inset-well">
                      <input
                        id="age-gate"
                        type="checkbox"
                        checked={ageGateConfirmed}
                        onChange={(e) => { synth.playClick(); setAgeGateConfirmed(e.target.checked); }}
                        className="mt-1 h-4 w-4 rounded border-ink/30 text-roast-red focus:ring-roast-red transition-all cursor-pointer accent-roast-red"
                      />
                      <label htmlFor="age-gate" className="text-xs text-ink/70 leading-relaxed cursor-pointer select-none">
                        <strong className="text-ink font-mono uppercase block text-[10px] tracking-wider mb-0.5">Safety & Permission Certification</strong>
                        I certify that I am 18 years of age or older, and that I have authority to submit this content for public algorithm comedic assessment. No appearance or body roasting is requested.
                      </label>
                    </div>

                    {error && (
                      <div className="p-4 bg-roast-red/5 border border-roast-red/20 rounded-xl flex gap-3 text-sm text-roast-red">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                          <span className="font-mono font-bold block uppercase text-xs mb-0.5">Assessment Failed</span>
                          {error}
                        </div>
                      </div>
                    )}

                    {/* Submit Generic Trigger */}
                    <motion.button
                      type="button"
                      onClick={startGenericAnalysis}
                      disabled={!ageGateConfirmed}
                      whileHover={ageGateConfirmed ? { scale: 1.02, y: -1 } : {}}
                      whileTap={ageGateConfirmed ? { scale: 0.98 } : {}}
                      onMouseEnter={() => synth.playClick()}
                      className="w-full bg-ink hover:bg-roast-red disabled:opacity-50 text-paper hover:text-paper font-display text-base tracking-widest py-4.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-extrabold uppercase shadow-lg group cursor-pointer"
                    >
                      Read Me For Filth
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* FETCHING / PROCESSING STATE */}
          {status === "FETCHING" && (
            <motion.div 
              key="fetching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 neumorphic-card border border-white/50"
            >
              {/* Dynamic Vintage Analog Level Meter */}
              <div className="relative w-48 h-24 border border-ink/10 rounded-t-full overflow-hidden flex items-end justify-center neumorphic-inset-well">
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-roast-red/5" />
                
                {/* Tick marks */}
                <div className="absolute inset-x-4 bottom-2 h-16 border-b border-dashed border-ink/20" />
                <div className="absolute inset-0 flex justify-between px-6 pt-6 pointer-events-none">
                  <span className="font-mono text-[9px] text-ink/40">0</span>
                  <span className="font-mono text-[9px] text-ink/40">50</span>
                  <span className="font-mono text-[9px] text-ink/40">100</span>
                </div>

                {/* Meter Center Circle */}
                <div className="absolute bottom-0 w-8 h-8 rounded-full bg-ink border border-ink/20 z-10 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-roast-red animate-pulse" />
                </div>

                {/* Dial Pin Needle */}
                <motion.div 
                  className="absolute bottom-0 left-[calc(50%-1px)] w-[2px] h-20 bg-roast-red origin-bottom z-0"
                  animate={{ rotate: [ -60, -30, -50, -10, -40, 20, -5 ] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                />
              </div>

              <div className="space-y-4 max-w-md">
                <div className="font-mono text-xs uppercase tracking-widest text-ink/50">
                  {activeTab === "GITHUB" ? `Retrieving @${username}` : `Analyzing ${genericName || "Anonymous Creator"}`}
                </div>
                <h3 className="text-xl font-display font-extrabold uppercase text-roast-red tracking-wide">
                  Compiling Sins
                </h3>
                
                {/* Simulated typewriter diagnostic readout */}
                <div className="bg-[#0f0e0c] text-paper p-4.5 rounded-xl font-mono text-left text-xs min-h-[76px] flex flex-col justify-center border border-ink border-l-4 border-l-roast-red shadow-inner">
                  <div className="flex items-start gap-2">
                    <span className="text-roast-red animate-pulse shrink-0">❯</span>
                    <span className="text-paper/90">{fetchStage}</span>
                  </div>
                </div>

                {/* Simple vintage horizontal bar fill */}
                <div className="w-full bg-ink/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-roast-red"
                    initial={{ width: "0%" }}
                    animate={{ width: `${fetchProgress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* REVEAL AND PERFORMANCE MODE */}
          {(status === "ROAST_REVEAL" || status === "TOAST_REVEAL") && roastData && (
            <motion.div 
              key="reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-6"
            >
              {/* Dashboard Metric Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-xl p-4.5 font-mono text-xs text-ink/80 relative neumorphic-inset-well border border-ink/5">
                {sessionMode === "GITHUB" && stats ? (
                  <>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-ink/40 uppercase tracking-wider">Account Tenure</span>
                      <div className="font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-ink/50" />
                        {stats.accountAgeYears.toFixed(1)} Years
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-ink/40 uppercase tracking-wider">Total Repositories</span>
                      <div className="font-bold flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5 text-ink/50" />
                        {stats.totalReposFetched}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-ink/40 uppercase tracking-wider">Primary Stack</span>
                      <div className="font-bold flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-roast-red/70 inline-block" />
                        {stats.mostUsedLanguage}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-ink/40 uppercase tracking-wider">Graveyard Count</span>
                      <div className="font-bold text-roast-red flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        {stats.graveyardCount} Repos
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-ink/40 uppercase tracking-wider">Assessment Type</span>
                      <div className="font-bold flex items-center gap-1 text-roast-red">
                        <Flame className="w-3.5 h-3.5" />
                        Roast Anything
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-ink/40 uppercase tracking-wider">Material Length</span>
                      <div className="font-bold flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5 text-ink/50" />
                        {genericSummary?.bio?.length || 0} Chars
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-ink/40 uppercase tracking-wider">Crawled Links</span>
                      <div className="font-bold flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-ink/50" />
                        {genericSummary?.links?.length || 0} Links
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-ink/40 uppercase tracking-wider">Evidence Scanned</span>
                      <div className="font-bold text-roast-red flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {genericSummary?.imageCount || 0} Images
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* The Central Obsession Scorecard */}
              <motion.div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transformStyle: "preserve-3d",
                  transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                  transition: "transform 0.15s ease-out"
                }}
                animate={
                  intensity === "BRUTAL" && status === "ROAST_REVEAL" 
                    ? {
                      x: [0, -1, 1, -1.5, 1.5, -1, 1, 0],
                      y: [0, 0.5, -0.5, 1, -1, 0.5, -0.5, 0],
                    } 
                    : {}
                }
                transition={
                  intensity === "BRUTAL" && status === "ROAST_REVEAL"
                    ? { repeat: Infinity, duration: 0.2 }
                    : undefined
                }
                className="rounded-2xl p-6 md:p-10 relative overflow-hidden space-y-8 min-h-[460px] flex flex-col justify-between neumorphic-card neumorphic-card-hover border border-white/60"
              >
                {/* Tactical glowing HUD grid when intensity is high */}
                {intensity === "BRUTAL" && (
                  <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(rgba(232,84,62,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(232,84,62,0.15)_1px,transparent_1px)] bg-[size:20px_20px]" />
                )}
                {intensity === "BRUTAL" && status === "ROAST_REVEAL" && (
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-roast-red/[0.03] to-transparent animate-pulse" />
                )}
                
                {/* Side ledger color code pivot bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-2.5 transition-colors duration-1000 ${
                  status === "TOAST_REVEAL" ? "bg-toast-teal" : "bg-roast-red"
                }`} />

                {/* Scorecard Header */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b border-ink/10 pb-4 md:pl-4">
                  <div className="flex items-center gap-3">
                    {sessionMode === "GITHUB" && stats ? (
                      <>
                        <img 
                          src={stats.avatarUrl} 
                          alt={stats.username} 
                          className="w-11 h-11 rounded-xl border border-ink/20 bg-ink/5"
                        />
                        <div>
                          <h4 className="font-display font-extrabold uppercase text-sm leading-none tracking-wider text-ink">
                            {stats.name}
                          </h4>
                          <span className="font-mono text-xs text-ink/50">
                            @{stats.username}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {(genericSummary?.images && genericSummary.images[0]?.dataUrl) ? (
                          <img 
                            src={genericSummary.images[0].dataUrl} 
                            alt={genericSummary.name || "Creator"} 
                            className="w-11 h-11 rounded-xl border border-ink/20 bg-ink/5 object-cover"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl border border-ink/25 bg-ink/5 flex items-center justify-center font-mono font-bold text-ink/60 uppercase">
                            {genericSummary?.name ? genericSummary.name.slice(0, 2) : "AN"}
                          </div>
                        )}
                        <div>
                          <h4 className="font-display font-extrabold uppercase text-sm leading-none tracking-wider text-ink">
                            {genericSummary?.name || "Anonymous Creator"}
                          </h4>
                          <span className="font-mono text-[10px] text-ink/50 uppercase tracking-wider">
                            ROAST ANYTHING RECIPIENT
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Heat Gauge Signature Element */}
                  <div className="flex items-center justify-between sm:justify-start gap-3 border border-ink/5 py-1.5 px-3 rounded-xl neumorphic-inset-well bg-[#ebe5dc] w-full sm:w-auto">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                      Gauge:
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 sm:w-20 h-3 bg-ink/10 rounded-full overflow-hidden relative">
                        <motion.div 
                          className={`h-full transition-colors duration-1000 ${
                            status === "TOAST_REVEAL" ? "bg-toast-teal" : "bg-roast-red"
                          }`}
                          animate={{ width: `${gaugeValue}%` }}
                          transition={{ type: "spring", stiffness: 80 }}
                        />
                      </div>
                      <span className={`font-mono text-[11px] font-extrabold ${
                        status === "TOAST_REVEAL" ? "text-toast-teal" : "text-roast-red"
                      }`}>
                        {gaugeValue}°C
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow flex flex-col justify-center space-y-5 md:pl-4">
                     {/* ACT 1: ROAST STAMPS */}
                  <div className="space-y-4">
                    {roastData.roast.map((line, idx) => {
                      const isRevealed = idx < revealedRoastCount;
                      if (!isRevealed) return null;
                      
                      const isLineSpeaking = isSpeaking && speakingIndex === idx;
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 2 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            type: "spring", 
                            damping: 14, 
                            stiffness: 140,
                          }}
                          className={`relative p-4.5 border rounded-xl overflow-hidden transition-all duration-300 ${
                            isLineSpeaking 
                              ? "border-roast-red/60 bg-roast-red/[0.04] shadow-md scale-[1.015]" 
                              : "border-dashed border-roast-red/20 bg-paper neumorphic-card"
                          }`}
                        >
                          {/* Ink Stamp Overlay */}
                          <div className="absolute right-4 top-2 pointer-events-none select-none opacity-10">
                            <span className="font-display font-bold text-3xl text-roast-red uppercase tracking-wider select-none transform rotate-12 inline-block">
                              Savage
                            </span>
                          </div>
 
                          <div className="flex gap-3 items-center justify-between relative z-10">
                            <div className="flex gap-3 items-start flex-grow">
                              <span className="flex items-center justify-center w-5 h-5 rounded bg-roast-red text-paper font-mono text-xs font-extrabold select-none shrink-0 mt-0.5 shadow-sm">
                                {idx + 1}
                              </span>
                              <p className={`text-sm md:text-base font-display font-bold uppercase tracking-wide transition-colors duration-300 ${
                                isLineSpeaking ? "text-roast-red" : "text-ink"
                              }`}>
                                {line}
                              </p>
                            </div>

                            {isLineSpeaking && (
                              <div className="flex items-end gap-0.5 h-4 select-none shrink-0 ml-2">
                                <span className="w-0.5 bg-roast-red rounded-full animate-wave-1 h-3" />
                                <span className="w-0.5 bg-roast-red rounded-full animate-wave-2 h-2" />
                                <span className="w-0.5 bg-roast-red rounded-full animate-wave-3 h-4" />
                                <span className="w-0.5 bg-roast-red rounded-full animate-wave-1 h-1.5" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* ACT 2: THE TOAST */}
                  {status === "TOAST_REVEAL" && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className={`mt-6 p-5.5 md:p-6.5 rounded-xl relative space-y-3 transition-all duration-300 ${
                        isSpeaking && isSpeakingToast 
                          ? "border-2 border-toast-teal/60 bg-toast-teal/[0.05] shadow-[0_4px_20px_rgba(46,125,110,0.15)] scale-[1.015]" 
                          : "border border-toast-teal/15 neumorphic-card"
                      }`}
                    >
                      <div className="absolute right-6 top-3 text-[10px] font-mono tracking-widest text-toast-teal/30 uppercase">
                        ACT II: THE TOAST
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-toast-teal font-mono text-xs uppercase tracking-wider font-extrabold">
                          <Award className="w-4 h-4" /> Earned Tribute / Redemption
                        </div>
                        {isSpeaking && isSpeakingToast && (
                          <div className="flex items-end gap-0.5 h-3.5 select-none shrink-0">
                            <span className="w-0.5 bg-toast-teal rounded-full animate-wave-1 h-2.5" />
                            <span className="w-0.5 bg-toast-teal rounded-full animate-wave-2 h-1.5" />
                            <span className="w-0.5 bg-toast-teal rounded-full animate-wave-3 h-3.5" />
                            <span className="w-0.5 bg-toast-teal rounded-full animate-wave-1 h-1" />
                          </div>
                        )}
                      </div>

                      <p className={`text-base md:text-lg font-sans font-medium italic leading-relaxed transition-colors duration-300 ${
                        isSpeaking && isSpeakingToast ? "text-toast-teal font-bold" : "text-ink"
                      }`}>
                        "{roastData.toast}"
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Bottom Controls */}
                <div className="border-t border-ink/10 pt-5 md:pl-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-mono text-ink/50">
                    {status === "ROAST_REVEAL" && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-roast-red animate-ping" />
                        Analyzing obsession logs ({revealedRoastCount}/{roastData.roast.length})...
                      </span>
                    )}
                    {status === "TOAST_REVEAL" && (
                      <span className="text-toast-teal font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Assessment complete & signed.
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={isSpeaking ? stopAudioRoast : startAudioRoast}
                      className={`flex-1 sm:flex-initial py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSpeaking 
                          ? "bg-roast-red text-paper shadow-md" 
                          : "border border-ink/10 neumorphic-btn text-ink"
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current animate-pulse" /> Stop Reading
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" /> Listen to Roast
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      disabled={downloadingCard}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDownloadCard}
                      className="flex-1 sm:flex-initial py-2.5 px-4 bg-roast-red text-paper hover:bg-[#d6432e] disabled:opacity-50 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      {downloadingCard ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-paper border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" /> Download Card
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCopy}
                      className="flex-1 sm:flex-initial py-2.5 px-4 bg-ink hover:bg-ink/90 text-paper rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-toast-teal" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Share Record
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={restart}
                      className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-ink/10 neumorphic-btn text-ink"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Start New Assessment
                    </motion.button>
                  </div>
                </div>

              </motion.div>

              {/* Extra Supporting Evidence Details (The physical ledger back) */}
              {status === "TOAST_REVEAL" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="rounded-xl p-5.5 space-y-4 neumorphic-card border border-white/50"
                >
                  {sessionMode === "GITHUB" && stats ? (
                    <>
                      <div className="flex items-center justify-between border-b border-ink/10 pb-2.5">
                        <h5 className="font-mono text-xs uppercase tracking-wider text-ink/50 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-toast-teal" /> Supporting Evidence & Demographics
                        </h5>
                        <span className="font-mono text-[10px] text-ink/40">ID: #{stats.username.toUpperCase()}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-ink/60">Lazy Named Repos:</span>
                            <span className="font-bold text-roast-red">{stats.lazyNamedReposCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink/60">Repos Missing Descriptions:</span>
                            <span className="font-bold">{stats.noDescriptionCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink/60">Followers to Following Ratio:</span>
                            <span className="font-bold">{(stats.followers / Math.max(1, stats.following)).toFixed(1)}x</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-ink/60 block">Language distribution metrics:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(stats.languages).map(([lang, pct]) => (
                              <span key={lang} className="border border-ink/5 px-2 py-1 rounded text-[10px] font-bold neumorphic-btn bg-paper text-ink">
                                {lang}: {pct}%
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : genericSummary ? (
                    <>
                      <div className="flex items-center justify-between border-b border-ink/10 pb-2.5">
                        <h5 className="font-mono text-xs uppercase tracking-wider text-ink/50 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-toast-teal" /> Crawled Evidence & Media Analysis
                        </h5>
                        <span className="font-mono text-[10px] text-ink/40">ASSESSMENT: #MULTIMODAL</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div className="space-y-3">
                          <span className="text-ink/60 block uppercase text-[10px] tracking-wider">Bio Extract:</span>
                          <p className="text-ink/80 italic line-clamp-3 p-3 rounded-lg border border-ink/5 text-[11px] font-sans neumorphic-inset-well bg-[#ebe5dc]/40">
                            "{genericSummary.bio || "No description provided"}"
                          </p>
                        </div>

                        <div className="space-y-2">
                          <span className="text-ink/60 block uppercase text-[10px] tracking-wider">Crawled Links Status:</span>
                          {genericSummary.links.length > 0 ? (
                            <div className="space-y-1.5">
                              {genericSummary.links.map((link, idx) => (
                                <div key={idx} className="border border-ink/5 p-2.5 rounded-lg text-[10px] flex flex-col neumorphic-card bg-paper">
                                  <span className="font-bold text-ink truncate">{link.title || "Untitled Resource"}</span>
                                  <span className="text-ink/50 truncate text-[9px]">{link.url}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-ink/40 italic text-[11px]">No links scanned.</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : null}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-2xl mx-auto w-full text-center mt-12 space-y-4 z-10 border-t border-ink/10 pt-6">
        <p className="text-xs font-mono text-ink/40">
          Made in pure TypeScript and Tailwind CSS. All rights reserved. 
        </p>
        <div className="flex justify-center gap-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-mono text-ink/50 hover:text-roast-red transition-colors flex items-center gap-1"
          >
            <Github className="w-3.5 h-3.5" /> GitHub Docs
          </a>
          <span className="text-ink/20 font-mono">|</span>
          <a 
            href="https://ai.google.dev/gemini-api" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-mono text-ink/50 hover:text-toast-teal transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini
          </a>
        </div>
      </footer>
    </div>
  );
}
