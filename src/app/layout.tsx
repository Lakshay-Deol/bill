import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Bill — Festival Portfolio Optimizer",
  description: "A budget-constrained lineup portfolio optimizer grounded in Qloo's cultural taste graph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#090909] text-[#f7f9fa] min-h-screen selection:bg-[#af50ff]/30 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
