<?php

namespace App\Support\Normalizers;

class DomainNormalizer
{
    public static function normalize(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        // Remove protocol (http://, https://)
        $domain = preg_replace('~^https?://~i', '', $url);

        // Remove www. prefix
        $domain = preg_replace('~^www\.~i', '', $domain);

        // Remove trailing slash
        $domain = rtrim($domain, '/');

        // Remove query string and fragments
        $domain = preg_replace('~[?#].*$~', '', $domain);

        // Extract just the domain part (remove paths)
        $parts = explode('/', $domain);
        $domain = $parts[0];

        // Convert to lowercase
        $domain = strtolower(trim($domain));

        // Return null if empty
        if (empty($domain)) {
            return null;
        }

        return $domain;
    }

    public static function key(?string $url): ?string
    {
        $normalized = self::normalize($url);

        return $normalized ? "domain:$normalized" : null;
    }
}
