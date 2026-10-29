import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Bill — Portfolio Lineup Solver (Powered by Qloo)",
  description:
    "A budget-constrained lineup portfolio optimizer grounded in Qloo's cultural taste graph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="antialiased bg-[#09090b] text-[#f1eff0] min-h-screen selection:bg-[#cbf230] selection:text-[#09090b]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
