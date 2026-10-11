"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, History, Plus } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isHistory = pathname === "/history";

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{
        background: "oklch(0.07 0.02 265 / 0.9)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight text-sm sm:text-base whitespace-nowrap">
            ListingGuard
          </span>
        </Link>

        {/* Nav tabs */}
        <nav className="flex items-center gap-1.5 flex-shrink-0">
          {/* New Review Tab */}
          {isHome ? (
            <span className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/10 border border-white/10 flex items-center gap-1.5 whitespace-nowrap shadow-sm">
              <Plus className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />
              <span>
                New<span className="hidden sm:inline"> Review</span>
              </span>
            </span>
          ) : (
            <Link
              href="/"
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                New<span className="hidden sm:inline"> Review</span>
              </span>
            </Link>
          )}

          {/* History Tab */}
          {isHistory ? (
            <span className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/10 border border-white/10 flex items-center gap-1.5 whitespace-nowrap shadow-sm">
              <History className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />
              <span>History</span>
            </span>
          ) : (
            <Link
              href="/history"
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <History className="w-3.5 h-3.5 flex-shrink-0" />
              <span>History</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
