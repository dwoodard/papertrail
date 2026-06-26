<?php

namespace App\Support\Normalizers;

class GoogleMapsCoordinateExtractor
{
    /**
     * Extract actual coordinates from Google Maps URL.
     *
     * Maps URL format includes coordinates in two places:
     * - Viewport: @lat,lng,zoom
     * - Actual place: !3d{lat}!4d{lng}
     *
     * We want the actual place coordinates (!3d and !4d), not the viewport.
     *
     * @return array{latitude: float, longitude: float}|null
     */
    public static function fromUrl(?string $mapsUrl): ?array
    {
        if (! $mapsUrl) {
            return null;
        }

        // Look for !3d{latitude}!4d{longitude} pattern
        if (preg_match('/!3d([-\d.]+)!4d([-\d.]+)/', $mapsUrl, $matches)) {
            $lat = (float) $matches[1];
            $lng = (float) $matches[2];

            // Validate coordinates are in reasonable range
            if ($lat >= -90 && $lat <= 90 && $lng >= -180 && $lng <= 180) {
                return [
                    'latitude' => $lat,
                    'longitude' => $lng,
                ];
            }
        }

        return null;
    }

    /**
     * Extract the place ID from Google Maps URL.
     *
     * Example: ...maps/place/.../@-111.123,40.456,15z/data=!4m6!3m5!1s0x875314a63...
     */
    public static function getPlaceId(?string $mapsUrl): ?string
    {
        if (! $mapsUrl) {
            return null;
        }

        // Look for data=!4m... pattern which contains place info
        // The place ID is typically in the URL as a hex string
        if (preg_match('/!1s([a-z0-9]+)/i', $mapsUrl, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Validate and return corrected coordinates.
     *
     * Falls back to provided lat/lng if URL extraction fails.
     *
     * @return array{latitude: float, longitude: float}|null
     */
    public static function validate(?string $mapsUrl, ?float $fallbackLat, ?float $fallbackLng): ?array
    {
        // Try to extract from URL first (more reliable)
        $coords = self::fromUrl($mapsUrl);
        if ($coords) {
            return $coords;
        }

        // Fall back to provided coordinates if valid
        if ($fallbackLat !== null && $fallbackLng !== null) {
            if ($fallbackLat >= -90 && $fallbackLat <= 90 && $fallbackLng >= -180 && $fallbackLng <= 180) {
                return [
                    'latitude' => $fallbackLat,
                    'longitude' => $fallbackLng,
                ];
            }
        }

        return null;
    }
}
