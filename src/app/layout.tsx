import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CINEMATIC — Step Through. Work Smarter.",
  description: "A full-viewport cinematic movie and streaming experience powered by Qloo taste intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full w-full bg-black text-white" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="h-full w-full overflow-hidden bg-black text-white antialiased selection:bg-white selection:text-black"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
