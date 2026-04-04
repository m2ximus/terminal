import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Try Terminal — Learn Command Line Basics",
    template: "%s | Try Terminal",
  },
  description:
    "An interactive game that teaches you terminal basics through a visual, hands-on experience. No experience required. Get ready for Claude Code.",
  openGraph: {
    title: "Try Terminal — Learn Command Line Basics",
    description: "An interactive game that teaches you terminal basics. No experience required.",
    url: "https://tryterminal.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.add('light');else if(t==='dark'||!t)document.documentElement.classList.add('dark');else if(window.matchMedia('(prefers-color-scheme:light)').matches)document.documentElement.classList.add('light');else document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text font-mono">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
