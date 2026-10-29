"use client";

import React from "react";

export function TasteSphere() {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center pointer-events-none">
      {/* Outer Atmosphere Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/30 via-emerald-500/20 to-cyan-500/20 blur-xl animate-pulse" />

      {/* SVG 3D Coordinate Sphere (Screenshot 2) */}
      <svg
        className="w-full h-full animate-orbit"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="sphereCore" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#2e1065" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          <linearGradient id="vectorBeam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Sphere Base */}
        <circle cx="100" cy="100" r="70" fill="url(#sphereCore)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

        {/* Wireframe Longitudes */}
        <ellipse cx="100" cy="100" rx="35" ry="70" stroke="rgba(168,85,247,0.4)" strokeWidth="1" strokeDasharray="3 3" />
        <ellipse cx="100" cy="100" rx="15" ry="70" stroke="rgba(6,182,212,0.4)" strokeWidth="1" strokeDasharray="3 3" />

        {/* Wireframe Latitudes */}
        <ellipse cx="100" cy="100" rx="70" ry="25" stroke="rgba(168,85,247,0.4)" strokeWidth="1" strokeDasharray="3 3" />
        <ellipse cx="100" cy="70" rx="63" ry="18" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="2 2" />
        <ellipse cx="100" cy="130" rx="63" ry="18" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="2 2" />

        {/* Radiating Green/Cyan Coordinate Vector Beams (Screenshot 2) */}
        {/* Beam 1 */}
        <line x1="100" y1="30" x2="100" y2="10" stroke="url(#vectorBeam)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="100" cy="10" r="2.5" fill="#10b981" />

        {/* Beam 2 */}
        <line x1="150" y1="50" x2="168" y2="35" stroke="url(#vectorBeam)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="168" cy="35" r="2.5" fill="#10b981" />

        {/* Beam 3 */}
        <line x1="170" y1="100" x2="192" y2="100" stroke="url(#vectorBeam)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="192" cy="100" r="2.5" fill="#06b6d4" />

        {/* Beam 4 */}
        <line x1="150" y1="150" x2="168" y2="165" stroke="url(#vectorBeam)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="168" cy="165" r="2.5" fill="#10b981" />

        {/* Beam 5 */}
        <line x1="50" y1="50" x2="32" y2="35" stroke="url(#vectorBeam)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="35" r="2.5" fill="#06b6d4" />

        {/* Beam 6 */}
        <line x1="30" y1="100" x2="8" y2="100" stroke="url(#vectorBeam)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="100" r="2.5" fill="#10b981" />

        {/* Beam 7 */}
        <line x1="100" y1="170" x2="100" y2="190" stroke="url(#vectorBeam)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="100" cy="190" r="2.5" fill="#06b6d4" />
      </svg>
    </div>
  );
}
