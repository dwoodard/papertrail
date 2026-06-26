<?php

namespace App\Services;

class PlaceNormalizer
{
    /**
     * @param  array<string, mixed>  $place
     * @return array<string, mixed>
     */
    public static function normalize(array $place): array
    {
        return [
            'place_id' => self::normalizeString($place['placeId'] ?? null),
            'name' => self::normalizeString($place['name'] ?? null),
            'category' => self::normalizeString($place['category'] ?? null),
            'street_address' => self::normalizeAddress($place['address'] ?? null)['street'] ?? null,
            'city' => self::normalizeAddress($place['address'] ?? null)['city'] ?? null,
            'state' => self::normalizeAddress($place['address'] ?? null)['state'] ?? null,
            'zip' => self::normalizeAddress($place['address'] ?? null)['zip'] ?? null,
            'phone' => self::normalizeString($place['phone'] ?? null),
            'website' => self::normalizeString($place['website'] ?? null),
            'plus_code' => self::normalizeString($place['plusCode'] ?? null),
            'hours' => self::normalizeHours($place['hours'] ?? null),
            'status' => self::normalizeString($place['status'] ?? null),
            'price_range' => self::normalizeString($place['priceRange'] ?? null),
            'maps_url' => self::normalizeString($place['mapsUrl'] ?? null),
            'rating' => self::normalizeRating($place['rating'] ?? null),
            'reviews_count' => self::normalizeReviewsCount($place['reviews'] ?? null),
            'is_sponsored' => (bool) ($place['isSponsored'] ?? false),
            'keyword' => self::normalizeString($place['keyword'] ?? null),
            'source' => self::normalizeString($place['source'] ?? null),
            'captured_at' => self::normalizeCapturedAt($place['capturedAt'] ?? null),
        ];
    }

    private static function normalizeString(?string $value): ?string
    {
        if ($value === null || $value === 'N/A') {
            return null;
        }
        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    private static function normalizeHours(?string $value): ?string
    {
        if ($value === null || $value === 'N/A') {
            return null;
        }

        $hours = trim($value);
        if ($hours === '') {
            return null;
        }

        // Strip noise tokens
        $hours = str_replace(['Suggest new hours', 'Hours might differ'], '', $hours);

        // Normalize em-dash to hyphen
        $hours = str_replace('–', '-', $hours);

        // Strip holiday annotations like "(Juneteenth)"
        $hours = preg_replace('/\s*\([^)]+\)\s*/', '', $hours);

        // Collapse multiple whitespace to single space
        $hours = preg_replace('/\s+/', ' ', $hours);

        $cleaned = trim($hours);

        return $cleaned === '' ? null : $cleaned;
    }

    /**
     * @return array{street: string|null, city: string|null, state: string|null, zip: string|null}
     */
    private static function normalizeAddress(?string $address): array
    {
        $result = ['street' => null, 'city' => null, 'state' => null, 'zip' => null];

        if ($address === null || $address === 'N/A') {
            return $result;
        }

        $addr = trim($address);
        if ($addr === '') {
            return $result;
        }

        // Expected format: "Street, City, ST ZIP"
        // Split by comma first
        $parts = array_map('trim', explode(',', $addr));

        if (count($parts) < 2) {
            // Can't parse, store whole thing as street
            $result['street'] = $addr;

            return $result;
        }

        // Last part should be "ST ZIP" or similar
        $lastPart = array_pop($parts);
        // Second-to-last part should be city
        $cityPart = array_pop($parts);
        // Remaining parts are street
        $streetPart = implode(', ', $parts);

        $result['street'] = $streetPart ?: null;
        $result['city'] = $cityPart ?: null;

        // Parse "ST ZIP" — assume format like "UT 84015" (state code + space + zip)
        $stateZip = explode(' ', trim($lastPart), 2);
        if (count($stateZip) === 2) {
            $result['state'] = strtoupper(trim($stateZip[0]));
            $result['zip'] = trim($stateZip[1]);
        } elseif (strlen($stateZip[0]) === 2) {
            // Just state code, no zip
            $result['state'] = strtoupper($stateZip[0]);
        }

        return $result;
    }

    private static function normalizeRating(mixed $value): ?float
    {
        if ($value === null || $value === 'N/A') {
            return null;
        }

        $float = floatval($value);

        return $float > 0 ? $float : null;
    }

    private static function normalizeReviewsCount(mixed $value): ?int
    {
        if ($value === null || $value === 'N/A') {
            return null;
        }

        // Strip " reviews" suffix
        $cleaned = str_replace(['reviews', 'review'], '', (string) $value);
        $int = intval(trim($cleaned));

        return $int > 0 ? $int : null;
    }

    private static function normalizeCapturedAt(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        // If already ISO string, return as-is
        if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}/', $value)) {
            return $value;
        }

        return null;
    }
}
