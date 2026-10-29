"use client";

import React from "react";
import { Star, Clock, Calendar, Play, ChevronLeft, ChevronRight } from "lucide-react";

export interface CinematicSlide {
  rating: string;
  duration: string;
  releaseDate: string;
  title: string;
  description: string;
}

export const CINEMATIC_SLIDES: CinematicSlide[] = [
  {
    rating: "8.7/10 IMDB",
    duration: "132 min",
    releaseDate: "April, 2025",
    title: "Step Through. Work Smarter.",
    description: "A voyage through forgotten realms, where past and future intertwine.",
  },
  {
    rating: "9.8/10 TASTE",
    duration: "12 Acts · 2 Stages",
    releaseDate: "Austin · Oct, 2026",
    title: "The Bill. Lineups As Portfolios.",
    description: "Submodular festival booking maximizing distinct ticket-buying households at constant spend.",
  },
  {
    rating: "9.4/10 AFFINITY",
    duration: "10 Acts · Dual Stage",
    releaseDate: "Tokyo · Nov, 2026",
    title: "Tokyo Echoes. Zero Overlap.",
    description: "Hyperlocal taste embeddings powering cross-genre discovery with verifiable mathematical receipts.",
  },
];

interface CinematicHeroContentProps {
  currentSlideIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onWatchNow: () => void;
  onLearnMore: () => void;
}

export function CinematicHeroContent({
  currentSlideIndex,
  onPrev,
  onNext,
  onWatchNow,
  onLearnMore,
}: CinematicHeroContentProps) {
  const slide = CINEMATIC_SLIDES[currentSlideIndex] ?? CINEMATIC_SLIDES[0]!;

  return (
    <div className="flex-1 flex flex-col justify-end px-4 sm:px-6 md:px-12 pb-8 md:pb-16 z-10 w-full">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 w-full">
        {/* Left Side: flex-1 */}
        <div className="flex-1 w-full max-w-4xl">
          {/* Metadata Row (delay 300ms) */}
          <div
            className="animate-blur-fade-up flex flex-wrap items-center gap-3 sm:gap-6 mb-6 md:mb-8 text-xs sm:text-sm text-gray-300"
            style={{ animationDelay: "300ms" }}
          >
            {/* Star Rating */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Star
                size={16}
                className="fill-white text-white sm:w-5 sm:h-5 shrink-0"
              />
              <span className="font-medium text-white">{slide.rating}</span>
            </div>

            {/* Clock / Duration */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock size={16} className="text-gray-300 shrink-0" />
              <span>{slide.duration}</span>
            </div>

            {/* Calendar / Release Date */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar size={16} className="text-gray-300 shrink-0" />
              <span>{slide.releaseDate}</span>
            </div>
          </div>

          {/* Title (delay 400ms) */}
          <h1
            className="animate-blur-fade-up text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.04em] mb-4 md:mb-6 text-white leading-[1.05]"
            style={{ animationDelay: "400ms" }}
          >
            {slide.title}
          </h1>

          {/* Description (delay 500ms) */}
          <p
            className="animate-blur-fade-up text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-12 max-w-2xl leading-relaxed"
            style={{ animationDelay: "500ms" }}
          >
            {slide.description}
          </p>

          {/* CTA Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Watch Now (delay 600ms) */}
            <button
              type="button"
              onClick={onWatchNow}
              className="animate-blur-fade-up bg-white text-black rounded-full font-medium px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-gray-200 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-lg"
              style={{ animationDelay: "600ms" }}
            >
              <Play size={18} className="fill-black text-black shrink-0" />
              <span>Watch Now</span>
            </button>

            {/* Learn More (delay 700ms) */}
            <button
              type="button"
              onClick={onLearnMore}
              className="animate-blur-fade-up rounded-full font-medium liquid-glass px-6 sm:px-8 py-2.5 sm:py-3 text-white hover:text-gray-200 transition-colors inline-flex items-center gap-2 cursor-pointer"
              style={{ animationDelay: "700ms" }}
            >
              <span>Learn More</span>
            </button>
          </div>
        </div>

        {/* Right Side: Navigation Arrows (md:w-auto, aligned right on desktop, left on mobile) */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-start md:justify-end shrink-0">
          {/* Previous (delay 800ms) */}
          <button
            type="button"
            onClick={onPrev}
            className="animate-blur-fade-up rounded-full liquid-glass px-4 sm:px-6 py-2.5 sm:py-3 text-white hover:text-gray-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            style={{ animationDelay: "800ms" }}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">Previous</span>
          </button>

          {/* Next (delay 900ms) */}
          <button
            type="button"
            onClick={onNext}
            className="animate-blur-fade-up rounded-full liquid-glass px-4 sm:px-6 py-2.5 sm:py-3 text-white hover:text-gray-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            style={{ animationDelay: "900ms" }}
            aria-label="Next Slide"
          >
            <span className="text-sm font-medium">Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

