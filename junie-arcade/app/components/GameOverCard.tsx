"use client";

import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import FlagIcon from "./FlagIcon";
import { api } from "@/app/lib/api";

interface GameOverCardProps {
  username: string;
  country: string;
  score: number;
  gameType: "REFLEX_ARENA" | "JUMP_MASTER" | "MEMORY_MATCH" | "OVERALL";
  stats: {
    label: string;
    value: string | number;
    color?: string;
  }[];
  onSaveScore: () => void | Promise<void>;
  isSaving: boolean;
}

// Esports-inspired accent colors per game type
const GAME_THEMES = {
  REFLEX_ARENA: {
    primary: "#ff4655",
    secondary: "#fd4556",
    glow: "rgba(255, 70, 85, 0.4)",
    gradient: "from-[#ff4655] via-[#fd4556] to-[#ff7566]",
    darkGradient: "from-[#ff4655]/20 to-[#ff4655]/5",
    name: "Reflex Arena",
    tagline: "PRECISION COMBAT",
  },
  JUMP_MASTER: {
    primary: "#00eeff",
    secondary: "#0ff",
    glow: "rgba(0, 238, 255, 0.4)",
    gradient: "from-[#00eeff] via-[#00d4ff] to-[#00b4ff]",
    darkGradient: "from-[#00eeff]/20 to-[#00eeff]/5",
    name: "Jump Master",
    tagline: "AERIAL SUPERIORITY",
  },
  MEMORY_MATCH: {
    primary: "#c284f9",
    secondary: "#a855f7",
    glow: "rgba(194, 132, 249, 0.4)",
    gradient: "from-[#c284f9] via-[#a855f7] to-[#9333ea]",
    darkGradient: "from-[#c284f9]/20 to-[#c284f9]/5",
    name: "Memory Match",
    tagline: "NEURAL EXCELLENCE",
  },
  OVERALL: {
    primary: "#10b981",
    secondary: "#06d6a0",
    glow: "rgba(16, 185, 129, 0.4)",
    gradient: "from-emerald-400 via-cyan-500 to-teal-400",
    darkGradient: "from-emerald-500/20 to-cyan-500/5",
    name: "Ultimate Champion",
    tagline: "TOURNAMENT VICTOR",
  },
};

export default function GameOverCard({
  username,
  country,
  score,
  gameType,
  stats,
  onSaveScore,
  isSaving,
}: GameOverCardProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [tempSelfie, setTempSelfie] = useState<string | null>(null);
  const [countries, setCountries] = useState<
    Array<{ name: string; flag: string; code: string }>
  >([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [hasAutoSaved, setHasAutoSaved] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [captureCountdown, setCaptureCountdown] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [allRanks, setAllRanks] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedJunie, setSelectedJunie] = useState<string>("");
  const [selectedHero, setSelectedHero] = useState<string>("");
  const [junieIndex, setJunieIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  // Pre-load html-to-image for faster first save/download
  useEffect(() => {
    import("html-to-image").then(() => {
      // html-to-image pre-loaded
    });
  }, []);

  // For OVERALL card: Extract ranks from stats as fallback if API fetch fails
  useEffect(() => {
    if (gameType === "OVERALL" && !allRanks && stats.length > 0) {
      const extractRank = (label: string) => {
        const stat = stats.find((s) =>
          s.label.toLowerCase().includes(label.toLowerCase()),
        );
        if (
          stat &&
          typeof stat.value === "string" &&
          stat.value.startsWith("#")
        ) {
          return parseInt(stat.value.replace("#", ""), 10);
        }
        return null;
      };

      const extractedRanks = {
        overall: extractRank("overall rank"),
        reflex: extractRank("reflex rank"),
        jump: extractRank("jump rank"),
        memory: extractRank("memory rank"),
      };

      // Only set if we found at least the overall rank
      if (extractedRanks.overall) {
        setAllRanks(extractedRanks);
      }
    }
  }, [gameType, stats, allRanks]);

  const junies = [
    "junie-happy.png",
    "junie-jump.png",
    "junie-run-1.png",
    "junie-run-3.png",
    "junie-idle.png",
    "junie-run-2.png",
    "junie-sad.png",
    "junie-run-4.png",
    "junie-run-5.png",
  ];

  const heroes = [
    "APA.png",
    "Blaber.png",
    "Thanatos.png",
    "Xeppaa.png",
    "Zellsis.png",
    "Zven.png",
    "penny.png",
    "v1c.png",
    "oxy.png",
    "vulcan.png",
  ];

  useEffect(() => {
    // Selection that is unique for this specific game over instance
    const initialJunieIdx = Math.floor(Math.random() * junies.length);
    const initialHeroIdx = Math.floor(Math.random() * heroes.length);

    setJunieIndex(initialJunieIdx);
    setHeroIndex(initialHeroIdx);
    setSelectedJunie(junies[initialJunieIdx]);
    setSelectedHero(heroes[initialHeroIdx]);
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/countries");
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };
    fetchCountries();
  }, []);

  // Auto-save score and then fetch rankings
  useEffect(() => {
    const saveAndFetchRankings = async () => {
      if (hasAutoSaved) return;

      // For OVERALL card, skip saving (already saved) and just fetch rankings
      if (gameType !== "OVERALL") {
        // First, save the score
        try {
          await onSaveScore();
        } catch (error) {
          console.error("Failed to save score:", error);
        }
      }

      setHasAutoSaved(true);

      // Wait a bit for the database to update (shorter wait for OVERALL since no save)
      await new Promise((resolve) =>
        setTimeout(resolve, gameType === "OVERALL" ? 100 : 500),
      );

      // Then fetch rankings
      const playerId = localStorage.getItem("junie_player_id");
      if (playerId) {
        try {
          // Use a timestamp to prevent cached responses
          const response = await fetch(
            `/api/leaderboard?view=overall&playerId=${playerId}&t=${Date.now()}`,
          );
          const data = await response.json();
          if (data.currentPlayer) {
            setAllRanks({
              overall:
                data.currentPlayer.rank ||
                (data.leaderboard &&
                  data.leaderboard.findIndex(
                    (p: any) => p.playerId === playerId,
                  ) + 1),
              reflex:
                data.currentPlayer.reflexScore > 0
                  ? data.currentPlayer.reflexRank || 1
                  : null,
              jump:
                data.currentPlayer.jumpScore > 0
                  ? data.currentPlayer.jumpRank || 1
                  : null,
              memory:
                data.currentPlayer.memoryScore > 0
                  ? data.currentPlayer.memoryRank || 1
                  : null,
            });
          }
        } catch (error) {
          console.error("Failed to fetch rankings:", error);
        }
      }
    };

    saveAndFetchRankings();
  }, [hasAutoSaved, onSaveScore, gameType]);

  // Auto-start camera with 5-second countdown when game over card appears
  useEffect(() => {
    // Small delay to allow initial animations to settle
    const timer = setTimeout(() => {
      setCountdown(5);

      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            // Auto-start camera when countdown reaches 0
            startCamera();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const getCountryCode = () => {
    // If country is already a 2-character code, return it
    if (country && country.length === 2) return country.toUpperCase();
    const countryData = countries.find((c) => c.name === country);
    return countryData?.code || "US";
  };

  // Get current game theme
  const theme = GAME_THEMES[gameType] || GAME_THEMES.OVERALL;

  const getGameLogo = () => {
    switch (gameType) {
      case "REFLEX_ARENA":
        return "/assets/images/logos/game_logo/reflex_arena.png";
      case "JUMP_MASTER":
        return "/assets/images/logos/game_logo/jump_master.png";
      case "MEMORY_MATCH":
        return "/assets/images/logos/game_logo/memory_match.png";
      case "OVERALL":
        return "/assets/images/logos/game_logo/j_arcade.png";
      default:
        return null;
    }
  };

  const getGameTitle = () => theme.name;

  const getGameColor = () => theme.gradient;

  const getGameGlow = () => `shadow-[${theme.primary}]/30`;

  const getAccentColor = () => `text-[${theme.primary}]`;

  const startCamera = async () => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: isMobile ? 720 : 1080 },
          height: { ideal: isMobile ? 1280 : 1350 },
          aspectRatio: { ideal: 0.8 }, // 4:5 ratio
        },
      });
      streamRef.current = stream;
      setShowCamera(true);

      // Wait a bit for React to render the video element
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err);
            alert("Unable to start camera preview.");
          });
        }
      }, 200);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const takeSelfie = () => {
    setCaptureCountdown(5);

    const countdownInterval = setInterval(() => {
      setCaptureCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          // Take the photo
          if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              const imageData = canvas.toDataURL("image/png");
              setTempSelfie(imageData);
            }
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const confirmSelfie = () => {
    if (tempSelfie) {
      setSelfieData(tempSelfie);
      setTempSelfie(null);
      stopCamera();
    }
  };

  const retakeSelfie = () => {
    setTempSelfie(null);
    setCaptureCountdown(null);
    // Give React time to unmount the image and mount the video element
    setTimeout(() => {
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch((err) => {
          console.error("Error resuming video:", err);
          // If playback fails, try to restart the camera completely
          startCamera();
        });
      } else {
        // If refs are missing, restart camera
        startCamera();
      }
    }, 100);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setTempSelfie(null);
  };

  const saveCardToS3 = async () => {
    if (!cardRef.current) return;
    setIsUploading(true);

    try {
      const { toJpeg } = await import("html-to-image");
      const dataUrl = await toJpeg(cardRef.current, {
        backgroundColor: "#0f1923",
        pixelRatio: 1.5,
        quality: 0.85,
        filter: (node) => {
          if (
            node instanceof HTMLElement &&
            node.dataset.exportHide === "true"
          ) {
            return false;
          }
          return true;
        },
      });

      const filename = `card-${username}-${score}-${Date.now()}.jpg`;
      const response = await api.post("/api/upload-card", {
        image: dataUrl,
        filename,
        username,
        score,
        gameType,
        country,
      });

      const data = await response.json();
      if (data.url) {
        setUploadedUrl(data.url);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Failed to upload card:", error);
      alert("Failed to save card to cloud. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) {
      console.error("Card ref is not available");
      return;
    }

    setIsDownloading(true);

    try {
      // Dynamically import html-to-image
      const { toPng } = await import("html-to-image");

      if (!cardRef.current) throw new Error("Card ref not found");

      // Capture the card as PNG using html-to-image
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#0f1923",
        pixelRatio: 1.5,
        filter: (node) => {
          // Hide elements with 'data-export-hide' attribute
          if (
            node instanceof HTMLElement &&
            node.dataset.exportHide === "true"
          ) {
            return false;
          }
          return true;
        },
        style: {
          // Ensure the card looks consistent during capture
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      const link = document.createElement("a");
      const timestamp = new Date().getTime();
      link.download = `junie-arcade-${username}-${score}-${timestamp}.png`;
      link.href = dataUrl;
      link.click();

      setIsDownloading(false);
    } catch (error) {
      console.error(
        "html-to-image error, falling back to manual canvas:",
        error,
      );

      try {
        // Fallback to manual high-quality canvas drawing

        // Create a premium, high-quality canvas (landscape format)
        const canvas = document.createElement("canvas");
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        // Helper function to draw rounded rectangle
        const roundRect = (
          x: number,
          y: number,
          w: number,
          h: number,
          r: number,
        ) => {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
        };

        // Get game colors
        const gameColors = {
          primary:
            gameType === "REFLEX_ARENA"
              ? "#ff4655"
              : gameType === "JUMP_MASTER"
                ? "#00eeff"
                : "#c284f9",
          secondary: "#ffffff",
          dark: "#0f1923",
        };

        // Premium dark background with noise texture
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, "#0a0f1e");
        bgGradient.addColorStop(0.5, "#111827");
        bgGradient.addColorStop(1, "#0a0f1e");
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle grid pattern
        ctx.globalAlpha = 0.02;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 50) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
          ctx.stroke();
        }
        for (let j = 0; j < canvas.height; j += 50) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(canvas.width, j);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Top accent gradient bar
        const topGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        topGradient.addColorStop(0, gameColors.primary);
        topGradient.addColorStop(0.5, gameColors.secondary);
        topGradient.addColorStop(1, gameColors.primary);
        ctx.fillStyle = topGradient;
        ctx.fillRect(0, 0, canvas.width, 8);

        // Load and draw all images first
        const loadImage = (src: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = document.createElement("img");
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
          });
        };

        // Draw everything - inspired by Valorant/League of Legends
        const drawComplete = async () => {
          // Hero background (subtle, large)
          if (selectedHero) {
            try {
              const heroImg = await loadImage(
                `/assets/images/hero/${selectedHero}`,
              );
              const heroHeight = canvas.height * 0.9;
              const heroWidth = (heroImg.width / heroImg.height) * heroHeight;
              ctx.globalAlpha = 0.12;
              ctx.drawImage(
                heroImg,
                canvas.width - heroWidth + 100,
                (canvas.height - heroHeight) / 2,
                heroWidth,
                heroHeight,
              );
              ctx.globalAlpha = 1;
            } catch (err) {
              // Hero image failed to load for fallback
            }
          }

          // Small Mascot background (top left)
          if (selectedJunie) {
            try {
              const mascotImg = await loadImage(
                `/assets/images/junie/${selectedJunie}`,
              );
              const mascotSize = 120;
              ctx.globalAlpha = 0.15;
              ctx.drawImage(mascotImg, 50, 150, mascotSize, mascotSize);
              ctx.globalAlpha = 1;
            } catch (err) {
              // Small mascot image failed to load for fallback
            }
          }

          // Diagonal accent lines (Valorant style)
          ctx.globalAlpha = 0.1;
          ctx.strokeStyle = gameColors.primary;
          ctx.lineWidth = 3;
          for (let i = -canvas.height; i < canvas.width; i += 80) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + canvas.height, canvas.height);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;

          try {
            const junieMascotPath =
              selectedJunie && selectedJunie.length > 0
                ? `/assets/images/junie/${selectedJunie}`
                : "/assets/images/junie/junie-happy.png";
            // Load all images including Junie mascot
            const [junieLogo, cloud9Logo, jetbrainsLogo, junieMascot] =
              await Promise.all([
                loadImage("/assets/images/logos/junie-logo.png"),
                loadImage("/assets/images/logos/cloud9-logo.png"),
                loadImage("/assets/images/logos/jetbrains-logo.png"),
                loadImage(
                  `/assets/images/junie/${selectedJunie || "junie-happy.png"}`,
                ),
                loadImage(junieMascotPath),
              ]).catch(() => [null, null, null, null]);

            // Top section with logos and branding
            if (junieLogo) {
              ctx.globalAlpha = 0.9;
              ctx.drawImage(junieLogo, 30, 30, 90, 90);
              ctx.globalAlpha = 1;
            }

            // Sponsor logos (top right)
            const logoY = 35;
            if (jetbrainsLogo) {
              ctx.globalAlpha = 0.85;
              ctx.drawImage(jetbrainsLogo, canvas.width - 110, logoY, 70, 70);
              ctx.globalAlpha = 1;
            }
            if (cloud9Logo) {
              ctx.globalAlpha = 0.85;
              ctx.drawImage(cloud9Logo, canvas.width - 200, logoY, 70, 70);
              ctx.globalAlpha = 1;
            }

            // Add Junie mascot (happy) on the left side
            if (junieMascot) {
              const mascotSize = 350;
              const mascotX = 30;
              const mascotY = canvas.height / 2 - mascotSize / 2;

              // Glow effect behind Junie
              ctx.shadowColor = gameColors.primary;
              ctx.shadowBlur = 50;
              ctx.globalAlpha = 0.9;
              ctx.drawImage(
                junieMascot,
                mascotX,
                mascotY,
                mascotSize,
                mascotSize,
              );
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
            }
          } catch (err) {
            // Images failed to load, continuing
          }

          // Main title section (League/Valorant style)
          const titleY = 140;

          // Large "MISSION ACCOMPLISHED" text with glow
          ctx.textAlign = "center";
          ctx.font = "bold 90px system-ui, -apple-system, sans-serif";

          // Text shadow/glow effect
          ctx.shadowColor = gameColors.primary;
          ctx.shadowBlur = 50;
          ctx.fillStyle = "#ffffff";
          ctx.fillText("MISSION ACCOMPLISHED", canvas.width / 2, titleY);

          // Second layer for stronger glow
          ctx.shadowBlur = 30;
          ctx.fillText("MISSION ACCOMPLISHED", canvas.width / 2, titleY);

          ctx.shadowBlur = 0;

          // Accent line under VICTORY
          const lineY = titleY + 20;
          ctx.strokeStyle = gameColors.primary;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 - 200, lineY);
          ctx.lineTo(canvas.width / 2 + 200, lineY);
          ctx.stroke();

          // Game type badge
          ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
          ctx.fillStyle = gameColors.secondary;
          ctx.fillText(
            getGameTitle().toUpperCase(),
            canvas.width / 2,
            lineY + 45,
          );

          // Champion photo section with hexagon frame (Valorant style)
          let contentY = 260;
          if (selfieData) {
            const selfieImg = document.createElement("img");
            selfieImg.src = selfieData;
            await new Promise((resolve) => {
              selfieImg.onload = () => {
                const photoSize = 320;
                const photoX = (canvas.width - photoSize) / 2;

                // Hexagonal glow background
                ctx.shadowColor = gameColors.primary;
                ctx.shadowBlur = 60;
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = gameColors.primary;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                  const angle = (Math.PI / 3) * i;
                  const x =
                    photoX +
                    photoSize / 2 +
                    Math.cos(angle) * (photoSize / 2 + 20);
                  const y =
                    contentY +
                    photoSize / 2 +
                    Math.sin(angle) * (photoSize / 2 + 20);
                  if (i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;

                // Circular photo with enhanced border
                ctx.save();
                ctx.beginPath();
                ctx.arc(
                  photoX + photoSize / 2,
                  contentY + photoSize / 2,
                  photoSize / 2,
                  0,
                  Math.PI * 2,
                );
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(
                  selfieImg,
                  photoX,
                  contentY,
                  photoSize,
                  photoSize,
                );
                ctx.restore();

                // Double border ring effect
                ctx.strokeStyle = gameColors.primary;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(
                  photoX + photoSize / 2,
                  contentY + photoSize / 2,
                  photoSize / 2 + 3,
                  0,
                  Math.PI * 2,
                );
                ctx.stroke();

                ctx.strokeStyle = gameColors.secondary;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(
                  photoX + photoSize / 2,
                  contentY + photoSize / 2,
                  photoSize / 2 + 12,
                  0,
                  Math.PI * 2,
                );
                ctx.stroke();

                // Corner accent marks (Valorant style)
                const corners = [
                  { x: photoX - 20, y: contentY - 20 },
                  { x: photoX + photoSize + 20, y: contentY - 20 },
                  { x: photoX - 20, y: contentY + photoSize + 20 },
                  { x: photoX + photoSize + 20, y: contentY + photoSize + 20 },
                ];
                ctx.strokeStyle = gameColors.primary;
                ctx.lineWidth = 3;
                corners.forEach((corner, idx) => {
                  const size = 25;
                  ctx.beginPath();
                  if (idx === 0) {
                    // Top-left
                    ctx.moveTo(corner.x, corner.y + size);
                    ctx.lineTo(corner.x, corner.y);
                    ctx.lineTo(corner.x + size, corner.y);
                  } else if (idx === 1) {
                    // Top-right
                    ctx.moveTo(corner.x - size, corner.y);
                    ctx.lineTo(corner.x, corner.y);
                    ctx.lineTo(corner.x, corner.y + size);
                  } else if (idx === 2) {
                    // Bottom-left
                    ctx.moveTo(corner.x, corner.y - size);
                    ctx.lineTo(corner.x, corner.y);
                    ctx.lineTo(corner.x + size, corner.y);
                  } else {
                    // Bottom-right
                    ctx.moveTo(corner.x - size, corner.y);
                    ctx.lineTo(corner.x, corner.y);
                    ctx.lineTo(corner.x, corner.y - size);
                  }
                  ctx.stroke();
                });

                contentY += photoSize + 50;
                resolve(true);
              };
              selfieImg.onerror = () => resolve(false);
            });
          }

          // Player info panel (League style)
          const infoY = contentY;

          // Player name card
          const nameCardHeight = 140;
          roundRect(50, infoY, canvas.width - 100, nameCardHeight, 15);
          ctx.fillStyle = "rgba(17, 24, 39, 0.85)";
          ctx.fill();
          ctx.strokeStyle = gameColors.primary;
          ctx.lineWidth = 2;
          ctx.stroke();

          // "CHAMPION" label
          ctx.fillStyle = gameColors.primary;
          ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("CHAMPION", canvas.width / 2, infoY + 35);

          // Player name with flag (larger)
          const flagEmoji = ""; // getCountryFlag() || ''
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 52px system-ui, -apple-system, sans-serif";
          ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
          ctx.shadowBlur = 15;
          ctx.fillText(`${username}`, canvas.width / 2, infoY + 80);
          ctx.shadowBlur = 0;

          // Country
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.font = "22px system-ui, -apple-system, sans-serif";
          ctx.fillText(country, canvas.width / 2, infoY + 115);

          // Massive score display (Valorant style)
          const scoreY = infoY + 170;

          // Draw Ranks if available
          if (allRanks) {
            const rankY = scoreY - 40;
            const rankWidth = (canvas.width - 160) / 4;
            const rankHeight = 100;

            const ranks = [
              {
                label: "OVERALL",
                val: allRanks.overall,
                color: "#10b981",
                bg: "rgba(16, 185, 129, 0.1)",
              },
              {
                label: "REFLEX",
                val: allRanks.reflex,
                color: "#eab308",
                bg: "rgba(234, 179, 8, 0.1)",
              },
              {
                label: "JUMP",
                val: allRanks.jump,
                color: "#06b6d4",
                bg: "rgba(6, 182, 212, 0.1)",
              },
              {
                label: "MEMORY",
                val: allRanks.memory,
                color: "#a855f7",
                bg: "rgba(168, 85, 247, 0.1)",
              },
            ];

            ranks.forEach((r, i) => {
              const rx = 80 + i * (rankWidth + 20);

              // Rank Box
              roundRect(rx, rankY, rankWidth, rankHeight, 10);
              ctx.fillStyle = r.bg;
              ctx.fill();
              ctx.strokeStyle = r.color;
              ctx.lineWidth = 1;
              ctx.globalAlpha = 0.3;
              ctx.stroke();
              ctx.globalAlpha = 1;

              // Rank Label
              ctx.fillStyle = r.color;
              ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
              ctx.textAlign = "center";
              ctx.fillText(r.label, rx + rankWidth / 2, rankY + 35);

              // Rank Value
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
              ctx.fillText(`#${r.val || "--"}`, rx + rankWidth / 2, rankY + 80);
            });
          }

          // Score background panel
          const adjustedScoreY = allRanks ? scoreY + 60 : scoreY;
          roundRect(50, adjustedScoreY, canvas.width - 100, 220, 15);
          const scoreGradient = ctx.createLinearGradient(
            50,
            adjustedScoreY,
            canvas.width - 50,
            adjustedScoreY,
          );
          scoreGradient.addColorStop(0, "rgba(17, 24, 39, 0.95)");
          scoreGradient.addColorStop(0.5, "rgba(30, 41, 59, 0.95)");
          scoreGradient.addColorStop(1, "rgba(17, 24, 39, 0.95)");
          ctx.fillStyle = scoreGradient;
          ctx.fill();

          // Score accent border
          ctx.strokeStyle = gameColors.primary;
          ctx.lineWidth = 3;
          ctx.stroke();

          // Top accent line inside
          ctx.strokeStyle = gameColors.secondary;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(70, adjustedScoreY + 20);
          ctx.lineTo(canvas.width - 70, adjustedScoreY + 20);
          ctx.stroke();

          // "FINAL SCORE" label
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
          ctx.fillText("FINAL SCORE", canvas.width / 2, adjustedScoreY + 55);

          // The actual score - HUGE
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 110px system-ui, -apple-system, sans-serif";
          ctx.shadowColor = gameColors.primary;
          ctx.shadowBlur = 40;
          ctx.fillText(
            score.toLocaleString(),
            canvas.width / 2,
            adjustedScoreY + 145,
          );
          ctx.shadowBlur = 20;
          ctx.fillText(
            score.toLocaleString(),
            canvas.width / 2,
            adjustedScoreY + 145,
          );
          ctx.shadowBlur = 0;

          // "POINTS" label
          ctx.fillStyle = gameColors.secondary;
          ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
          ctx.fillText("POINTS", canvas.width / 2, adjustedScoreY + 185);

          // Stats section (compact Valorant style)
          const statsY = adjustedScoreY + 250;
          const statsPadding = 40;
          const statsWidth = canvas.width - statsPadding * 2;
          const statBoxHeight = 90;
          const statBoxMargin = 15;

          stats.forEach((stat, index) => {
            const y = statsY + index * (statBoxHeight + statBoxMargin);

            // Stat box
            roundRect(statsPadding, y, statsWidth, statBoxHeight, 10);
            ctx.fillStyle = "rgba(30, 41, 59, 0.6)";
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Accent line on left
            ctx.fillStyle = gameColors.primary;
            ctx.fillRect(statsPadding, y, 5, statBoxHeight);

            // Stat label
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(stat.label.toUpperCase(), statsPadding + 25, y + 35);

            // Stat value
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 40px system-ui, -apple-system, sans-serif";
            const statText = String(stat.value);
            ctx.fillText(
              statText.length > 15
                ? statText.substring(0, 13) + "..."
                : statText,
              statsPadding + 25,
              y + 70,
            );
          });

          // QR Code and Logos (bottom right)
          const qrSize = 200;
          const qrX = canvas.width - qrSize - 60;
          const qrY = allRanks ? statsY + 100 : statsY + 50;

          try {
            // Draw Secure Code (QR) background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

            const qrImg = await loadImage(qrCodeUrl);
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            // "SECURE CODE" text
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "right";
            ctx.fillText("SECURE CODE", canvas.width - 60, qrY - 25);

            // Note: Branding logos are displayed at the top of the card
          } catch (err) {
            // QR/Branding failed to load for fallback
          }

          // Footer section
          const footerY = canvas.height - 70;

          // Separator line
          ctx.strokeStyle = gameColors.primary;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.moveTo(40, footerY);
          ctx.lineTo(canvas.width - 40, footerY);
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Footer text
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(
            "Generated with Junie's Arcade",
            canvas.width / 2,
            footerY + 30,
          );

          ctx.font = "14px system-ui, -apple-system, sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          const currentDate = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          ctx.fillText(currentDate, canvas.width / 2, footerY + 52);
        };

        await drawComplete();

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error("Failed to create blob");
            alert("Unable to create image. Please try again.");
            setIsDownloading(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const timestamp = new Date().getTime();
          link.download = `junie-arcade-${username}-${score}-${timestamp}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up
          setTimeout(() => {
            URL.revokeObjectURL(url);
            setIsDownloading(false);
          }, 100);
        }, "image/png");
      } catch (fallbackError) {
        console.error("Manual fallback failed:", fallbackError);
        setIsDownloading(false);
      }
    }
  };

  const shareUrl =
    uploadedUrl ||
    (typeof window !== "undefined"
      ? "https://www.juniearcade.fun/gallery"
      : "");
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  const getNextGame = () => {
    // We don't want to show a next game link if we're already on the OVERALL card
    if (gameType === "OVERALL") return null;

    // If allRanks is not loaded yet, we can't reliably show the continue button
    // But we want to avoid flicker, so we should probably show it based on local knowledge if possible
    if (!allRanks) return null;

    const gameStatus = [
      {
        name: "Jump Master",
        path: "/games/jump",
        played: allRanks.jump !== null && allRanks.jump !== undefined,
      },
      {
        name: "Reflex Arena",
        path: "/games/reflex",
        played: allRanks.reflex !== null && allRanks.reflex !== undefined,
      },
      {
        name: "Memory Match",
        path: "/games/memory",
        played: allRanks.memory !== null && allRanks.memory !== undefined,
      },
    ];

    // Force current game as played
    const currentGameIdx = gameStatus.findIndex(
      (g) =>
        (gameType === "JUMP_MASTER" && g.path === "/games/jump") ||
        (gameType === "REFLEX_ARENA" && g.path === "/games/reflex") ||
        (gameType === "MEMORY_MATCH" && g.path === "/games/memory"),
    );

    if (currentGameIdx !== -1) {
      gameStatus[currentGameIdx].played = true;
    }

    // Circular search for the next unplayed game
    for (let i = 1; i <= gameStatus.length; i++) {
      const nextIdx = (currentGameIdx + i) % gameStatus.length;
      if (!gameStatus[nextIdx].played) {
        return {
          name: gameStatus[nextIdx].name,
          path: gameStatus[nextIdx].path,
        };
      }
    }

    // If we've played all games, but the current game was the LAST one to be played,
    // we return null to show "Generate Leaderboard Card"
    return null; // All games played
  };

  const nextGame = getNextGame();

  // Filter stats for display (OVERALL card hides rank stats shown elsewhere)
  const filteredStats = stats.filter((stat) => {
    if (gameType === "OVERALL") {
      return !stat.label.toLowerCase().includes("rank");
    }
    return true;
  });

  // For visual feedback while loading
  const isAllRanksLoading = !allRanks && gameType !== "OVERALL";

  // Debugging log to trace why continue button might be missing
  useEffect(() => {
    if (hasAutoSaved && allRanks) {
      // GameOverCard Debug: gameType, allRanks, nextGame, playerId
    }
  }, [hasAutoSaved, allRanks, nextGame, gameType]);

  const handleExit = async () => {
    setIsCalculating(true);
    setShowExitModal(true);

    try {
      const playerId = localStorage.getItem("junie_player_id");

      // If no scores saved yet, just go home
      if (!playerId) {
        window.location.href = "/";
        return;
      }

      // Small delay to simulate "calculating overall leaderboard"
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch(
        `/api/leaderboard?view=overall&playerId=${playerId}`,
      );
      const data = await response.json();

      if (data.currentPlayer && data.leaderboard) {
        // Find position in the leaderboard
        const position = data.leaderboard.findIndex(
          (p: any) => p.playerId === playerId,
        );
        setPlayerRank(position !== -1 ? position + 1 : null);

        // Reset credentials since the tournament is being exited/finished
        localStorage.removeItem("junie_player_id");
        localStorage.removeItem("junie_username");
        localStorage.removeItem("junie_country");

        // Redirect to leaderboard with showOverall flag to generate the card
        window.location.href = `/leaderboard?showOverall=true&playerId=${playerId}`;
      } else {
        // Fallback if no player stats found
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Failed to calculate rank:", error);
      window.location.href = "/";
    }
  };

  const handleGenerateLeaderboardCard = async () => {
    setIsCalculating(true);
    setShowExitModal(true);

    try {
      const playerId = localStorage.getItem("junie_player_id");

      // If no scores saved yet, just go home
      if (!playerId) {
        window.location.href = "/";
        return;
      }

      // Small delay to simulate "calculating overall leaderboard"
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch(
        `/api/leaderboard?view=overall&playerId=${playerId}`,
      );
      const data = await response.json();

      if (data.currentPlayer && data.leaderboard) {
        // Find position in the leaderboard
        const position = data.leaderboard.findIndex(
          (p: any) => p.playerId === playerId,
        );
        setPlayerRank(position !== -1 ? position + 1 : null);

        // Reset credentials since the tournament is over
        localStorage.removeItem("junie_player_id");
        localStorage.removeItem("junie_username");
        localStorage.removeItem("junie_country");

        // Redirect to leaderboard
        window.location.href = `/leaderboard?showOverall=true&playerId=${playerId}`;
      } else {
        // Fallback
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Failed to generate leaderboard card:", error);
      window.location.href = "/";
    }
  };

  return (
    <>
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl mx-auto px-2 sm:px-4"
      >
        <div
          ref={cardRef}
          data-card-clone="true"
          className="bg-gradient-to-br from-[#0a0e13] via-[#0f1923] to-[#0a0e13] border border-white/10 shadow-2xl overflow-hidden relative text-sm sm:text-base"
          style={{
            boxShadow: `0 0 40px ${theme.glow}, 0 0 60px ${theme.glow}`,
          }}
        >
          {/* VALORANT-Style Angular Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
            <m.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-[${theme.primary}] to-transparent`}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-r ${theme.gradient}`}
            />
          </div>

          {/* Hero and Small Mascot Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Hexagonal Grid Pattern (LoL/Valorant style) */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
                backgroundSize: "60px 60px",
              }}
            />

            {/* Diagonal Scan Lines (Valorant style) */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 2px, white 2px, white 3px)",
                backgroundSize: "20px 20px",
              }}
            />

            <AnimatePresence mode="wait">
              {selectedHero && selectedHero.length > 0 && (
                <m.img
                  key={selectedHero}
                  initial={{ opacity: 0, scale: 1.1, x: 50 }}
                  animate={{ opacity: 0.15, scale: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  src={`/assets/images/hero/${selectedHero}`}
                  alt="Hero background"
                  className="absolute -right-16 top-1/2 -translate-y-1/2 h-[60%] object-contain"
                  style={{ filter: "saturate(0.8) brightness(0.9)" }}
                />
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {selectedJunie && selectedJunie.length > 0 && (
                <m.img
                  key={selectedJunie}
                  initial={{ opacity: 0, x: -20, y: 20 }}
                  animate={{ opacity: 0.2, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 1 }}
                  src={`/assets/images/junie/${selectedJunie}`}
                  alt="Small mascot accent"
                  className="absolute left-4 top-36 w-28 h-28 object-contain"
                  style={{ filter: `drop-shadow(0 0 20px ${theme.glow})` }}
                />
              )}
            </AnimatePresence>

            {/* Radial Glow from center */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
              style={{
                background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
              }}
            />
          </div>

          {/* Corner Accents (VALORANT style) */}
          <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none">
            <div
              className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[${theme.primary}] to-transparent`}
            />
            <div
              className={`absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-[${theme.primary}] to-transparent`}
            />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none">
            <div
              className={`absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-[${theme.primary}] to-transparent`}
            />
            <div
              className={`absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-[${theme.primary}] to-transparent`}
            />
          </div>
          <div className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none">
            <div
              className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[${theme.primary}] to-transparent`}
            />
            <div
              className={`absolute bottom-0 left-0 h-full w-[2px] bg-gradient-to-t from-[${theme.primary}] to-transparent`}
            />
          </div>
          <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none">
            <div
              className={`absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-[${theme.primary}] to-transparent`}
            />
            <div
              className={`absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-[${theme.primary}] to-transparent`}
            />
          </div>

          {/* Floating Protocol Text - Hidden on very small screens */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-4 opacity-20 pointer-events-none hidden xs:flex items-center gap-2 sm:gap-3">
            <div className="h-px w-8 sm:w-12 bg-white/40" />
            <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/60">
              JUNIE ARCADE // 2026
            </div>
          </div>

          {/* Header with Game Branding - VALORANT/LoL Style */}
          <div
            data-card-header="true"
            className="relative p-4 sm:p-6 md:p-8 border-b border-white/10 overflow-hidden"
          >
            {/* Angular Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${theme.darkGradient}`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />

            {/* Animated Pulse Line */}
            <m.div
              initial={{ opacity: 0.3, scaleX: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3], scaleX: 1 }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[${theme.primary}] to-transparent origin-left`}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
              {/* Left: Game Logo & Title */}
              <div className="flex items-center gap-3 sm:gap-5">
                <m.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="relative"
                >
                  {/* Hexagonal Frame (LoL style) */}
                  <div
                    className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 relative flex items-center justify-center"
                    style={{
                      clipPath:
                        "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      background: `linear-gradient(135deg, ${theme.primary}20, transparent)`,
                    }}
                  >
                    <div
                      className="w-[90%] h-[90%] flex items-center justify-center"
                      style={{
                        clipPath:
                          "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                        background: "rgba(0,0,0,0.5)",
                      }}
                    >
                      {getGameLogo() ? (
                        <Image
                          src={getGameLogo()!}
                          alt={getGameTitle()}
                          width={60}
                          height={60}
                          className="object-contain w-8 h-8 sm:w-12 sm:h-12 md:w-[60px] md:h-[60px]"
                          style={{
                            filter: `drop-shadow(0 0 10px ${theme.glow})`,
                          }}
                        />
                      ) : (
                        <span className="text-3xl sm:text-5xl">🎮</span>
                      )}
                    </div>
                  </div>

                  {/* Floating Junie Badge */}
                  <AnimatePresence mode="wait">
                    {selectedJunie && selectedJunie.length > 0 && (
                      <m.div
                        key={selectedJunie}
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-7 h-7 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 bg-black/80"
                        style={{ borderColor: theme.primary }}
                      >
                        <img
                          src={`/assets/images/junie/${selectedJunie}`}
                          alt="Junie"
                          className="w-full h-full object-contain"
                        />
                      </m.div>
                    )}
                  </AnimatePresence>
                </m.div>

                <div>
                  {/* Tagline Badge */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <div
                      className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span
                      className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em]"
                      style={{ color: theme.primary }}
                    >
                      {theme.tagline}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                    {getGameTitle()}
                  </h1>
                </div>
              </div>

              {/* Right: Score Display (VALORANT Match Score Style) */}
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <span className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                    Final Rating
                  </span>
                  <div className="w-6 sm:w-8 h-[1px] bg-white/20" />
                </div>
                <m.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative"
                >
                  <span
                    className="text-3xl sm:text-5xl md:text-7xl font-black italic tracking-tighter"
                    style={{
                      color: theme.primary,
                      textShadow: `0 0 30px ${theme.glow}, 0 0 60px ${theme.glow}`,
                    }}
                  >
                    {score.toLocaleString()}
                  </span>
                  <div className="text-[8px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-0.5 sm:mt-1">
                    Points
                  </div>
                </m.div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-3 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 relative">
            {/* Left Column: Player & Selfie (Agent Card Style) */}
            <div className="lg:col-span-5 space-y-3 sm:space-y-5">
              <div className="relative group">
                {/* Selfie Container with Esports Frame */}
                <div
                  className="aspect-[4/5] sm:aspect-[4/5] bg-gradient-to-br from-slate-900 to-slate-950 border overflow-hidden relative"
                  style={{ borderColor: `${theme.primary}30` }}
                >
                  {/* Corner Brackets */}
                  <div
                    className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-4 h-4 sm:w-6 sm:h-6 border-l-2 border-t-2 pointer-events-none z-20"
                    style={{ borderColor: theme.primary }}
                  />
                  <div
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-6 sm:h-6 border-r-2 border-t-2 pointer-events-none z-20"
                    style={{ borderColor: theme.primary }}
                  />
                  <div
                    className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 w-4 h-4 sm:w-6 sm:h-6 border-l-2 border-b-2 pointer-events-none z-20"
                    style={{ borderColor: theme.primary }}
                  />
                  <div
                    className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-6 sm:h-6 border-r-2 border-b-2 pointer-events-none z-20"
                    style={{ borderColor: theme.primary }}
                  />

                  {!selfieData && !showCamera && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                      {countdown !== null ? (
                        // Countdown display (auto start)
                        <div className="flex flex-col items-center">
                          <div
                            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center mb-3 sm:mb-4 relative"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                              background: `${theme.primary}20`,
                            }}
                          >
                            <m.span
                              key={countdown}
                              initial={{ scale: 1.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-4xl sm:text-6xl md:text-7xl font-black"
                              style={{ color: theme.primary }}
                            >
                              {countdown}
                            </m.span>
                            <m.div
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0, 0.5],
                              }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="absolute inset-0"
                              style={{
                                clipPath:
                                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                border: `2px solid ${theme.primary}`,
                              }}
                            />
                          </div>
                          <h3 className="text-white font-black uppercase tracking-wider mb-1 sm:mb-2 text-sm sm:text-base">
                            Initializing Camera...
                          </h3>
                          <p className="text-slate-400 text-[10px] sm:text-xs">
                            Prepare for victory capture!
                          </p>
                        </div>
                      ) : (
                        // Default state (no countdown)
                        <>
                          <div
                            className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center mb-3 sm:mb-4"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                              background: "rgba(255,255,255,0.05)",
                            }}
                          >
                            <span className="text-2xl sm:text-4xl">👤</span>
                          </div>
                          <h3 className="text-white font-black uppercase tracking-wider mb-1 sm:mb-2 text-sm sm:text-base">
                            Agent Profile
                          </h3>
                          <p className="text-slate-500 text-[10px] sm:text-xs mb-4 sm:mb-6 max-w-[180px] sm:max-w-[200px]">
                            Capture your victory pose for the arena records.
                          </p>
                          <m.button
                            onClick={startCamera}
                            data-export-hide="true"
                            whileHover={{
                              scale: 1.05,
                              boxShadow: `0 0 30px ${theme.glow}`,
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 sm:px-6 sm:py-3 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs"
                            style={{
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                              clipPath:
                                "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                            }}
                          >
                            Initiate Capture
                          </m.button>
                        </>
                      )}
                    </div>
                  )}

                  {selfieData && (
                    <div className="absolute inset-0">
                      <img
                        src={selfieData}
                        alt="Player selfie"
                        className="w-full h-full object-cover"
                        style={{
                          filter:
                            "brightness(1.05) contrast(1.1) saturate(0.95)",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e13] via-transparent to-transparent opacity-70" />
                      {/* Scan Line Effect */}
                      <m.div
                        animate={{ y: ["0%", "100%"] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute left-0 right-0 h-[2px] opacity-20"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`,
                        }}
                      />
                      {!uploadedUrl && (
                        <div
                          data-export-hide="true"
                          className="absolute top-4 right-4 z-10"
                        >
                          <m.button
                            onClick={async () => {
                              setSelfieData(null);
                              await startCamera();
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-black/60 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider border transition-all"
                            style={{ borderColor: `${theme.primary}50` }}
                          >
                            Retake
                          </m.button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Camera Modal Overlay */}
                <AnimatePresence>
                  {showCamera && (
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
                    >
                      <div className="relative h-[85vh] aspect-[4/5] bg-slate-900 border border-white/10 overflow-hidden shadow-2xl">
                        {!tempSelfie ? (
                          <div className="absolute inset-0">
                            <video
                              ref={videoRef}
                              className="w-full h-full object-cover grayscale brightness-110 contrast-125"
                              autoPlay
                              playsInline
                              muted
                            />
                            <div className="absolute inset-0 border-[20px] md:border-[40px] border-[#0f1923]/80 pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#ff4655]/20 to-transparent pointer-events-none" />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Capture Countdown Overlay - Bottom Position */}
                            {captureCountdown !== null && (
                              <div className="absolute bottom-0 left-0 right-0 pb-24 z-50">
                                <div className="flex flex-col items-center">
                                  <div className="w-32 h-32 rounded-full border-4 border-[#ff4655] flex items-center justify-center mb-3 bg-[#ff4655]/10 relative backdrop-blur-sm">
                                    <m.span
                                      key={captureCountdown}
                                      initial={{ scale: 1.5, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ duration: 0.3 }}
                                      className="text-7xl font-black text-[#ff4655]"
                                    >
                                      {captureCountdown}
                                    </m.span>
                                    <div className="absolute inset-0 rounded-full border-4 border-[#ff4655] animate-ping opacity-20" />
                                  </div>
                                  <div className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-full">
                                    <h3 className="text-white font-black uppercase tracking-wider text-lg mb-1">
                                      Get Ready!
                                    </h3>
                                    <p className="text-slate-300 text-xs text-center">
                                      Strike your best pose...
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Camera Controls */}
                            <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 px-6">
                              <button
                                onClick={takeSelfie}
                                disabled={captureCountdown !== null}
                                className="w-full max-w-xs py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-sm skew-x-[-10deg] hover:bg-[#ff4655] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span className="inline-block skew-x-[10deg]">
                                  Capture Victory
                                </span>
                              </button>
                              <button
                                onClick={stopCamera}
                                className="w-full max-w-xs py-3 bg-[#ff4655]/20 text-white/70 font-black uppercase tracking-[0.2em] text-[10px] skew-x-[-10deg] hover:bg-[#ff4655] hover:text-white transition-colors"
                              >
                                <span className="inline-block skew-x-[10deg]">
                                  Abort Mission
                                </span>
                              </button>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-10 left-10 text-white/40 font-black text-xs uppercase tracking-[0.5em]">
                              System Status: Ready
                            </div>
                            <div className="absolute top-10 right-10 text-[#ff4655] font-black text-xs uppercase tracking-[0.5em] animate-pulse">
                              • Live Feed
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0">
                            <img
                              src={tempSelfie}
                              alt="Temp selfie"
                              className="w-full h-full object-cover brightness-110 contrast-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923] via-transparent to-transparent opacity-60" />

                            <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 px-6">
                              <button
                                onClick={confirmSelfie}
                                className="w-full max-w-xs py-4 bg-[#00ff9d] text-black font-black uppercase tracking-[0.2em] text-sm skew-x-[-10deg] hover:brightness-110 transition-all"
                              >
                                <span className="inline-block skew-x-[10deg]">
                                  Confirm Identity
                                </span>
                              </button>
                              <button
                                onClick={retakeSelfie}
                                className="w-full max-w-xs py-3 bg-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] skew-x-[-10deg] hover:bg-white/20 transition-all backdrop-blur-md"
                              >
                                <span className="inline-block skew-x-[10deg]">
                                  Recapture
                                </span>
                              </button>
                            </div>

                            <div className="absolute top-10 left-10 text-[#00ff9d] font-black text-xs uppercase tracking-[0.5em]">
                              Image Captured
                            </div>
                          </div>
                        )}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>

                {/* Player Name Badge - Esports Style */}
                <div
                  className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 p-2 sm:p-4 shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    clipPath:
                      "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FlagIcon
                      code={getCountryCode()}
                      className="w-6 h-4 sm:w-9 sm:h-6"
                    />
                    <div>
                      <div className="text-[7px] sm:text-[9px] font-black text-black/50 uppercase tracking-widest leading-none mb-0.5">
                        Champion
                      </div>
                      <div className="text-sm sm:text-lg font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
                        {username}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Country Info Bar - Tactical Style */}
              <div
                className="flex items-center justify-between py-2 px-3 sm:py-3 sm:px-4 border-l-2"
                style={{
                  borderColor: theme.primary,
                  background: `${theme.primary}08`,
                }}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.1em] sm:tracking-[0.15em]">
                    Region
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-black text-white uppercase italic tracking-tight">
                  {country}
                </span>
              </div>

              {/* BIG Overall Rank Display - Only for Ultimate Champion card */}
              {gameType === "OVERALL" && allRanks && allRanks.overall && (
                <m.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="relative p-4 sm:p-6 text-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}15, ${theme.primary}05)`,
                    border: `2px solid ${theme.primary}40`,
                  }}
                >
                  {/* Corner Decorations */}
                  <div
                    className="absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-t-2"
                    style={{ borderColor: theme.primary }}
                  />
                  <div
                    className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-t-2"
                    style={{ borderColor: theme.primary }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-b-2"
                    style={{ borderColor: theme.primary }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-b-2"
                    style={{ borderColor: theme.primary }}
                  />

                  {/* Trophy for Top 3 */}
                  {allRanks.overall <= 3 && (
                    <m.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 text-2xl sm:text-4xl"
                    >
                      {allRanks.overall === 1
                        ? "🥇"
                        : allRanks.overall === 2
                          ? "🥈"
                          : "🥉"}
                    </m.div>
                  )}

                  <div
                    className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2 mt-1 sm:mt-2"
                    style={{ color: theme.primary }}
                  >
                    Global Tournament Rank
                  </div>

                  <m.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="text-5xl sm:text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-none"
                    style={{
                      textShadow: `0 0 30px ${theme.glow}, 0 0 60px ${theme.glow}`,
                    }}
                  >
                    #{allRanks.overall}
                  </m.div>

                  <div className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1 sm:mt-2">
                    Out of all participants
                  </div>

                  {/* Animated Glow Effect */}
                  <m.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 40px ${theme.glow}` }}
                  />
                </m.div>
              )}
            </div>

            {/* Right Column: Stats & Actions */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex-1 space-y-5">
                {/* Sync Status Indicator */}
                {!allRanks && gameType !== "OVERALL" && (
                  <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 sm:p-4 text-center border"
                    style={{
                      borderColor: `${theme.primary}30`,
                      background: `${theme.primary}08`,
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                      <m.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-t-transparent rounded-full"
                        style={{
                          borderColor: theme.primary,
                          borderTopColor: "transparent",
                        }}
                      />
                      <p className="text-slate-400 text-[10px] sm:text-xs font-medium">
                        Syncing session progress...
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setHasAutoSaved(false);
                        setTimeout(() => setHasAutoSaved(true), 100);
                      }}
                      className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                      style={{ color: theme.primary }}
                    >
                      Manual Sync
                    </button>
                  </m.div>
                )}

                {/* Ranks Section - OVERALL card only (Tournament Summary Style) */}
                {allRanks && gameType === "OVERALL" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    {[
                      {
                        label: "Overall",
                        val: allRanks.overall,
                        color: "#10b981",
                        icon: "🏆",
                      },
                      {
                        label: "Reflex",
                        val: allRanks.reflex,
                        color: "#ff4655",
                        icon: "⚡",
                      },
                      {
                        label: "Jump",
                        val: allRanks.jump,
                        color: "#00eeff",
                        icon: "🚀",
                      },
                      {
                        label: "Memory",
                        val: allRanks.memory,
                        color: "#c284f9",
                        icon: "🧠",
                      },
                    ].map((rank, i) => (
                      <m.div
                        key={rank.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative p-2 sm:p-3 text-center overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${rank.color}15, transparent)`,
                          borderLeft: `2px solid ${rank.color}`,
                        }}
                      >
                        <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-sm sm:text-lg opacity-20">
                          {rank.icon}
                        </div>
                        <div
                          className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 sm:mb-1"
                          style={{ color: rank.color }}
                        >
                          {rank.label}
                        </div>
                        <div className="text-base sm:text-xl font-black text-white italic">
                          #{rank.val || "--"}
                        </div>
                      </m.div>
                    ))}
                  </div>
                )}

                {/* Stats Grid - Match Statistics Style */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <div
                      className="w-1 h-1 sm:w-1.5 sm:h-1.5"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span className="text-[8px] sm:text-[10px] font-black text-white/50 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                      Match Statistics
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <div className={`grid gap-2 sm:gap-3 ${filteredStats.length > 6 ? "grid-cols-3" : "grid-cols-2"}`}>
                    {filteredStats
                      .map((stat, index) => (
                        <m.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={`relative overflow-hidden group transition-all hover:scale-[1.02] ${filteredStats.length > 6 ? "p-1.5 sm:p-2.5" : "p-2.5 sm:p-4"}`}
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                            borderLeft: `2px solid ${theme.primary}60`,
                          }}
                        >
                          {/* Index Badge */}
                          <div
                            className={`absolute top-0 right-0 flex items-center justify-center font-black opacity-20 ${filteredStats.length > 6 ? "w-5 h-5 text-[7px]" : "w-6 h-6 sm:w-8 sm:h-8 text-[8px] sm:text-[10px]"}`}
                            style={{
                              background: `linear-gradient(135deg, ${theme.primary}30, transparent)`,
                            }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div className={`font-black text-white/40 uppercase mb-0.5 ${filteredStats.length > 6 ? "text-[7px] sm:text-[8px] tracking-[0.08em]" : "text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.15em] sm:mb-1"}`}>
                            {stat.label}
                          </div>
                          <div
                            className={`font-black italic tracking-tighter ${stat.color || "text-white"} ${filteredStats.length > 6 ? "text-sm sm:text-base" : "text-base sm:text-xl md:text-2xl"}`}
                          >
                            {stat.value}
                          </div>
                          {/* Hover Glow */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{
                              boxShadow: `inset 0 0 20px ${theme.glow}`,
                            }}
                          />
                        </m.div>
                      ))}
                  </div>
                </div>

                {/* Action Buttons - Esports Tournament Style */}
                <div
                  data-export-hide="true"
                  className="space-y-2 sm:space-y-3 pt-3 sm:pt-4"
                >
                  {isAllRanksLoading && (
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-3 sm:py-4 flex flex-col items-center justify-center border"
                      style={{
                        borderColor: `${theme.primary}30`,
                        background: `${theme.primary}08`,
                      }}
                    >
                      <m.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-t-transparent rounded-full mb-1.5 sm:mb-2"
                        style={{
                          borderColor: theme.primary,
                          borderTopColor: "transparent",
                        }}
                      />
                      <span
                        className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest"
                        style={{ color: theme.primary }}
                      >
                        Identifying Next Mission...
                      </span>
                    </m.div>
                  )}

                  {/* Primary Action: Continue to Next Game */}
                  {nextGame && gameType !== "OVERALL" && !isCalculating && (
                    <Link href={nextGame.path} className="block">
                      <m.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative overflow-hidden py-3 sm:py-4 px-4 sm:px-6 text-center group"
                        style={{
                          background:
                            "linear-gradient(135deg, #ffffff, #e0e0e0)",
                          clipPath:
                            "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                        }}
                      >
                        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 font-black text-black uppercase tracking-[0.05em] sm:tracking-[0.1em] text-xs sm:text-sm">
                          <span className="text-base sm:text-lg">▶</span>
                          Continue to {nextGame.name}
                        </div>
                        <m.div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primary}20, transparent)`,
                          }}
                        />
                      </m.div>
                    </Link>
                  )}

                  {/* Generate Leaderboard Card (when all games complete) */}
                  {!nextGame && gameType !== "OVERALL" && !isCalculating && (
                    <m.button
                      onClick={handleGenerateLeaderboardCard}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full relative overflow-hidden py-3 sm:py-4 px-4 sm:px-6 group"
                      style={{
                        background: "linear-gradient(135deg, #10b981, #06d6a0)",
                        clipPath:
                          "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                        boxShadow: "0 0 30px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 font-black text-white uppercase tracking-[0.05em] sm:tracking-[0.1em] text-xs sm:text-sm">
                        <span className="text-base sm:text-lg">🏆</span>
                        Generate Leaderboard Card
                      </div>
                    </m.button>
                  )}

                  {/* Exit Option (when more games available) */}
                  {gameType !== "OVERALL" && nextGame && !isCalculating && (
                    <m.button
                      onClick={handleExit}
                      whileHover={{
                        scale: 1.01,
                        backgroundColor: "rgba(255,255,255,0.05)",
                      }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full relative overflow-hidden py-2.5 sm:py-3 px-4 sm:px-6 border border-white/20 group transition-colors"
                    >
                      <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 font-black text-white/50 group-hover:text-white uppercase tracking-[0.05em] sm:tracking-[0.1em] text-[10px] sm:text-xs transition-colors">
                        <span>🚪</span>
                        <span className="hidden xs:inline">
                          Exit & Generate Leaderboard Card
                        </span>
                        <span className="xs:hidden">Exit & Get Card</span>
                      </div>
                    </m.button>
                  )}

                  {/* Exit to Home (OVERALL card) */}
                  {gameType === "OVERALL" && !isCalculating && (
                    <Link href="/" className="block">
                      <m.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="py-2.5 sm:py-3 px-4 sm:px-6 border-2 text-center transition-colors hover:bg-opacity-10"
                        style={{
                          borderColor: theme.primary,
                          backgroundColor: `${theme.primary}10`,
                        }}
                      >
                        <div
                          className="flex items-center justify-center gap-1.5 sm:gap-2 font-black uppercase tracking-[0.05em] sm:tracking-[0.1em] text-xs sm:text-sm"
                          style={{ color: theme.primary }}
                        >
                          <span>✕</span>
                          Exit to Home
                        </div>
                      </m.div>
                    </Link>
                  )}

                  {/* Save & Export Row */}
                  {!isCalculating && (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <m.button
                        onClick={saveCardToS3}
                        disabled={isUploading || !!uploadedUrl}
                        whileHover={{
                          scale: isUploading || uploadedUrl ? 1 : 1.02,
                        }}
                        whileTap={{
                          scale: isUploading || uploadedUrl ? 1 : 0.98,
                        }}
                        className="relative overflow-hidden py-2.5 sm:py-3 px-3 sm:px-4 disabled:opacity-60 group"
                        style={{
                          background: uploadedUrl
                            ? "linear-gradient(135deg, #10b981, #059669)"
                            : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                          clipPath:
                            "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                        }}
                      >
                        <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 font-black text-white uppercase tracking-[0.05em] sm:tracking-[0.1em] text-[10px] sm:text-xs">
                          {isUploading ? (
                            <>
                              <m.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full"
                              />
                              <span className="hidden xs:inline">
                                Uploading...
                              </span>
                              <span className="xs:hidden">...</span>
                            </>
                          ) : uploadedUrl ? (
                            <>
                              <span>✓</span>
                              Saved
                            </>
                          ) : (
                            <>
                              <span>💾</span>
                              <span className="hidden xs:inline">Save Card</span>
                              <span className="xs:hidden">Save</span>
                            </>
                          )}
                        </div>
                      </m.button>

                      <m.button
                        onClick={downloadCard}
                        disabled={isDownloading || !uploadedUrl}
                        whileHover={{
                          scale: isDownloading || !uploadedUrl ? 1 : 1.02,
                        }}
                        whileTap={{
                          scale: isDownloading || !uploadedUrl ? 1 : 0.98,
                        }}
                        className="relative overflow-hidden py-2.5 sm:py-3 px-3 sm:px-4 border border-white/20 disabled:opacity-40 group transition-colors hover:bg-white/5"
                      >
                        <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 font-black text-white uppercase tracking-[0.05em] sm:tracking-[0.1em] text-[10px] sm:text-xs">
                          {isDownloading ? (
                            <>
                              <m.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full"
                              />
                              <span className="hidden xs:inline">
                                Exporting...
                              </span>
                              <span className="xs:hidden">...</span>
                            </>
                          ) : (
                            <>
                              <span>⬇</span>
                              Export
                            </>
                          )}
                        </div>
                        {/* Bottom accent line */}
                        <div
                          className="absolute bottom-0 left-0 w-full h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                          style={{ backgroundColor: theme.primary }}
                        />
                      </m.button>
                    </div>
                  )}
                </div>

                {/* Share & QR Section - Tournament Share Card */}
                <div className="border-t border-white/10 pt-3 sm:pt-5 mt-1 sm:mt-2">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div
                        className="w-1 h-1 sm:w-1.5 sm:h-1.5"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span className="text-[8px] sm:text-[10px] font-black text-white/50 uppercase tracking-[0.1em] sm:tracking-[0.15em]">
                        Share Victory
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 opacity-60">
                      <img
                        src="/assets/images/logos/cloud9-logo.png"
                        alt="Cloud9"
                        className="h-3 sm:h-4"
                      />
                      <div className="w-px h-2 sm:h-3 bg-white/20" />
                      <img
                        src="/assets/images/logos/jetbrains-logo.png"
                        alt="JetBrains"
                        className="h-3 sm:h-4"
                      />
                    </div>
                  </div>

                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 p-3 sm:p-5"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))",
                      borderLeft: `2px solid ${theme.primary}40`,
                    }}
                  >
                    {/* QR Code with Frame */}
                    <div className="relative">
                      <div
                        className="absolute -inset-1.5 sm:-inset-2 opacity-30"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primary}40, transparent)`,
                          clipPath:
                            "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                        }}
                      />
                      <div className="relative p-1.5 sm:p-2 bg-white">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32"
                        />
                      </div>
                      {/* Corner Accents */}
                      <div
                        className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 w-2 h-2 sm:w-3 sm:h-3 border-l-2 border-t-2"
                        style={{ borderColor: theme.primary }}
                      />
                      <div
                        className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 border-r-2 border-b-2"
                        style={{ borderColor: theme.primary }}
                      />
                    </div>

                    <div className="text-center sm:text-left flex-1">
                      <h4 className="text-white font-black uppercase tracking-wider text-xs sm:text-sm mb-0.5 sm:mb-1">
                        Challenge Issued
                      </h4>
                      <p className="text-slate-500 text-[9px] sm:text-[10px] leading-relaxed mb-2 sm:mb-4 max-w-[180px] sm:max-w-[200px] mx-auto sm:mx-0">
                        Scan to share your victory or copy the secure link
                        below.
                      </p>
                      <m.button
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl);
                        }}
                        data-export-hide="true"
                        disabled={!uploadedUrl}
                        whileHover={{ scale: uploadedUrl ? 1.02 : 1 }}
                        whileTap={{ scale: uploadedUrl ? 0.98 : 1 }}
                        className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 py-1.5 sm:px-4 sm:py-2 transition-all disabled:opacity-30"
                        style={{
                          color: uploadedUrl
                            ? theme.primary
                            : "rgba(255,255,255,0.4)",
                          border: `1px solid ${uploadedUrl ? theme.primary + "50" : "rgba(255,255,255,0.2)"}`,
                        }}
                      >
                        {uploadedUrl ? "Copy URL" : "Save Card First"}
                      </m.button>
                    </div>
                  </m.div>
                </div>
              </div>

              {/* Footer Return Link */}
              <div data-export-hide="true" className="mt-4 sm:mt-6">
                <Link href="/">
                  <m.div
                    whileHover={{ opacity: 1 }}
                    className="group flex items-center gap-2 sm:gap-4 opacity-60 transition-opacity"
                  >
                    <div
                      className="h-px flex-1 bg-white/10 group-hover:bg-opacity-30 transition-colors"
                      style={{ backgroundColor: `${theme.primary}20` }}
                    />
                    <span
                      className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors"
                      style={{ color: `${theme.primary}80` }}
                    >
                      Return to Menu
                    </span>
                    <div
                      className="h-px flex-1 bg-white/10 group-hover:bg-opacity-30 transition-colors"
                      style={{ backgroundColor: `${theme.primary}20` }}
                    />
                  </m.div>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Banner Branding - Tournament Footer */}
          <div
            className="px-3 sm:px-6 md:px-8 py-2 sm:py-3 flex items-center justify-between"
            style={{
              background: `linear-gradient(90deg, ${theme.primary}10, transparent, ${theme.primary}10)`,
            }}
          >
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div
                className="w-1 h-1 sm:w-1.5 sm:h-1.5 rotate-45"
                style={{ backgroundColor: theme.primary }}
              />
              <span className="text-[7px] sm:text-[9px] font-black text-white/40 uppercase tracking-[0.15em] sm:tracking-[0.3em]">
                Junie Arcade
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <span className="text-[7px] sm:text-[9px] font-black text-white/30 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                C9 x JetBrains
              </span>
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </m.div>

      <AnimatePresence>
        {showExitModal && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 sm:p-6"
          >
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
                backgroundSize: "40px 40px",
              }}
            />

            <div className="max-w-sm sm:max-w-md w-full text-center relative">
              {isCalculating ? (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative"
                >
                  {/* Radial Glow */}
                  <div
                    className="absolute inset-0 rounded-full blur-3xl animate-pulse"
                    style={{
                      background: `radial-gradient(circle, ${theme.glow}, transparent 70%)`,
                    }}
                  />

                  <div className="relative space-y-6 sm:space-y-10 py-8 sm:py-12">
                    {/* Hexagonal Loading Indicator */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                      <m.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0"
                        style={{
                          clipPath:
                            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                          border: `2px solid ${theme.primary}40`,
                        }}
                      />
                      <m.div
                        animate={{ rotate: -360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-3 sm:inset-4"
                        style={{
                          clipPath:
                            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                          border: `2px solid ${theme.primary}60`,
                        }}
                      />
                      <m.div
                        animate={{
                          scale: [0.9, 1.1, 0.9],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-6 sm:inset-8 flex items-center justify-center text-2xl sm:text-3xl"
                        style={{
                          clipPath:
                            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                          boxShadow: `0 0 30px ${theme.glow}`,
                        }}
                      >
                        📊
                      </m.div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <m.h3
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic"
                      >
                        Analyzing{" "}
                        <span
                          className="text-transparent bg-clip-text"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                          }}
                        >
                          Results
                        </span>
                      </m.h3>

                      <m.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center gap-2 sm:gap-3"
                      >
                        <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                          Calculating leaderboard position
                        </p>
                        <div className="flex gap-1 sm:gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <m.div
                              key={i}
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                              style={{ backgroundColor: theme.primary }}
                            />
                          ))}
                        </div>
                      </m.div>
                    </div>
                  </div>
                </m.div>
              ) : (
                <m.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #0a0e13, #0f1923)",
                    border: `1px solid ${theme.primary}30`,
                  }}
                >
                  {/* Top Accent Bar */}
                  <div
                    className="h-1"
                    style={{
                      background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                    }}
                  />

                  {/* Corner Accents */}
                  <div
                    className="absolute top-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-l-2 border-t-2 pointer-events-none"
                    style={{ borderColor: `${theme.primary}40` }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-r-2 border-b-2 pointer-events-none"
                    style={{ borderColor: `${theme.primary}40` }}
                  />

                  <div className="p-5 sm:p-8 md:p-10">
                    <div
                      className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-4 sm:mb-6 italic"
                      style={{ color: theme.primary }}
                    >
                      Tournament Summary
                    </div>

                    <div className="mb-5 sm:mb-8">
                      <div className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 sm:mb-2">
                        Your Final Rank
                      </div>
                      <div
                        className="text-5xl sm:text-7xl md:text-8xl font-black text-white italic tracking-tighter"
                        style={{ textShadow: `0 0 40px ${theme.glow}` }}
                      >
                        #{playerRank || "??"}
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-8">
                      <div
                        className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3"
                        style={{
                          background: `${theme.primary}08`,
                          borderLeft: `2px solid ${theme.primary}40`,
                        }}
                      >
                        <span className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">
                          Player
                        </span>
                        <span className="text-xs sm:text-sm font-black text-white uppercase italic">
                          {username}
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3"
                        style={{
                          background: `${theme.primary}08`,
                          borderLeft: `2px solid ${theme.primary}40`,
                        }}
                      >
                        <span className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">
                          Score
                        </span>
                        <span
                          className="text-xs sm:text-sm font-black uppercase italic"
                          style={{ color: theme.primary }}
                        >
                          {score.toLocaleString()} PTS
                        </span>
                      </div>
                    </div>

                    <Link href="/leaderboard" className="block">
                      <m.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 sm:py-4 px-6 sm:px-8 text-black font-black text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest transition-colors"
                        style={{
                          background:
                            "linear-gradient(135deg, #ffffff, #e0e0e0)",
                          clipPath:
                            "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                        }}
                      >
                        View Hall of Fame
                      </m.div>
                    </Link>

                    <button
                      onClick={() => setShowExitModal(false)}
                      className="mt-4 sm:mt-5 text-[9px] sm:text-[10px] font-black text-white/30 hover:text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors"
                    >
                      [ Close ]
                    </button>
                  </div>
                </m.div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
