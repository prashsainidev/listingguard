"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Listing, ValidationError, SUPPORTED_CATEGORIES } from "@/lib/types";
import { getSavedListings, saveListing } from "@/lib/storage";
import {
  Sparkles,
  AlertCircle,
  ArrowRight,
  Zap,
  Brain,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  price: "",
  attributes: "",
  seller: "",
  tags: "",
};

const DEMO_BAD: Partial<typeof EMPTY_FORM> = {
  title: "Apple iPhone 15 Pro Max 256GB - Guaranteed Miracle Deal!!",
  description:
    "Selling this original flagship smartphone with a special radiation healing bio-shield cover. We guarantee 100% cure for headache and mobile radiation fatigue. Unbeatable discount available today only with free express dispatch.",
  category: "Electronics",
  price: "25000",
  attributes: "Brand: Apple",
  seller: "QuickDeals India",
  tags: "iphone, apple, deal",
};

const DEMO_GOOD: Partial<typeof EMPTY_FORM> = {
  title: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
  description:
    "Authentic Sony WH-1000XM5 premium wireless headphones, matte black, used 2 months. Comes with original packaging, braided aux cable, USB-C fast charging cable, and magnetic carry case. Battery health 100%, up to 30 hours playback.",
  category: "Electronics",
  price: "21999",
  attributes: "Brand: Sony, Color: Matte Black, Condition: Like New, Connectivity: Bluetooth 5.2",
  seller: "SoundWave Official",
  tags: "sony, headphones, anc, wireless",
};

function inputCls(error: boolean) {
  return `input-premium${error ? " error" : ""}`;
}

function FieldWrap({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-white/80">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-white/35">{hint}</p>}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function ListingForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function getErr(field: keyof Listing) {
    return errors.find((e) => e.field === field)?.message;
  }

  function handleChange(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== field));
  }

  function loadDemo(data: Partial<typeof EMPTY_FORM>) {
    setForm({ ...EMPTY_FORM, ...data });
    setErrors([]);
    setServerError(null);
  }

  const isFormFilled = Object.values(form).some((v) => v.trim() !== "");

  function handleClear() {
    setForm(EMPTY_FORM);
    setErrors([]);
    setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setIsSubmitting(true);

    const listing: Listing = {
      ...form,
      id: uuidv4(),
      submittedAt: new Date().toISOString(),
    };

    try {
      const existingListings = getSavedListings();

      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing, existingListings }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors ?? []);
        setIsSubmitting(false);
        return;
      }

      saveListing(listing);
      sessionStorage.setItem(`listing_${listing.id}`, JSON.stringify(listing));
      router.push(`/review?id=${listing.id}`);
    } catch {
      setServerError("Something went wrong. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen mesh-bg text-white">
      {/* ── Nav ────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-7 sm:pt-12 pb-16 sm:pb-20">
        {/* Hero */}
        <div className="text-center mb-6 sm:mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-4"
            style={{
              background: "oklch(0.55 0.22 270 / 0.15)",
              border: "1px solid oklch(0.65 0.22 270 / 0.3)",
              color: "oklch(0.78 0.18 270)",
            }}
          >
            <Sparkles className="w-3 h-3" />
            Powered by Gemini AI
          </div>

          <h1
            className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 sm:mb-3"
            style={{
              background: "linear-gradient(135deg, #fff 40%, oklch(0.75 0.18 270) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Review Your Listing
          </h1>
          <p className="text-white/45 text-sm sm:text-base max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            Submit your product and our AI will audit it against marketplace policy — with you in
            control of every decision.
          </p>
        </div>

        {/* ── Sample Loaders ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <button
            type="button"
            onClick={() => loadDemo(DEMO_BAD)}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border"
            style={{
              background: "oklch(0.62 0.22 25 / 0.1)",
              borderColor: "oklch(0.62 0.22 25 / 0.25)",
              color: "oklch(0.78 0.2 25)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.62 0.22 25 / 0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.62 0.22 25 / 0.1)";
            }}
          >
            <Zap className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Violations Sample</span>
          </button>
          <button
            type="button"
            onClick={() => loadDemo(DEMO_GOOD)}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border"
            style={{
              background: "oklch(0.65 0.2 145 / 0.1)",
              borderColor: "oklch(0.65 0.2 145 / 0.25)",
              color: "oklch(0.78 0.18 145)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.65 0.2 145 / 0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.65 0.2 145 / 0.1)";
            }}
          >
            <Brain className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Compliant Sample</span>
          </button>
        </div>

        {/* Clear row — only visible when form has data */}
        {isFormFilled && (
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors py-1 px-2 rounded-lg hover:bg-red-500/8"
            >
              <RotateCcw className="w-3 h-3" />
              Clear all fields
            </button>
          </div>
        )}
        {!isFormFilled && <div className="mb-4" />}

        {/* ── Form Card ──────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="glass rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Section 1 header */}
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-violet-400">1</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/70 tracking-wide uppercase">
                Listing Details
              </span>
            </div>

            {/* Title */}
            <FieldWrap
              label="Product Title *"
              hint="5–80 characters. Be specific and accurate."
              error={getErr("title")}
            >
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder='e.g. "Sony WH-1000XM5 Wireless Headphones"'
                className={inputCls(!!getErr("title"))}
              />
            </FieldWrap>

            {/* Description */}
            <FieldWrap
              label="Description *"
              hint="50–2000 characters. Include condition, features, and key specifications."
              error={getErr("description")}
            >
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe your product — condition, features, what's included..."
                rows={4}
                className={`${inputCls(!!getErr("description"))} resize-none`}
              />
              <div className="flex justify-end -mt-0.5">
                <span
                  className={`text-xs ${
                    form.description.length > 1800 ? "text-amber-400" : "text-white/25"
                  }`}
                >
                  {form.description.length} / 2000
                </span>
              </div>
            </FieldWrap>

            {/* Category + Price — stacked on mobile, side-by-side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldWrap label="Category *" error={getErr("category")}>
                <select
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={inputCls(!!getErr("category"))}
                  style={{ appearance: "none" }}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {SUPPORTED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} style={{ background: "#0e1422" }}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FieldWrap>

              <FieldWrap label="Price (₹ INR) *" hint="Positive number only." error={getErr("price")}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="e.g. 2999"
                  className={inputCls(!!getErr("price"))}
                />
              </FieldWrap>
            </div>

            {/* Section 2 header */}
            <div className="flex items-center gap-2 pt-1 pb-2 border-b border-white/[0.06]">
              <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-violet-400">2</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/70 tracking-wide uppercase">
                Seller &amp; Metadata
              </span>
            </div>

            {/* Seller */}
            <FieldWrap label="Seller Name *" error={getErr("seller")}>
              <input
                type="text"
                value={form.seller}
                onChange={(e) => handleChange("seller", e.target.value)}
                placeholder="Your store or display name"
                className={inputCls(!!getErr("seller"))}
              />
            </FieldWrap>

            {/* Attributes */}
            <FieldWrap
              label="Attributes"
              hint='Format: "Color: Black, Size: M, Condition: New"'
              error={getErr("attributes")}
            >
              <input
                type="text"
                value={form.attributes}
                onChange={(e) => handleChange("attributes", e.target.value)}
                placeholder="Color: Black, Brand: Sony, Condition: New"
                className={inputCls(!!getErr("attributes"))}
              />
            </FieldWrap>

            {/* Tags */}
            <FieldWrap label="Tags" hint="Optional. Comma-separated keywords.">
              <input
                type="text"
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="wireless, headphones, audio"
                className={inputCls(false)}
              />
            </FieldWrap>
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div
              className="mt-4 rounded-xl border p-4"
              style={{
                background: "oklch(0.62 0.22 25 / 0.08)",
                borderColor: "oklch(0.62 0.22 25 / 0.25)",
              }}
            >
              <p className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Please fix these issues:
              </p>
              <ul className="space-y-1">
                {errors.map((err, i) => (
                  <li key={i} className="text-sm text-red-300/70 pl-2">
                    • {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div
              className="mt-4 rounded-xl border p-4 flex gap-3"
              style={{
                background: "oklch(0.62 0.22 25 / 0.08)",
                borderColor: "oklch(0.62 0.22 25 / 0.25)",
              }}
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-300/80">{serverError}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full mt-5 justify-center"
            style={{ height: "3rem", fontSize: "0.9375rem" }}
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Validating &amp; Sending to AI…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Policy Review
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-white/25 mt-3 leading-relaxed">
            Your listing is checked against marketplace policy in 2 stages — rules first, then AI.
          </p>
        </form>
      </main>
    </div>
  );
}
