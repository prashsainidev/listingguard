// app/api/review/route.ts — AI Review API
// POST /api/review
// Calls Gemini AI to review a listing against the marketplace policy.
// Human must approve/reject each finding — AI cannot auto-decide.

import { NextRequest, NextResponse } from "next/server";
import { reviewListingWithAI } from "@/lib/gemini";
import { Listing } from "@/lib/types";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const listing: Listing = body.listing;

    if (!listing) {
      return NextResponse.json(
        { error: "No listing provided." },
        { status: 400 }
      );
    }

    logger.ai("review_request_received", { listingId: listing.id });

    const result = await reviewListingWithAI(listing);

    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    logger.error("review_route_error", { message });

    // Return a user-friendly error
    return NextResponse.json(
      { error: `AI review failed: ${message}` },
      { status: 500 }
    );
  }
}
