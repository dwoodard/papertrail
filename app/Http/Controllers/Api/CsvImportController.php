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

        $projectId = (string) $validated['project_id'];
        $keyword = (string) $validated['keyword'];
        $project = Project::query()->whereKey($projectId)->firstOrFail();
        $this->authorize('update', $project);

        try {
            $path = $request->file('csv_file')?->getRealPath();
            if ($path === false || $path === null) {
                throw new \RuntimeException('Unable to read uploaded CSV file.');
            }

            $file = fopen($path, 'r');
            if ($file === false) {
                throw new \RuntimeException('Unable to open uploaded CSV file.');
            }

            $stats = [
                'total' => 0,
                'created' => 0,
                'updated' => 0,
                'errors' => [],
            ];

            $headers = fgetcsv($file);
            if ($headers === false) {
                throw new \RuntimeException('CSV file is empty.');
            }

            $index = 0;
            while (($values = fgetcsv($file)) !== false) {
                try {
                    $values = array_pad($values, count($headers), null);
                    $values = array_slice($values, 0, count($headers));
                    $record = array_combine($headers, $values);

                    // Map CSV columns to Place fields
                    $placeData = $this->mapCsvToPaceData($record, $keyword);

                    if (! $placeData['place_id']) {
                        $stats['errors'][] = 'Row '.($index + 2).': No place_id found';
                        $index++;

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

                $index++;
            }

            fclose($file);

            return response()->json([
                'success' => true,
                'project_id' => $project->id,
                'keyword' => $keyword,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            if (isset($file) && is_resource($file)) {
                fclose($file);
            }

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * @param  array<string, string|null>  $row
     * @return array<string, mixed>
     */
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
