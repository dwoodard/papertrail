<?php

namespace App\Support\Normalizers;

class BusinessNameNormalizer
{
    public static function normalize(?string $name): ?string
    {
        if (! $name) {
            return null;
        }

        // Trim whitespace
        $name = trim($name);

        // Return null if empty
        if (empty($name)) {
            return null;
        }

        return $name;
    }

    public static function key(?string $name, ?string $phone = null, ?string $placeId = null): ?string
    {
        // Primary key: use Google Place ID if available
        if ($placeId) {
            return "business:google_maps:$placeId";
        }

        // Fallback: use name + phone
        if ($name && $phone) {
            $normalizedName = strtolower(preg_replace('/[^a-z0-9]/i', '', $name));
            $normalizedPhone = preg_replace('/\D/', '', $phone);

            return "business:$normalizedName:$normalizedPhone";
        }

        // Last resort: just name
        if ($name) {
            $normalizedName = strtolower(preg_replace('/[^a-z0-9]/i', '', $name));

            return "business:$normalizedName";
        }

        return null;
    }
}
