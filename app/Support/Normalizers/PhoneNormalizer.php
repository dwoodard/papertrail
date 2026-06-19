<?php

namespace App\Support\Normalizers;

class PhoneNormalizer
{
    public static function normalize(?string $phone): ?string
    {
        if (! $phone) {
            return null;
        }

        // Remove all non-digit characters
        $digits = preg_replace('/\D/', '', $phone);

        // Return null if empty after cleaning
        if (empty($digits)) {
            return null;
        }

        return $digits;
    }

    public static function format(string $normalized): string
    {
        // Format as (XXX) XXX-XXXX if 10 digits
        if (strlen($normalized) === 10) {
            return sprintf(
                '(%s) %s-%s',
                substr($normalized, 0, 3),
                substr($normalized, 3, 3),
                substr($normalized, 6, 4)
            );
        }

        // Return as-is for other lengths
        return $normalized;
    }

    public static function key(?string $phone): ?string
    {
        $normalized = self::normalize($phone);

        return $normalized ? "phone:$normalized" : null;
    }
}
