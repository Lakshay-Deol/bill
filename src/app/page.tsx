"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CinematicVideoBg } from "@/components/cinematic/cinematic-video-bg";
import { CinematicNavbar } from "@/components/cinematic/cinematic-navbar";
import { CinematicMobileMenu } from "@/components/cinematic/cinematic-mobile-menu";
import {
  CinematicHeroContent,
  CINEMATIC_SLIDES,
} from "@/components/cinematic/cinematic-hero-content";
import { CinematicWatchModal } from "@/components/cinematic/cinematic-watch-modal";
import { CinematicSearchModal } from "@/components/cinematic/cinematic-search-modal";
import { CinematicOptionsModal } from "@/components/cinematic/cinematic-options-modal";
import { MatrixModal } from "@/components/matrix-modal";
import { Drawer } from "@/components/drawer";
import { BriefState } from "@/components/brief-controls";
import { LineupReceipt, BookedSlot } from "@/lib/solver";

export default function Home() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWatchOpen, setIsWatchOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Movies");

  const [brief, setBrief] = useState<BriefState>({
    market: "Austin",
    budget: 250000,
    capacity: 5000,
    actCount: 8,
    requireLocal: true,
    seeds: ["Phoebe Bridgers", "boygenius", "Lucy Dacus"],
  });

  const [feeOverrides, setFeeOverrides] = useState<Record<string, number>>({});
  const [receipt, setReceipt] = useState<LineupReceipt | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookedSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeSolve = useCallback(
    async (targetBrief?: BriefState, targetOverrides?: Record<string, number>) => {
      const activeBrief = targetBrief ?? brief;
      const activeOverrides = targetOverrides ?? feeOverrides;
      setIsLoading(true);

      try {
        const res = await fetch("/api/solve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...activeBrief, feeOverrides: activeOverrides }),
        });
        if (res.ok) {
          const data: LineupReceipt = await res.json();
          setReceipt(data);
        }
      } catch {
        // Silently preserve state if network is offline
      } finally {
        setIsLoading(false);
      }
    },
    [brief, feeOverrides]
  );

  useEffect(() => {
    executeSolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) =>
      prev === 0 ? CINEMATIC_SLIDES.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) =>
      prev === CINEMATIC_SLIDES.length - 1 ? 0 : prev + 1
    );
  };

  const handleSelectNav = (item: string) => {
    setActiveNav(item);
    if (item === "Editor's Pick" || item === "TV Series") {
      setCurrentSlideIndex(1);
    } else if (item === "Interviews" || item === "User Reviews") {
      setCurrentSlideIndex(2);
    } else {
      setCurrentSlideIndex(0);
    }
  };

  const handleSelectPreset = (p: BriefState) => {
    setBrief(p);
    executeSolve(p);
  };

  const handleOverrideFee = (actId: string, fee: number) => {
    const updated = { ...feeOverrides, [actId]: fee };
    setFeeOverrides(updated);
    executeSolve(brief, updated);
  };

  const activeTitle =
    CINEMATIC_SLIDES[currentSlideIndex]?.title ?? "Step Through. Work Smarter.";

  return (
    <main
      className="relative w-screen h-screen overflow-hidden flex flex-col justify-between bg-black text-white select-none"
      suppressHydrationWarning
    >
      {/* Background Video & Bottom Blur Overlay */}
      <CinematicVideoBg />

      {/* Top Navbar */}
      <CinematicNavbar
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsOptionsOpen(true)}
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
      />

      {/* Mobile Menu Dropdown */}
      <CinematicMobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsOptionsOpen(true)}
      />

      {/* Hero Content at bottom */}
      <CinematicHeroContent
        currentSlideIndex={currentSlideIndex}
        onPrev={handlePrevSlide}
        onNext={handleNextSlide}
        onWatchNow={() => setIsWatchOpen(true)}
        onLearnMore={() => setIsOptionsOpen(true)}
      />

      {/* Watch Modal */}
      <CinematicWatchModal
        isOpen={isWatchOpen}
        onClose={() => setIsWatchOpen(false)}
        title={activeTitle}
      />

      {/* Search Modal */}
      <CinematicSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectOption={(opt) => {
          if (opt.includes("Austin")) {
            setCurrentSlideIndex(1);
          } else if (opt.includes("Tokyo")) {
            setCurrentSlideIndex(2);
          }
        }}
      />

      {/* Options & Portfolio Solver Modal */}
      <CinematicOptionsModal
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        brief={brief}
        onSelectPreset={handleSelectPreset}
        onOpenMatrix={() => {
          setIsOptionsOpen(false);
          setIsMatrixOpen(true);
        }}
        receipt={receipt}
        onSelectSlot={(slot) => setSelectedSlot(slot)}
        onOverrideFee={handleOverrideFee}
        isLoading={isLoading}
      />

      {/* Pairwise Taste Overlap Matrix Modal */}
      {receipt && (
        <MatrixModal
          receipt={receipt}
          isOpen={isMatrixOpen}
          onClose={() => setIsMatrixOpen(false)}
        />
      )}

      {/* Attribution Drawer */}
      <Drawer
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onOverrideFee={handleOverrideFee}
      />
    </main>
  );
}
