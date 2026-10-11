// policy.ts — Hardcoded Marketplace Policy Document
// This is the policy that the AI reads and cites in its findings.
// In a real app, this would come from a database or CMS.

export const MARKETPLACE_POLICY = `
AGGROSO MARKETPLACE — LISTING QUALITY & BRAND CONTENT POLICY
Version 1.0 | Effective: 2026-01-01

=============================================================

SECTION 1 — PROHIBITED ITEMS & CONTENT

Section 1.1 — Prohibited Items
The following items and services are strictly prohibited on the marketplace:
- Weapons, firearms, ammunition, or related accessories
- Illegal drugs, controlled substances, or drug paraphernalia
- Counterfeit, replica, or knockoff branded goods
- Stolen property or items without proof of ownership
- Adult content, sexually explicit material
- Hate speech, discriminatory content, or items promoting violence
- Personal data, hacked accounts, or privacy-violating content
Violation: Immediate listing removal and possible account suspension.

Section 1.2 — Restricted Categories
The following require prior written approval from Aggroso:
- Medical devices and pharmaceuticals
- Financial products and investment services
- Alcohol and tobacco products
Violation: Listing will be held for review.

=============================================================

SECTION 2 — LISTING CONTENT REQUIREMENTS

Section 2.1 — Title Requirements
- Minimum length: 5 characters
- Maximum length: 80 characters
- Must accurately describe the product or service being offered
- Must not be written in ALL CAPS (more than 5 consecutive capital words)
- Must not contain contact information (phone numbers, emails, URLs)
- Must not contain special promotional symbols like !!!, ???, $$$
- Must not be generic (e.g., "Great Item", "For Sale", "Check this out")
- Must include the primary product name or service type
Violation severity: Warning for minor issues, Critical for misleading titles.

Section 2.2 — Description Requirements
- Minimum length: 50 characters
- Maximum length: 2000 characters
- Must accurately describe what is being sold — no bait-and-switch
- Must not contain external links, URLs, or social media handles
- Must not contain personal contact information (phone, email, address)
- Must not contain HTML tags or markdown formatting
- Must clearly state key product attributes (size, colour, condition, etc.)
- Must not copy descriptions from other listings verbatim (duplicate content)
Violation severity: Warning for length issues, Critical for contact info or deception.

Section 2.3 — Pricing Rules
- Price must be a positive numeric value (e.g., 99.99)
- Price must not be zero or negative
- Price must reflect the actual item — no bait pricing
- Hidden fees or mandatory add-ons not listed in the price are prohibited
- Price must be in the supported currency (INR)
Violation severity: Critical for invalid or zero price.

Section 2.4 — Category Accuracy
- Listings must be placed in the most relevant category
- Miscategorised listings reduce discoverability and may be moved or removed
- Supported categories: Electronics, Clothing & Apparel, Home & Garden,
  Books & Media, Sports & Outdoors, Health & Beauty, Toys & Games,
  Automotive, Food & Beverages, Services
Violation severity: Warning.

=============================================================

SECTION 3 — BRAND SAFETY & CONTENT QUALITY

Section 3.1 — Brand Safety
- Content must not be offensive, hateful, or discriminatory
- Listings must not mock, defame, or impersonate other brands or sellers
- Must not use trademarked brand names without authorisation
  (e.g., "Apple iPhone" when selling a generic product)
- Images and text must match — mismatched listings are prohibited
Violation severity: Critical.

Section 3.2 — Unverifiable & Misleading Claims
The following superlative claims are only allowed with verifiable proof:
- "Best in class", "Number 1", "Top-rated" — requires documented evidence
- "Cheapest", "Lowest price" — requires market comparison data
- "Guaranteed", "100% success" — requires legal backing or refund policy
- "Original", "Authentic", "Genuine" — requires brand authorisation letter
Making unverifiable claims misleads buyers and damages marketplace trust.
Violation severity: Warning for unsubstantiated claims, Critical for deliberate deception.

Section 3.3 — Writing Quality Standards
- Listings must be written in clear, professional language
- Excessive abbreviations, slang, or text-speak reduce buyer confidence
- Spelling and grammatical errors should be minimised
- Attribute lists should use consistent formatting (e.g., "Color: Red, Size: M")
Violation severity: Info (improvement suggestion only).

=============================================================

SECTION 4 — SELLER RESPONSIBILITIES

Section 4.1 — Accuracy & Honesty
Sellers are responsible for the accuracy of their listing content.
False, misleading, or incomplete listings may result in:
- Listing removal
- Buyer refund obligations
- Account suspension

Section 4.2 — Duplicate Listings
Creating duplicate listings for the same item to gain visibility is prohibited.
Violation severity: Warning on first offence, Critical on repeat.

=============================================================

END OF POLICY DOCUMENT
`;

export const POLICY_SUMMARY_FOR_PROMPT = `
You are reviewing a marketplace listing against the Aggroso Marketplace Policy.

Key rules to check:
- Title: 5-80 chars, not ALL CAPS, no contact info, not generic, must describe the product
- Description: 50-2000 chars, no URLs/contact info/HTML, must be accurate
- Price: Must be a positive number, no hidden fees
- Category: Must be one of the supported categories
- No prohibited items (weapons, drugs, counterfeit goods, adult content)
- No unverifiable superlative claims without proof ("best", "cheapest", "#1", "guaranteed")
- No brand name misuse or impersonation
- No duplicate listing content

For each issue found, you MUST cite the exact policy section (e.g., "Section 2.1 — Title Requirements").
`;
