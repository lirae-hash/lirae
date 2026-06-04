"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";

// Archetype display names
const ARCHETYPE_NAMES: Record<string, string> = {
  brooding: "The Brooding Rival",
  cinnamon: "The Cinnamon Roll",
  rogue: "The Charming Rogue",
  protector: "The Fierce Protector",
  tortured: "The Tortured Soul",
  golden: "The Golden Boy",
};

// Ending configuration
const ENDING_CONFIG = {
  hea: {
    title: "Happily Ever After",
    fallbackQuote: "I chose vulnerability. I chose him. And he chose me back.",
  },
  hfn: {
    title: "Happy For Now",
    fallbackQuote: "The story isn't over. But right now, in this moment, we're together.",
  },
  heartbreak: {
    title: "Heartbreak",
    fallbackQuote: "Some walls are built to protect. Some distances can't be closed.",
  },
};

// Test page to preview the ending card
export default function TestCardPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sample data - customize to preview different combinations
  const ending = "hea";
  const vibe = "rose";
  const archetype = "cinnamon";
  const protagonistName = "Elena";
  const heroName = "Julian";
  const finalWords = "I think I've been falling for you since the moment you told me my dessert had no soul.";
  const adventureTitle = "The Kitchen";
  const adventureId = "the-kitchen";

  const config = ENDING_CONFIG[ending as keyof typeof ENDING_CONFIG];
  const archetypeName = ARCHETYPE_NAMES[archetype];
  const heroQuote = finalWords || config.fallbackQuote;

  // Scene image URL
  const sceneImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scene-images/${adventureId}/resolution_${vibe}.png`;

  const vibeAccents: Record<string, string> = {
    dark: "#64748b",
    gold: "#d97706",
    rose: "#e11d48",
    sage: "#10b981",
  };

  async function handleDownload() {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0f0f0f",
      });
      const link = document.createElement("a");
      link.download = `lirae-${ending}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="min-h-screen bg-near-black p-8">
      <h1 className="text-cream text-2xl font-serif text-center mb-8">Ending Card Preview</h1>

      {/* The shareable card */}
      <div
        ref={cardRef}
        style={{
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
          padding: "48px 32px",
          borderRadius: "24px",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#0f0f0f",
        }}
      >
        {/* Scene image background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${sceneImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        />
        {/* Dark gradient overlay for readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(180deg, rgba(15,15,15,0.7) 0%, rgba(15,15,15,0.85) 50%, rgba(15,15,15,0.95) 100%)",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          {/* The End label */}
          <p
            style={{
              color: vibeAccents[vibe],
              fontSize: "11px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: "16px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            The End
          </p>

          {/* Ending title */}
          <h2
            style={{
              color: "#f5f5dc",
              fontSize: "32px",
              fontFamily: "Georgia, serif",
              fontWeight: "normal",
              marginBottom: "8px",
              lineHeight: 1.2,
            }}
          >
            {config.title}
          </h2>

          {/* Protagonist name */}
          {protagonistName && (
            <p
              style={{
                color: "#a8a29e",
                fontSize: "14px",
                marginBottom: "8px",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {protagonistName}&apos;s story
            </p>
          )}

          {/* Archetype */}
          <p
            style={{
              color: "#a8a29e",
              fontSize: "14px",
              marginBottom: "32px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            with <span style={{ color: "#8b2252", fontWeight: 500 }}>{archetypeName}</span>
          </p>

          {/* Hero quote */}
          <div
            style={{
              background: "rgba(15, 15, 15, 0.6)",
              borderRadius: "16px",
              padding: "24px 20px",
              marginBottom: "32px",
              borderLeft: `3px solid ${vibeAccents[vibe]}`,
            }}
          >
            <p
              style={{
                color: "#f5f5dc",
                fontSize: "18px",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              &ldquo;{heroQuote}&rdquo;
            </p>
            <p
              style={{
                color: vibeAccents[vibe],
                fontSize: "14px",
                fontFamily: "Georgia, serif",
                marginTop: "12px",
                textAlign: "right",
              }}
            >
              — {heroName}
            </p>
          </div>

          {/* Adventure title */}
          <p
            style={{
              color: "#78716c",
              fontSize: "12px",
              marginBottom: "24px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {adventureTitle}
          </p>

          {/* Lirae branding */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ color: "#8b2252", fontSize: "20px", fontFamily: "Georgia, serif" }}>
              Lirae
            </span>
            <span style={{ color: "#57534e", fontSize: "11px", fontFamily: "system-ui, sans-serif" }}>
              lirae.app
            </span>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="px-6 py-3 bg-wine hover:bg-wine-light disabled:bg-warm-gray text-cream font-medium rounded-lg transition-colors"
        >
          {isDownloading ? "Saving..." : "Download PNG"}
        </button>
      </div>

      {/* Preview info */}
      <div className="mt-8 text-center text-cream-muted text-sm">
        <p>Preview with: {vibe} vibe, {ending} ending, {archetype} archetype</p>
        <p className="mt-2">Scene image: resolution_{vibe}.png</p>
        <p className="mt-2">Edit the variables in this file to test other combinations.</p>
      </div>
    </main>
  );
}
