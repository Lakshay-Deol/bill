import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Bill — Budget-Constrained Lineup Optimizer",
  description: "A portfolio optimizer for festival and venue lineups, grounded in Qloo's taste graph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#090a0f] text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
