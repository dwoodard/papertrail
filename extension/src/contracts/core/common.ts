/**
 * Status of any claim in the system — a relationship, a suggestion, or an
 * AI-derived interpretation. Per the product spec, facts are `confirmed`,
 * anything AI generates starts as `suggested`, and the user moves claims
 * through `reviewed` / `rejected`.
 */
export type ClaimStatus = 'confirmed' | 'suggested' | 'reviewed' | 'rejected'

/** Loose 0..1 confidence score attached to AI-derived claims. */
export type Confidence = number

/** Coarse confidence label, useful for badges in the UI. */
export type ConfidenceLabel = 'low' | 'medium' | 'high'

/** ISO-8601 timestamp string. */
export type IsoDateTime = string
