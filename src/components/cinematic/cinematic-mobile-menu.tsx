"use client";

import React from "react";
import { Search, User } from "lucide-react";
import { NAV_LINKS } from "./cinematic-navbar";

interface CinematicMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeNav: string;
  onSelectNav: (item: string) => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
}

export function CinematicMobileMenu({
  isOpen,
  onClose,
  activeNav,
  onSelectNav,
  onOpenSearch,
  onOpenProfile,
}: CinematicMobileMenuProps) {
  return (
    <div
      className={`lg:hidden absolute top-[72px] left-0 right-0 z-40 transition-all duration-500 ease-out bg-gray-900/95 backdrop-blur-lg border-t border-b border-gray-800 shadow-2xl px-6 py-6 ${
        isOpen
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col gap-1">
        {NAV_LINKS.map((link, idx) => {
          const isActive = activeNav === link.name;
          const slideDelay = `${(idx + 1) * 50}ms`;

          return (
            <button
              key={link.name}
              type="button"
              onClick={() => {
                onSelectNav(link.name);
                onClose();
              }}
              style={{
                transitionDelay: isOpen ? slideDelay : "0ms",
              }}
              className={`text-left py-3 px-3 rounded-lg text-sm transition-all duration-500 ease-out hover:bg-gray-800/50 cursor-pointer ${
                isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
              } ${isActive ? "text-white font-semibold bg-gray-800/30" : "text-gray-300"}`}
            >
              {link.name}
            </button>
          );
        })}
      </div>

      {/* Visible only below sm breakpoint (< 640px) */}
      <div className="sm:hidden pt-4 mt-4 border-t border-gray-800 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            onOpenSearch();
            onClose();
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full liquid-glass py-2.5 px-4 text-xs font-medium text-white hover:text-gray-200 transition-colors cursor-pointer"
        >
          <Search size={16} />
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenProfile();
            onClose();
          }}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full liquid-glass text-white hover:text-gray-200 transition-colors cursor-pointer"
          aria-label="User Profile"
        >
          <User size={16} />
        </button>
      </div>
    </div>
  );
}

