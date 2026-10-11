// validator.ts — Deterministic (rule-based) validation
// NO AI used here. Pure logic checks. Fast and predictable.
// Interview answer: "Deterministic means same input always gives same output.
// We check rules without AI because it's faster and cheaper."

import { Listing, ValidationError, SUPPORTED_CATEGORIES } from "./types";

export function validateListing(
  listing: Listing,
  existingListings: Listing[] = []
): ValidationError[] {
  const errors: ValidationError[] = [];

  // --- TITLE CHECKS (Section 2.1) ---
  if (!listing.title || listing.title.trim().length === 0) {
    errors.push({ field: "title", message: "Title is required." });
  } else if (listing.title.trim().length < 5) {
    errors.push({
      field: "title",
      message: "Title must be at least 5 characters (Section 2.1).",
    });
  } else if (listing.title.trim().length > 80) {
    errors.push({
      field: "title",
      message: "Title must not exceed 80 characters (Section 2.1).",
    });
  }

  // Check for ALL CAPS (more than 5 consecutive capital words)
  const words = listing.title.split(" ");
  const capsWords = words.filter((w) => w === w.toUpperCase() && w.length > 1);
  if (capsWords.length > 5) {
    errors.push({
      field: "title",
      message: "Title must not be written in ALL CAPS (Section 2.1).",
    });
  }

  // Check for contact info in title
  if (
    /\d{10}/.test(listing.title) ||
    /@/.test(listing.title) ||
    /http/.test(listing.title)
  ) {
    errors.push({
      field: "title",
      message: "Title must not contain contact information (Section 2.1).",
    });
  }

  // --- DESCRIPTION CHECKS (Section 2.2) ---
  if (!listing.description || listing.description.trim().length === 0) {
    errors.push({ field: "description", message: "Description is required." });
  } else if (listing.description.trim().length < 50) {
    errors.push({
      field: "description",
      message: "Description must be at least 50 characters (Section 2.2).",
    });
  } else if (listing.description.trim().length > 2000) {
    errors.push({
      field: "description",
      message: "Description must not exceed 2000 characters (Section 2.2).",
    });
  }

  // Check for contact info in description
  if (
    /\d{10}/.test(listing.description) ||
    /http[s]?:\/\//.test(listing.description) ||
    /@[a-zA-Z]/.test(listing.description)
  ) {
    errors.push({
      field: "description",
      message:
        "Description must not contain URLs or contact information (Section 2.2).",
    });
  }

  // --- PRICE CHECKS (Section 2.3) ---
  if (!listing.price || listing.price.trim().length === 0) {
    errors.push({ field: "price", message: "Price is required." });
  } else {
    const priceNum = parseFloat(listing.price);
    if (isNaN(priceNum)) {
      errors.push({
        field: "price",
        message: "Price must be a valid number (Section 2.3).",
      });
    } else if (priceNum <= 0) {
      errors.push({
        field: "price",
        message: "Price must be a positive number greater than zero (Section 2.3).",
      });
    }
  }

  // --- CATEGORY CHECKS (Section 2.4) ---
  if (!listing.category || listing.category.trim().length === 0) {
    errors.push({ field: "category", message: "Category is required." });
  } else if (
    !SUPPORTED_CATEGORIES.includes(
      listing.category as (typeof SUPPORTED_CATEGORIES)[number]
    )
  ) {
    errors.push({
      field: "category",
      message: `Category must be one of the supported categories (Section 2.4).`,
    });
  }

  // --- SELLER CHECKS ---
  if (!listing.seller || listing.seller.trim().length === 0) {
    errors.push({ field: "seller", message: "Seller name is required." });
  }

  // --- DUPLICATE DETECTION (Section 4.2) ---
  const duplicate = existingListings.find(
    (existing) =>
      existing.id !== listing.id &&
      existing.title.toLowerCase().trim() ===
        listing.title.toLowerCase().trim() &&
      existing.seller.toLowerCase().trim() ===
        listing.seller.toLowerCase().trim()
  );
  if (duplicate) {
    errors.push({
      field: "title",
      message:
        "A listing with this title already exists from the same seller. Duplicate listings are not allowed (Section 4.2).",
    });
  }

  return errors;
}

// Check if a listing passes all validation (used in API route)
export function isValid(listing: Listing, existingListings: Listing[] = []): boolean {
  return validateListing(listing, existingListings).length === 0;
}
