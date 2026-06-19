<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\Project;
use App\Services\PlaceNormalizer;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use League\Csv\Reader;

class CsvImportController extends Controller
{
    use AuthorizesRequests;

    /**
     * Import a Google Maps CSV file.
     *
     * Accepts a CSV file with columns:
     * - name, category, phone, website, address (or street_address), city, state, zip,
     *   rating, reviews, status, price_range, hours, place_id, keyword, source, etc.
     *
     * Creates Place records, which automatically create graph nodes/edges.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'uuid', Rule::exists('projects', 'id')],
            'keyword' => ['required', 'string', 'max:255'],
            'csv_file' => ['required', 'file', 'mimes:csv,txt'],
        ]);

        $project = Project::findOrFail($validated['project_id']);
        $this->authorize('update', $project);

        try {
            $csv = Reader::createFromPath($request->file('csv_file')->getRealPath(), 'r');
            $csv->setHeaderOffset(0);

            $stats = [
                'total' => 0,
                'created' => 0,
                'updated' => 0,
                'errors' => [],
            ];

            foreach ($csv->getRecords() as $index => $record) {
                try {
                    // Map CSV columns to Place fields
                    $placeData = $this->mapCsvToPaceData($record, $validated['keyword']);

                    if (! $placeData['place_id']) {
                        $stats['errors'][] = 'Row '.($index + 2).': No place_id found';

                        continue;
                    }

                    // Normalize and create Place
                    $normalized = PlaceNormalizer::normalize($placeData);

                    $place = Place::updateOrCreate(
                        [
                            'project_id' => $project->id,
                            'place_id' => $normalized['place_id'],
                        ],
                        $normalized
                    );

                    if ($place->wasRecentlyCreated) {
                        $stats['created']++;
                    } else {
                        $stats['updated']++;
                    }

                    $stats['total']++;
                } catch (\Exception $e) {
                    $stats['errors'][] = 'Row '.($index + 2).": {$e->getMessage()}";
                }
            }

            return response()->json([
                'success' => true,
                'project_id' => $project->id,
                'keyword' => $validated['keyword'],
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    private function mapCsvToPaceData(array $row, string $keyword): array
    {
        return [
            'place_id' => $row['place_id'] ?? $row['placeId'] ?? null,
            'name' => $row['name'] ?? null,
            'category' => $row['category'] ?? null,
            'street_address' => $row['street_address'] ?? $row['address'] ?? null,
            'city' => $row['city'] ?? null,
            'state' => $row['state'] ?? null,
            'zip' => $row['zip'] ?? null,
            'phone' => $row['phone'] ?? null,
            'website' => $row['website'] ?? null,
            'plus_code' => $row['plus_code'] ?? null,
            'hours' => $row['hours'] ?? null,
            'status' => $row['status'] ?? null,
            'price_range' => $row['price_range'] ?? $row['priceRange'] ?? null,
            'maps_url' => $row['maps_url'] ?? $row['mapsUrl'] ?? null,
            'rating' => $row['rating'] ?? null,
            'reviews_count' => $row['reviews'] ?? $row['reviews_count'] ?? null,
            'is_sponsored' => $row['is_sponsored'] ?? $row['isSponsored'] ?? false,
            'keyword' => $keyword,
            'source' => $row['source'] ?? 'csv_import',
            'captured_at' => $row['captured_at'] ?? now()->toIso8601String(),
            'latitude' => $row['latitude'] ?? null,
            'longitude' => $row['longitude'] ?? null,
        ];
    }
}
