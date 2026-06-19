<?php

namespace App\Support\Normalizers;

class CategoryNormalizer
{
    public static function normalize(?string $category): ?string
    {
        if (! $category) {
            return null;
        }

        $category = trim($category);

        if (empty($category)) {
            return null;
        }

        return $category;
    }

    public static function key(?string $category): ?string
    {
        $normalized = self::normalize($category);

        if (! $normalized) {
            return null;
        }

        // Create a slug-like key
        $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $normalized));
        $slug = trim($slug, '-');

        return "category:$slug";
    }
}
