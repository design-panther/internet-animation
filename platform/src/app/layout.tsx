import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ScrollReset from "@/components/ScrollReset";
import AnimModal from "@/components/AnimModal";

export const metadata: Metadata = {
  title: "Internet Animation — GRFX1222",
  description:
    "The course wiki for GRFX1222 Internet Animation: a 16-week hybrid course on vector-based animation for the modern web — animation principles, the Lottie/dotLottie pipeline, After Effects, Rive, web-native SVG/CSS motion, and User-Centered Design for motion. Week-by-week schedule, projects, a rated learning-resource library, and a shared class calendar.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <input type="checkbox" id="nav-toggle" className="nav-toggle-cb" hidden />
          <div className="mobile-bar">
            <label htmlFor="nav-toggle" className="nav-burger" aria-label="Open menu">☰</label>
            <Link href="/" className="mobile-brand">Internet Animation · GRFX1222</Link>
          </div>
          <label htmlFor="nav-toggle" className="nav-backdrop" aria-hidden="true" />
          <Sidebar />
          <main className="main">{children}</main>
          <ScrollReset />
        </div>
        <AnimModal />
      </body>
    </html>
  );
}
