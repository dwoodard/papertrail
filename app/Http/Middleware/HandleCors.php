<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $origin = $request->header('Origin');

        // Allow all origins for chrome-extension
        if ($origin && (str_starts_with($origin, 'chrome-extension://') || str_starts_with($origin, 'moz-extension://'))) {
            $response->header('Access-Control-Allow-Origin', $origin);
            $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            $response->header('Access-Control-Allow-Credentials', 'true');

            return $response;
        }

        // Allow local development origins
        if ($origin && (str_contains($origin, 'localhost') || str_contains($origin, '127.0.0.1') || str_contains($origin, '.test'))) {
            $response->header('Access-Control-Allow-Origin', $origin);
            $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            $response->header('Access-Control-Allow-Credentials', 'true');

            return $response;
        }

        return $response;
    }
}
