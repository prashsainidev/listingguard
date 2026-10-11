// validator.test.ts — Tests for deterministic validation rules
// Run with: npm test
// Interview answer: "We wrote tests for the validation logic to ensure
// our rule-based checks work correctly every time."

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateListing } from "../lib/validator";
import { Listing } from "../lib/types";

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "test-id-1",
    title: "Sony WH-1000XM5 Wireless Headphones",
    description:
      "Premium noise-cancelling wireless headphones with 30-hour battery life, multipoint connection, and crystal-clear audio. Comes with carry case and cables.",
    category: "Electronics",
    price: "2999",
    attributes: "Color: Black, Condition: New",
    seller: "TechStore India",
    tags: "wireless, headphones, sony",
    submittedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("validateListing — Title (Section 2.1)", () => {
  it("fails when title is empty", () => {
    const errors = validateListing(makeListing({ title: "" }));
    assert.equal(errors.some((e) => e.field === "title"), true);
  });

  it("fails when title is under 5 characters", () => {
    const errors = validateListing(makeListing({ title: "Hi" }));
    assert.equal(errors.some((e) => e.field === "title" && e.message.includes("5 characters")), true);
  });

  it("fails when title is over 80 characters", () => {
    const longTitle = "A".repeat(81);
    const errors = validateListing(makeListing({ title: longTitle }));
    assert.equal(errors.some((e) => e.field === "title" && e.message.includes("80 characters")), true);
  });

  it("passes with a valid title between 5 and 80 characters", () => {
    const errors = validateListing(makeListing({ title: "Valid Product Title" }));
    assert.equal(errors.filter((e) => e.field === "title").length, 0);
  });

  it("fails when title contains contact info (phone)", () => {
    const errors = validateListing(makeListing({ title: "Call 9876543210 for deal" }));
    assert.equal(errors.some((e) => e.field === "title"), true);
  });
});

describe("validateListing — Price (Section 2.3)", () => {
  it("fails when price is empty", () => {
    const errors = validateListing(makeListing({ price: "" }));
    assert.equal(errors.some((e) => e.field === "price"), true);
  });

  it("fails when price is not a number", () => {
    const errors = validateListing(makeListing({ price: "abc" }));
    assert.equal(errors.some((e) => e.field === "price" && e.message.includes("valid number")), true);
  });

  it("fails when price is zero", () => {
    const errors = validateListing(makeListing({ price: "0" }));
    assert.equal(errors.some((e) => e.field === "price" && e.message.includes("positive")), true);
  });

  it("fails when price is negative", () => {
    const errors = validateListing(makeListing({ price: "-100" }));
    assert.equal(errors.some((e) => e.field === "price" && e.message.includes("positive")), true);
  });

  it("passes with a valid positive price", () => {
    const errors = validateListing(makeListing({ price: "1999.99" }));
    assert.equal(errors.filter((e) => e.field === "price").length, 0);
  });
});

describe("validateListing — Description (Section 2.2)", () => {
  it("fails when description is under 50 characters", () => {
    const errors = validateListing(makeListing({ description: "Short desc." }));
    assert.equal(errors.some((e) => e.field === "description"), true);
  });

  it("fails when description contains a URL", () => {
    const errors = validateListing(
      makeListing({ description: "Check our website at https://store.com for more details about this product." })
    );
    assert.equal(errors.some((e) => e.field === "description"), true);
  });

  it("passes with a valid description", () => {
    const errors = validateListing(
      makeListing({
        description: "This is a perfectly valid description that is long enough to meet the minimum character requirement.",
      })
    );
    assert.equal(errors.filter((e) => e.field === "description").length, 0);
  });
});

describe("validateListing — Duplicate Detection (Section 4.2)", () => {
  it("detects duplicate listing by same seller", () => {
    const existing: Listing[] = [
      makeListing({ id: "existing-1", title: "Sony WH-1000XM5 Wireless Headphones", seller: "TechStore India" }),
    ];
    const errors = validateListing(makeListing({ id: "new-1" }), existing);
    assert.equal(errors.some((e) => e.message.includes("Duplicate")), true);
  });

  it("allows same title from different seller", () => {
    const existing: Listing[] = [
      makeListing({ id: "existing-1", title: "Sony WH-1000XM5 Wireless Headphones", seller: "OtherStore" }),
    ];
    const errors = validateListing(makeListing({ id: "new-1", seller: "TechStore India" }), existing);
    assert.equal(errors.some((e) => e.message.includes("Duplicate")), false);
  });
});

describe("validateListing — Full Valid Listing", () => {
  it("returns no errors for a perfectly valid listing", () => {
    const errors = validateListing(makeListing());
    assert.equal(errors.length, 0);
  });
});
