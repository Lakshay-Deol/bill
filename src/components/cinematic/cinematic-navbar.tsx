"use client";

import React from "react";
import { Search, User, Menu, X } from "lucide-react";

export const NAV_LINKS = [
  { name: "Movies", delay: "100ms" },
  { name: "TV Series", delay: "150ms" },
  { name: "Editor's Pick", delay: "200ms" },
  { name: "Interviews", delay: "250ms" },
  { name: "User Reviews", delay: "300ms" },
] as const;

interface CinematicNavbarProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  activeNav: string;
  onSelectNav: (item: string) => void;
}

export function CinematicNavbar({
  isMenuOpen,
  onToggleMenu,
  onOpenSearch,
  onOpenProfile,
  activeNav,
  onSelectNav,
}: CinematicNavbarProps) {
  return (
    <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6 w-full">
      {/* Left: Text Logo with delay 0ms */}
      <div
        className="animate-blur-fade-up h-8 md:h-10 flex items-center"
        style={{ animationDelay: "0ms" }}
      >
        <button
          type="button"
          onClick={() => onSelectNav("Movies")}
          className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-white hover:text-gray-300 transition-colors cursor-pointer"
        >
          CINEMATIC
        </button>
      </div>

      {/* Center: Desktop Navigation Links (hidden below lg) */}
      <div className="hidden lg:flex items-center gap-8">
        {NAV_LINKS.map((link) => {
          const isActive = activeNav === link.name;
          return (
            <button
              key={link.name}
              type="button"
              onClick={() => onSelectNav(link.name)}
              className={`animate-blur-fade-up text-sm font-normal transition-colors cursor-pointer ${
                isActive ? "text-white font-medium" : "text-gray-300 hover:text-white"
              }`}
              style={{ animationDelay: link.delay }}
            >
              {link.name}
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search button visible on sm and up (delay 350ms) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="animate-blur-fade-up hidden sm:inline-flex items-center gap-2 rounded-full liquid-glass px-4 md:px-6 py-2 text-sm text-white hover:text-gray-200 transition-colors cursor-pointer"
          style={{ animationDelay: "350ms" }}
        >
          <span>Search</span>
          <Search size={18} className="text-white shrink-0" />
        </button>

        {/* User/profile circle button visible on sm and up (delay 400ms) */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="animate-blur-fade-up hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-full liquid-glass text-white hover:text-gray-200 transition-colors cursor-pointer"
          style={{ animationDelay: "400ms" }}
          aria-label="User Profile"
        >
          <User size={18} />
        </button>

        {/* Hamburger menu button visible only below lg (delay 350ms) */}
        <button
          type="button"
          onClick={onToggleMenu}
          className="animate-blur-fade-up lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full liquid-glass relative cursor-pointer text-white focus:outline-none"
          style={{ animationDelay: "350ms" }}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {/* Menu Icon */}
          <Menu
            size={18}
            className={`transition-all duration-500 ease-out absolute ${
              isMenuOpen ? "rotate-180 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"
            }`}
          />
          {/* X Icon */}
          <X
            size={18}
            className={`transition-all duration-500 ease-out absolute ${
              isMenuOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-180 opacity-0 scale-50"
            }`}
          />
        </button>
      </div>
    </nav>
  );
}

