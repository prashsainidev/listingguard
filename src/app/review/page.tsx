"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Listing, ReviewResult, Finding, DecisionStatus, SavedReview } from "@/lib/types";
import { saveReview } from "@/lib/storage";
import {
  CheckCircle2,
  XCircle,
  Pencil,
  Loader2,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowLeft,
  Save,
  RefreshCw,
  TrendingUp,
  ListChecks,
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";

// ── Severity config ───────────────────────────────────────────────────────────
const SEV = {
  critical: {
    label: "Critical",
    icon: <XCircle className="w-3.5 h-3.5" />,
    tagStyle: { background: "oklch(0.62 0.22 25 / 0.18)", border: "1px solid oklch(0.62 0.22 25 / 0.4)", color: "oklch(0.82 0.18 25)" },
    borderColor: "oklch(0.62 0.22 25 / 0.2)",
    glowColor: "oklch(0.62 0.22 25 / 0.06)",
  },
  warning: {
    label: "Warning",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    tagStyle: { background: "oklch(0.75 0.18 55 / 0.15)", border: "1px solid oklch(0.75 0.18 55 / 0.35)", color: "oklch(0.88 0.16 55)" },
    borderColor: "oklch(0.75 0.18 55 / 0.2)",
    glowColor: "oklch(0.75 0.18 55 / 0.06)",
  },
  info: {
    label: "Info",
    icon: <Info className="w-3.5 h-3.5" />,
    tagStyle: { background: "oklch(0.65 0.22 270 / 0.15)", border: "1px solid oklch(0.65 0.22 270 / 0.35)", color: "oklch(0.82 0.18 270)" },
    borderColor: "oklch(0.65 0.22 270 / 0.2)",
    glowColor: "oklch(0.65 0.22 270 / 0.06)",
  },
};

// ── Score arc (SVG ring) ──────────────────────────────────────────────────────
function ScoreArc({ score, size = 96 }: { score: number; size?: number }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const cx = size / 2;
  const color =
    score >= 70
      ? "oklch(0.7 0.2 145)"
      : score >= 40
      ? "oklch(0.75 0.18 55)"
      : "oklch(0.68 0.22 25)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="8" />
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          style={{ transition: "stroke-dasharray 1.2s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white leading-none">{score}</span>
        <span className="text-[10px] text-white/40 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ icon, label, value, highlight }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className="glass rounded-2xl flex flex-row sm:flex-col items-center sm:justify-center gap-3 sm:gap-1 px-4 py-3 sm:py-4 text-left sm:text-center"
      style={highlight ? { borderColor: "oklch(0.65 0.2 145 / 0.3)", background: "oklch(0.13 0.04 145 / 0.4)" } : {}}
    >
      <div className="text-white/40 flex-shrink-0">{icon}</div>
      <div className="flex flex-row sm:flex-col items-baseline sm:items-center gap-2 sm:gap-0">
        <span className="text-xl sm:text-2xl font-bold text-white">{value}</span>
        <span className="text-xs text-white/40">{label}</span>
      </div>
    </div>
  );
}

// ── FindingCard ───────────────────────────────────────────────────────────────
function FindingCard({
  finding, idx, editingId, editValue, setEditingId, setEditValue, onDecision,
}: {
  finding: Finding;
  idx: number;
  editingId: string | null;
  editValue: string;
  setEditingId: (id: string | null) => void;
  setEditValue: (v: string) => void;
  onDecision: (id: string, d: DecisionStatus, edited?: string) => void;
}) {
  const cfg = SEV[finding.severity];
  const isEditing = editingId === finding.id;
  const isDone = finding.decision !== "pending";

  const decisionLabel = {
    approved: { text: "Approved", style: { background: "oklch(0.65 0.2 145 / 0.18)", color: "oklch(0.78 0.18 145)", border: "1px solid oklch(0.65 0.2 145 / 0.35)" } },
    edited:   { text: "Edited & Approved", style: { background: "oklch(0.65 0.2 145 / 0.18)", color: "oklch(0.78 0.18 145)", border: "1px solid oklch(0.65 0.2 145 / 0.35)" } },
    rejected: { text: "Rejected", style: { background: "oklch(0.62 0.22 25 / 0.15)", color: "oklch(0.78 0.2 25)", border: "1px solid oklch(0.62 0.22 25 / 0.35)" } },
    pending:  { text: "Pending", style: {} },
  }[finding.decision];

  return (
    <div
      className="glass-hover rounded-2xl overflow-hidden slide-up"
      style={{
        animationDelay: `${idx * 0.07}s`,
        border: `1px solid ${cfg.borderColor}`,
        background: `linear-gradient(135deg, oklch(0.11 0.025 265 / 0.9), ${cfg.glowColor})`,
      }}
    >
      {/* Header row */}
      <div className="px-4 sm:px-5 pt-4 pb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="tag-pill" style={cfg.tagStyle}>
            {cfg.icon}
            {cfg.label}
          </span>
          <span
            className="tag-pill"
            style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.1)", color: "oklch(1 0 0 / 0.5)" }}
          >
            {finding.field}
          </span>
        </div>
        {isDone && (
          <span className="tag-pill whitespace-nowrap flex-shrink-0" style={decisionLabel.style}>
            {decisionLabel.text}
          </span>
        )}
      </div>

      {/* Issue text */}
      <div className="px-4 sm:px-5 pb-4">
        <p className="text-white/90 text-sm font-medium leading-relaxed mb-3">{finding.issue}</p>

        {/* Policy citation */}
        <div className="flex items-center gap-2 mb-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="oklch(0.72 0.18 270)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span className="text-xs font-medium" style={{ color: "oklch(0.72 0.18 270)" }}>
            {finding.policySection}
          </span>
        </div>

        {/* AI Suggestion box */}
        <div className="rounded-xl px-4 py-3 mb-4"
          style={{ background: "oklch(0.09 0.02 265 / 0.6)", border: "1px solid oklch(1 0 0 / 0.07)" }}>
          <p className="text-xs font-semibold tracking-wider mb-1.5"
            style={{ color: "oklch(0.65 0.22 270)" }}>
            ✦ AI SUGGESTION
          </p>
          <p className="text-sm text-white/65 leading-relaxed">{finding.suggestion}</p>
        </div>

        {/* Edit textarea */}
        {isEditing && (
          <div className="space-y-2.5 mb-4">
            <p className="text-xs text-white/40">Edit the suggestion before approving:</p>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={3}
              className="input-premium resize-none"
              style={{ border: "1px solid oklch(0.65 0.22 270 / 0.4)", fontSize: "0.875rem" }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onDecision(finding.id, "edited", editValue)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "oklch(0.65 0.2 145 / 0.2)", border: "1px solid oklch(0.65 0.2 145 / 0.4)", color: "oklch(0.78 0.18 145)" }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Edited
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.1)", color: "oklch(1 0 0 / 0.45)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isDone && !isEditing && (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onDecision(finding.id, "approved")}
              className="flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: "oklch(0.65 0.2 145 / 0.12)", border: "1px solid oklch(0.65 0.2 145 / 0.3)", color: "oklch(0.78 0.18 145)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.65 0.2 145 / 0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "oklch(0.65 0.2 145 / 0.12)")}
            >
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xs:inline">Approve</span>
            </button>
            <button
              onClick={() => { setEditValue(finding.suggestion); setEditingId(finding.id); }}
              className="flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: "oklch(0.65 0.22 270 / 0.1)", border: "1px solid oklch(0.65 0.22 270 / 0.3)", color: "oklch(0.78 0.18 270)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.65 0.22 270 / 0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "oklch(0.65 0.22 270 / 0.1)")}
            >
              <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xs:inline">Edit</span>
            </button>
            <button
              onClick={() => onDecision(finding.id, "rejected")}
              className="flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: "oklch(0.62 0.22 25 / 0.1)", border: "1px solid oklch(0.62 0.22 25 / 0.25)", color: "oklch(0.78 0.2 25)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.62 0.22 25 / 0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "oklch(0.62 0.22 25 / 0.1)")}
            >
              <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xs:inline">Reject</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  return <Navbar />;
}

// ── Main page content ─────────────────────────────────────────────────────────
function ReviewPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [listing, setListing] = useState<Listing | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "done">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [showListingDetails, setShowListingDetails] = useState(false);

  useEffect(() => {
    if (!id) {
      router.push("/");
      return;
    }
    const raw = sessionStorage.getItem(`listing_${id}`);
    if (!raw) {
      router.push("/");
      return;
    }
    try {
      const parsed: Listing = JSON.parse(raw);
      const timer = setTimeout(() => {
        setListing(parsed);
        runAIReview(parsed);
      }, 0);
      return () => clearTimeout(timer);
    } catch {
      router.push("/");
    }
  }, [id, router]);

  async function runAIReview(l: Listing) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing: l }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "AI review failed.");
      setResult(data.result);
      setFindings(data.result.findings);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error.");
      setStatus("error");
    }
  }

  function updateDecision(findingId: string, decision: DecisionStatus, edited?: string) {
    setFindings((prev) =>
      prev.map((f) =>
        f.id === findingId ? { ...f, decision, editedValue: edited ?? f.editedValue } : f
      )
    );
    setEditingId(null);
  }

  function handleSave() {
    if (!listing || !result) return;
    const allApproved = findings.every((f) => f.decision === "approved" || f.decision === "edited");
    const allRejected = findings.every((f) => f.decision === "rejected");
    const finalStatus: SavedReview["finalStatus"] =
      allApproved ? "approved" : allRejected ? "rejected" : "partially-approved";

    const review: SavedReview = {
      listing,
      result: { ...result, findings },
      finalStatus,
      savedAt: new Date().toISOString(),
    };
    saveReview(review);
    setSaved(true);
    setTimeout(() => router.push("/history"), 1500);
  }

  const pendingCount = findings.filter((f) => f.decision === "pending").length;
  const score = result?.overallScore ?? 0;

  // ── Loading ──
  if (status === "loading") {
    return (
      <>
        <Nav />
        <main className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
          <div className="orbit-loader glow-ring">
            <div className="ring1" />
            <div className="ring2" />
            <div className="core">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-base sm:text-lg font-semibold text-white mb-1">Gemini AI is reviewing your listing…</p>
            <p className="text-sm text-white/40">Reading marketplace policy and analyzing content</p>
          </div>
          <div className="flex flex-col gap-2.5 w-full max-w-xs sm:w-80">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 sm:h-20 w-full" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        </main>
      </>
    );
  }

  // ── Error ──
  if (status === "error") {
    return (
      <>
        <Nav />
        <main className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "oklch(0.62 0.22 25 / 0.12)", border: "1px solid oklch(0.62 0.22 25 / 0.3)" }}>
            <XCircle className="w-9 h-9" style={{ color: "oklch(0.78 0.2 25)" }} />
          </div>
          <div>
            <p className="text-xl font-bold text-white mb-2">AI Review Failed</p>
            <p className="text-sm text-white/40 max-w-sm leading-relaxed">{errorMsg}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all glass"
              style={{ color: "oklch(1 0 0 / 0.6)" }}>
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
            <button
              onClick={() => listing && runAIReview(listing)}
              className="btn-primary">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </main>
      </>
    );
  }

  // ── Review results ──
  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-16 sm:pb-20">

        {/* Back */}
        <button onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/70 mb-6 sm:mb-8 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> New Listing
        </button>

        {/* Stats grid — always 3 columns, compact on mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-8">
          <div className="glass rounded-2xl flex flex-col items-center justify-center gap-1.5 py-3 sm:py-5 px-2 sm:px-4 col-span-1">
            <ScoreArc score={score} size={72} />
            <p className="text-[10px] sm:text-xs text-white/40 text-center">Quality Score</p>
          </div>
          <StatChip
            icon={<ListChecks className="w-4 h-4" />}
            label="Issues Found"
            value={findings.length}
            highlight={findings.length === 0}
          />
          <StatChip
            icon={<Clock className="w-4 h-4" />}
            label="Pending"
            value={pendingCount}
            highlight={pendingCount === 0}
          />
        </div>

        {/* AI Summary */}
        <div className="glass rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 mb-5 sm:mb-8 flex gap-3">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
            style={{ background: "oklch(0.65 0.22 270 / 0.18)", border: "1px solid oklch(0.65 0.22 270 / 0.3)" }}
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "oklch(0.78 0.18 270)" }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wider mb-1" style={{ color: "oklch(0.65 0.22 270)" }}>
              AI ASSESSMENT
            </p>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{result?.summary}</p>
          </div>
        </div>

        {/* ── Original Listing Submission Details ──────────────────── */}
        {listing && (
          <div className="glass rounded-2xl overflow-hidden mb-5 sm:mb-8 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setShowListingDetails((prev) => !prev)}
              className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left transition-colors hover:bg-white/[0.03]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
                  <Package className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Original Listing
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
                      {listing.category}
                    </span>
                  </div>
                  <h2 className="text-xs sm:text-sm font-semibold text-white truncate pr-2 mt-0.5">
                    {listing.title}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 text-xs text-white/50">
                <span className="hidden xs:inline">
                  {showListingDetails ? "Hide Content" : "Inspect Content"}
                </span>
                {showListingDetails ? (
                  <ChevronUp className="w-4 h-4 text-violet-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/40" />
                )}
              </div>
            </button>

            {showListingDetails && (
              <div className="px-4 sm:px-5 py-4 border-t border-white/[0.06] bg-black/25 space-y-3.5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2.5">
                    <p className="text-[10px] uppercase font-semibold text-white/40 mb-0.5">Seller</p>
                    <p className="text-xs font-medium text-white truncate">{listing.seller}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2.5">
                    <p className="text-[10px] uppercase font-semibold text-white/40 mb-0.5">Price</p>
                    <p className="text-xs font-medium text-white">₹{parseInt(listing.price || "0").toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2.5">
                    <p className="text-[10px] uppercase font-semibold text-white/40 mb-0.5">Category</p>
                    <p className="text-xs font-medium text-white truncate">{listing.category}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2.5">
                    <p className="text-[10px] uppercase font-semibold text-white/40 mb-0.5">Attributes</p>
                    <p className="text-xs font-medium text-white truncate">{listing.attributes || "None"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-semibold text-white/40 mb-1">Full Description</p>
                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-xs text-white/70 leading-relaxed max-h-44 overflow-y-auto">
                    {listing.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {findings.length === 0 && (
          <div className="glass rounded-2xl py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "oklch(0.65 0.2 145 / 0.15)", border: "1px solid oklch(0.65 0.2 145 / 0.3)" }}>
              <CheckCircle2 className="w-7 h-7" style={{ color: "oklch(0.78 0.18 145)" }} />
            </div>
            <p className="text-lg font-bold text-white mb-1">Listing looks perfect!</p>
            <p className="text-sm text-white/40">No policy violations found. Ready to approve and save.</p>
          </div>
        )}

        {/* Findings */}
        <div className="space-y-4">
          {findings.map((finding, i) => (
            <FindingCard
              key={finding.id}
              idx={i}
              finding={finding}
              editingId={editingId}
              editValue={editValue}
              setEditingId={setEditingId}
              setEditValue={setEditValue}
              onDecision={updateDecision}
            />
          ))}
        </div>

        {/* Save */}
        {(findings.length === 0 || pendingCount < findings.length) && (
          <div className="mt-6 sm:mt-8 flex justify-end">
            {saved ? (
              <div className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "oklch(0.78 0.18 145)" }}>
                <CheckCircle2 className="w-5 h-5" />
                Saved! Redirecting to history…
              </div>
            ) : (
              <button
                onClick={handleSave}
                disabled={pendingCount > 0}
                className="btn-primary w-full sm:w-auto justify-center py-3.5 sm:py-3"
              >
                <Save className="w-4 h-4" />
                {pendingCount > 0 ? `${pendingCount} findings still pending` : "Save & Finalize Review"}
              </button>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.65 0.22 270)" }} />
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
