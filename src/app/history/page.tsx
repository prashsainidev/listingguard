"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SavedReview, Finding } from "@/lib/types";
import { getSavedReviews, deleteReview, clearAllReviews } from "@/lib/storage";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Plus,
  History,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  Download,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";

const STATUS = {
  approved: {
    label: "Approved",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    style: { background: "oklch(0.65 0.2 145 / 0.15)", border: "1px solid oklch(0.65 0.2 145 / 0.35)", color: "oklch(0.78 0.18 145)" },
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="w-3.5 h-3.5" />,
    style: { background: "oklch(0.62 0.22 25 / 0.15)", border: "1px solid oklch(0.62 0.22 25 / 0.35)", color: "oklch(0.78 0.2 25)" },
  },
  "partially-approved": {
    label: "Partial",
    icon: <Clock className="w-3.5 h-3.5" />,
    style: { background: "oklch(0.75 0.18 55 / 0.12)", border: "1px solid oklch(0.75 0.18 55 / 0.3)", color: "oklch(0.88 0.16 55)" },
  },
};

const SEV_STYLE = {
  critical: { background: "oklch(0.62 0.22 25 / 0.12)", border: "1px solid oklch(0.62 0.22 25 / 0.25)", color: "oklch(0.78 0.2 25)", dot: "oklch(0.68 0.22 25)" },
  warning:  { background: "oklch(0.75 0.18 55 / 0.1)", border: "1px solid oklch(0.75 0.18 55 / 0.25)", color: "oklch(0.88 0.16 55)", dot: "oklch(0.75 0.18 55)" },
  info:     { background: "oklch(0.65 0.22 270 / 0.1)", border: "1px solid oklch(0.65 0.22 270 / 0.25)", color: "oklch(0.78 0.18 270)", dot: "oklch(0.65 0.22 270)" },
};

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "linear-gradient(90deg, oklch(0.55 0.2 145), oklch(0.7 0.2 145))"
    : score >= 40 ? "linear-gradient(90deg, oklch(0.65 0.18 55), oklch(0.75 0.18 55))"
    : "linear-gradient(90deg, oklch(0.55 0.22 25), oklch(0.68 0.22 25))";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "oklch(1 0 0 / 0.08)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color, transition: "width 1s ease" }} />
      </div>
      <span className="text-sm font-bold text-white/80 w-10 text-right">{score}</span>
    </div>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  const sev = SEV_STYLE[finding.severity];
  const decisionColors: Record<string, string> = {
    approved: "oklch(0.78 0.18 145)",
    edited: "oklch(0.78 0.18 145)",
    rejected: "oklch(0.78 0.2 25)",
    pending: "oklch(1 0 0 / 0.35)",
  };
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: sev.background, border: sev.border }}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: sev.dot }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: sev.color }}>
            {finding.severity}
          </span>
          <span className="text-xs text-white/35 capitalize">{finding.field}</span>
        </div>
        <span className="text-xs font-medium flex-shrink-0" style={{ color: decisionColors[finding.decision] ?? "oklch(1 0 0 / 0.35)" }}>
          {finding.decision === "edited" ? "Edited" : finding.decision.charAt(0).toUpperCase() + finding.decision.slice(1)}
        </span>
      </div>
      <p className="text-xs text-white/60 leading-relaxed">{finding.issue}</p>
      <p className="text-xs text-white/35 mt-1">{finding.policySection}</p>
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<SavedReview[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "rejected" | "partially-approved">("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setReviews(getSavedReviews());
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function handleDelete(listingId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDeletingId(listingId);
    setTimeout(() => {
      deleteReview(listingId);
      setReviews(getSavedReviews());
      setDeletingId(null);
      if (expandedId === listingId) setExpandedId(null);
    }, 300);
  }

  function handleClearAll() {
    if (window.confirm("Are you sure you want to clear all audit history? This cannot be undone.")) {
      clearAllReviews();
      setReviews([]);
    }
  }

  function handleExport() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reviews, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `listingguard-audit-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function toggleExpand(listingId: string) {
    setExpandedId((prev) => (prev === listingId ? null : listingId));
  }

  const totalReviews = reviews.length;
  const avgScore = totalReviews > 0
    ? Math.round(reviews.reduce((s, r) => s + r.result.overallScore, 0) / totalReviews)
    : 0;
  const approvedCount = reviews.filter((r) => r.finalStatus === "approved").length;
  const rejectedCount = reviews.filter((r) => r.finalStatus === "rejected").length;
  const partialCount = reviews.filter((r) => r.finalStatus === "partially-approved").length;

  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.finalStatus === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      r.listing.title.toLowerCase().includes(q) ||
      r.listing.seller.toLowerCase().includes(q) ||
      r.listing.category.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen mesh-bg text-white">
      {/* Nav */}
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-16 sm:pb-20">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Review History</h1>
            <p className="text-white/40 text-xs sm:text-sm mt-1">All your past AI listing audits · Click any card to see findings</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {reviews.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-3 py-2 rounded-xl text-xs font-semibold glass hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-1.5"
                  title="Export audit logs as JSON"
                >
                  <Download className="w-3.5 h-3.5 text-violet-400" /> Export JSON
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-2 rounded-xl text-xs font-semibold glass hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-all flex items-center gap-1.5"
                  title="Clear all stored audits"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </>
            )}
            <button onClick={() => router.push("/")} className="btn-primary">
              <Plus className="w-4 h-4" /> New Listing
            </button>
          </div>
        </div>

        {/* Stats */}
        {loaded && reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: "Total Reviews", value: totalReviews, icon: <History className="w-4 h-4" /> },
              { label: "Average Score", value: `${avgScore}/100`, icon: <TrendingUp className="w-4 h-4" /> },
              { label: "Approved", value: approvedCount, icon: <CheckCircle2 className="w-4 h-4" /> },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: "oklch(0.65 0.22 270 / 0.15)", color: "oklch(0.75 0.18 270)" }}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/40">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search & Filter Toolbar */}
        {loaded && reviews.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-white/35 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, seller, or category…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(
                [
                  { id: "all", label: `All (${totalReviews})` },
                  { id: "approved", label: `Approved (${approvedCount})` },
                  { id: "partially-approved", label: `Partial (${partialCount})` },
                  { id: "rejected", label: `Rejected (${rejectedCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === tab.id
                      ? "bg-white/12 text-white border border-white/15 shadow-sm"
                      : "text-white/45 hover:text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state — No reviews at all */}
        {loaded && reviews.length === 0 && (
          <div className="glass rounded-3xl py-24 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: "oklch(0.65 0.22 270 / 0.1)", border: "1px solid oklch(0.65 0.22 270 / 0.2)" }}>
              <History className="w-8 h-8" style={{ color: "oklch(0.65 0.22 270 / 0.5)" }} />
            </div>
            <p className="text-xl font-bold text-white mb-2">No reviews yet</p>
            <p className="text-sm text-white/40 mb-8 max-w-xs mx-auto">
              Submit your first listing and our AI will analyze it against marketplace policy.
            </p>
            <button onClick={() => router.push("/")} className="btn-primary mx-auto">
              <Plus className="w-4 h-4" /> Review a Listing
            </button>
          </div>
        )}

        {/* Empty state — Filter/Search yielded 0 matches */}
        {loaded && reviews.length > 0 && filteredReviews.length === 0 && (
          <div className="glass rounded-2xl py-14 text-center px-4">
            <p className="text-sm font-semibold text-white mb-1">No matching audits found</p>
            <p className="text-xs text-white/40 mb-4">Try adjusting your search query or status filter.</p>
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold glass hover:bg-white/10 text-violet-400"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Review cards */}
        <div className="space-y-4">
          {filteredReviews.map((review, i) => {
            const statusCfg = STATUS[review.finalStatus];
            const criticals = review.result.findings.filter((f) => f.severity === "critical").length;
            const warnings = review.result.findings.filter((f) => f.severity === "warning").length;
            const infos = review.result.findings.filter((f) => f.severity === "info").length;
            const isExpanded = expandedId === review.listing.id;
            const isDeleting = deletingId === review.listing.id;

            return (
              <div
                key={review.listing.id}
                className="glass rounded-2xl overflow-hidden slide-up"
                style={{
                  animationDelay: `${i * 0.06}s`,
                  opacity: isDeleting ? 0.3 : 1,
                  transition: "opacity 0.3s ease",
                  border: isExpanded ? "1px solid oklch(0.65 0.22 270 / 0.25)" : "1px solid oklch(1 0 0 / 0.08)",
                }}
              >
                {/* Card header — clickable (div, not button, because delete button is nested inside) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(review.listing.id)}
                  onKeyDown={(e) => e.key === "Enter" && toggleExpand(review.listing.id)}
                  className="w-full text-left px-4 sm:px-6 py-4 sm:py-5 transition-all cursor-pointer"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "oklch(1 0 0 / 0.02)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="tag-pill" style={statusCfg.style}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                        <span className="text-xs text-white/30">
                          {new Date(review.savedAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-white truncate pr-4">{review.listing.title}</h3>
                      <p className="text-xs text-white/40 mt-0.5">
                        {review.listing.category} · {review.listing.seller} · ₹{parseFloat(review.listing.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleDelete(review.listing.id, e)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: "oklch(1 0 0 / 0.3)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "oklch(0.62 0.22 25 / 0.15)";
                          e.currentTarget.style.color = "oklch(0.78 0.2 25)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "oklch(1 0 0 / 0.3)";
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="mb-4">
                    <p className="text-xs text-white/35 mb-1.5">Quality Score</p>
                    <ScoreBar score={review.result.overallScore} />
                  </div>

                  {/* Bottom row — issue pills + expand toggle */}
                  <div className="flex flex-wrap items-center gap-2">
                    {criticals > 0 && (
                      <span className="tag-pill"
                        style={{ background: "oklch(0.62 0.22 25 / 0.12)", border: "1px solid oklch(0.62 0.22 25 / 0.25)", color: "oklch(0.78 0.2 25)" }}>
                        <XCircle className="w-3 h-3" /> {criticals} Critical
                      </span>
                    )}
                    {warnings > 0 && (
                      <span className="tag-pill"
                        style={{ background: "oklch(0.75 0.18 55 / 0.1)", border: "1px solid oklch(0.75 0.18 55 / 0.25)", color: "oklch(0.88 0.16 55)" }}>
                        <AlertTriangle className="w-3 h-3" /> {warnings} Warning
                      </span>
                    )}
                    {infos > 0 && (
                      <span className="tag-pill"
                        style={{ background: "oklch(0.65 0.22 270 / 0.1)", border: "1px solid oklch(0.65 0.22 270 / 0.25)", color: "oklch(0.78 0.18 270)" }}>
                        <Info className="w-3 h-3" /> {infos} Info
                      </span>
                    )}
                    {review.result.findings.length === 0 && (
                      <span className="tag-pill"
                        style={{ background: "oklch(0.65 0.2 145 / 0.1)", border: "1px solid oklch(0.65 0.2 145 / 0.25)", color: "oklch(0.78 0.18 145)" }}>
                        <CheckCircle2 className="w-3 h-3" /> Clean Listing
                      </span>
                    )}
                    {review.result.findings.length > 0 && (
                      <div className="w-full sm:w-auto sm:ml-auto flex items-center justify-end gap-1.5 text-xs font-medium pt-1 sm:pt-0"
                        style={{ color: isExpanded ? "oklch(0.78 0.18 270)" : "oklch(1 0 0 / 0.4)" }}>
                        {isExpanded ? "Hide" : `${review.result.findings.length} findings`}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded findings panel */}
                {isExpanded && review.result.findings.length > 0 && (
                  <div className="px-4 sm:px-6 pb-5 space-y-3"
                    style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}>
                    <p className="text-xs font-semibold tracking-wider pt-4 mb-3"
                      style={{ color: "oklch(0.65 0.22 270)" }}>
                      AI FINDINGS ({review.result.findings.length})
                    </p>
                    {review.result.findings.map((finding) => (
                      <FindingRow key={finding.id} finding={finding} />
                    ))}

                    {/* AI Summary */}
                    {review.result.summary && (
                      <div className="rounded-xl px-4 py-3 mt-2"
                        style={{ background: "oklch(0.09 0.02 265 / 0.6)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
                        <p className="text-xs font-semibold tracking-wider mb-1"
                          style={{ color: "oklch(0.65 0.22 270)" }}>✦ AI SUMMARY</p>
                        <p className="text-xs text-white/50 leading-relaxed">{review.result.summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
