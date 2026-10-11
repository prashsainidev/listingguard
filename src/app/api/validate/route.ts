// app/api/validate/route.ts — Deterministic Validation API
// POST /api/validate
// Validates listing fields WITHOUT using AI. Fast, rule-based checks only.

import { NextRequest, NextResponse } from "next/server";
import { validateListing } from "@/lib/validator";
import { Listing } from "@/lib/types";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const listing: Listing = body.listing;
    const existingListings: Listing[] = body.existingListings ?? [];

    if (!listing) {
      return NextResponse.json(
        { error: "No listing provided." },
        { status: 400 }
      );
    }

    logger.info("validate_request", { listingId: listing.id });

    const errors = validateListing(listing, existingListings);

    logger.info("validate_complete", {
      listingId: listing.id,
      errorsCount: errors.length,
    });

    return NextResponse.json({
      valid: errors.length === 0,
      errors,
    });
  } catch (error) {
    logger.error("validate_route_error", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Validation failed due to a server error." },
      { status: 500 }
    );
  }
}
