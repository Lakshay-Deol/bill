"use client";

import React from "react";

export function CinematicVideoBg() {
  return (
    <>
      {/* Background Video (z-index 0, fixed, object-cover) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
      />

      {/* Bottom Blur Overlay (no dark gradient, only blur, z-index 1) */}
      <div
        className="bottom-blur-overlay"
        aria-hidden="true"
        style={{
          maskImage: "linear-gradient(to top, black 0%, transparent 45%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 45%)",
        }}
      />
    </>
  );
}

