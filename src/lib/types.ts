// types.ts — All TypeScript interfaces for the project
// If you add a new type, add it here — never use `any`

export type Severity = "critical" | "warning" | "info";

export type DecisionStatus = "pending" | "approved" | "edited" | "rejected";

// A single product/service listing submitted by the seller
export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string; // string so form input works; validated as number
  attributes: string; // comma-separated key:value pairs
  seller: string;
  tags: string; // optional comma-separated tags
  submittedAt: string; // ISO date string
}

// A single issue found by AI or deterministic validator
export interface Finding {
  id: string;
  field: keyof Listing | "general";
  issue: string;
  severity: Severity;
  policySection: string; // e.g. "Section 2.1 — Title Requirements"
  suggestion: string; // AI's recommended fix
  decision: DecisionStatus;
  editedValue?: string; // if user edited the suggestion
}

// Full AI review result returned by /api/review
export interface ReviewResult {
  listingId: string;
  overallScore: number; // 0-100
  summary: string;
  findings: Finding[];
  reviewedAt: string; // ISO date string
}

// Validation error from deterministic checks
export interface ValidationError {
  field: keyof Listing;
  message: string;
}

// Saved review stored in localStorage
export interface SavedReview {
  listing: Listing;
  result: ReviewResult;
  finalStatus: "approved" | "rejected" | "partially-approved";
  savedAt: string; // ISO date string
}

// Supported product categories
export const SUPPORTED_CATEGORIES = [
  "Electronics",
  "Clothing & Apparel",
  "Home & Garden",
  "Books & Media",
  "Sports & Outdoors",
  "Health & Beauty",
  "Toys & Games",
  "Automotive",
  "Food & Beverages",
  "Services",
] as const;

export type Category = (typeof SUPPORTED_CATEGORIES)[number];
