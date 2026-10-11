// storage.ts — localStorage helpers for data persistence
// Interview answer: "We use localStorage as our data persistence layer.
// It stores review history in the browser. For production, this would
// be replaced with a real database like PostgreSQL or MongoDB."

import { Listing, SavedReview } from "./types";

const HISTORY_KEY = "aggroso_review_history";
const LISTINGS_KEY = "aggroso_listings";

// --- REVIEW HISTORY ---

export function getSavedReviews(): SavedReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReview(review: SavedReview): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedReviews();
    // Replace if same listingId already exists, else prepend
    const filtered = existing.filter(
      (r) => r.listing.id !== review.listing.id
    );
    const updated = [review, ...filtered];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save review:", e);
  }
}

export function deleteReview(listingId: string): void {
  if (typeof window === "undefined") return;
  const existing = getSavedReviews();
  const updated = existing.filter((r) => r.listing.id !== listingId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function clearAllReviews(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

// --- LISTINGS (for duplicate detection) ---

export function getSavedListings(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LISTINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveListing(listing: Listing): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedListings();
    const filtered = existing.filter((l) => l.id !== listing.id);
    localStorage.setItem(LISTINGS_KEY, JSON.stringify([listing, ...filtered]));
  } catch (e) {
    console.error("Failed to save listing:", e);
  }
}
