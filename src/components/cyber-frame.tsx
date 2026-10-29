import React from "react";

interface CyberFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  cornerColor?: "red" | "cyan" | "emerald";
}

export function CyberFrame({
  children,
  className = "",
  cornerColor = "red",
  ...props
}: CyberFrameProps) {
  const borderClasses = {
    red: "border-[#ff2a2a]",
    cyan: "border-[#00f3ff]",
    emerald: "border-[#00ff88]",
  };

  const activeColor = borderClasses[cornerColor];

  return (
    <div
      className={`relative bg-[#090b10]/80 border border-white/10 ${className}`}
      {...props}
    >
      {/* HUD Corner Brackets */}
      <span className={`absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 pointer-events-none ${activeColor}`} />
      <span className={`absolute -top-[1px] -right-[1px] w-2 h-2 border-t-2 border-r-2 pointer-events-none ${activeColor}`} />
      <span className={`absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b-2 border-l-2 pointer-events-none ${activeColor}`} />
      <span className={`absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 pointer-events-none ${activeColor}`} />
      {children}
    </div>
  );
}
