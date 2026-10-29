"use client";

import React from "react";
import { X } from "lucide-react";

interface CinematicWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function CinematicWatchModal({
  isOpen,
  onClose,
  title,
}: CinematicWatchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl">
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <span className="text-xs font-mono uppercase tracking-widest text-white/80 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
            Now Screening: {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-white hover:text-gray-200 transition-colors pointer-events-auto cursor-pointer"
            aria-label="Close Viewer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          <video
            autoPlay
            controls
            playsInline
            className="w-full h-full object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
          />
        </div>
      </div>
    </div>
  );
}

