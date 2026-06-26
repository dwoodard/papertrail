<?php

namespace Database\Seeders;

use App\Actions\Graph\PlaceToGraphImporter;
use App\Models\Place;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class GoogleMapsConcreteContractorsSeeder extends Seeder
{
    public function run(): void
    {
        // Create or get user
        $user = User::firstOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'password' => bcrypt('password'),
            ]
        );

        // Create project
        $project = Project::create([
            'user_id' => $user->id,
            'name' => 'Concrete Contractor Syracuse UT',
            'slug' => 'concrete-contractor-syracuse-ut',
            'goal' => 'Find and analyze concrete contractors and related businesses in Syracuse, Utah area',
            'status' => 'active',
        ]);

        // Read CSV file
        $csvPath = storage_path('seeders/concrete-contractors-syracuse-ut.csv');

        if (! file_exists($csvPath)) {
            $this->command->warn("CSV file not found at {$csvPath}");

            return;
        }

        $file = fopen($csvPath, 'r');
        if (! $file) {
            $this->command->error("Failed to open CSV file at {$csvPath}");

            return;
        }

        // Read header row
        $headers = fgetcsv($file, 0, ',', '"');
        if (! $headers) {
            fclose($file);
            $this->command->error('CSV file is empty');

            return;
        }

        $graphImporter = app(PlaceToGraphImporter::class);
        $count = 0;
        $skipped = 0;
        $index = 1;

        while (($values = fgetcsv($file, 0, ',', '"')) !== false) {
            try {
                // Skip empty rows
                if (! array_filter($values)) {
                    $index++;

                    continue;
                }

                // Build associative array from headers and values
                // Pad or trim values to match headers
                $values = array_pad($values, count($headers), null);
                $values = array_slice($values, 0, count($headers));
                $record = array_combine($headers, $values);
                // Map CSV columns to Place fields
                $placeData = $this->mapCsvToPlace($record, $project->id);

                if (! $placeData['place_id']) {
                    $skipped++;
                    $index++;

                    continue;
                }

                // Create or update place
                $place = Place::updateOrCreate(
                    [
                        'project_id' => $project->id,
                        'place_id' => $placeData['place_id'],
                    ],
                    $placeData
                );

                // Sync to graph
                $graphImporter->execute($place);

                $count++;
                $index++;
            } catch (\Exception $e) {
                $this->command->error('Row '.($index + 1).": {$e->getMessage()}");
                $index++;
            }
        }

        fclose($file);

        $this->command->info("Created $count places for project: {$project->name}");
        if ($skipped > 0) {
            $this->command->warn("Skipped $skipped rows (missing place_id)");
        }
    }

    /**
     * @param  array<string, string|null>  $record
     * @return array<string, mixed>
     */
    private function mapCsvToPlace(array $record, string $projectId): array
    {
        return [
            'place_id' => $record['Place ID'] ?? null,
            'name' => $record['Name'] ?? null,
            'category' => $record['Category'] ?? null,
            'street_address' => $record['Address'] ?? null,
            'city' => $this->extractCity($record['Address'] ?? ''),
            'state' => $record['State'] ?? null,
            'zip' => $record['Zip'] ?? null,
            'phone' => $record['Phone'] ?? null,
            'website' => $record['Website'] ?? null,
            'plus_code' => $record['Plus Code'] ?? null,
            'hours' => $this->normalizeHours($record['Hours'] ?? ''),
            'status' => $record['Status'] ?? null,
            'price_range' => $record['Price Range'] ?? null,
            'maps_url' => $record['Maps URL'] ?? null,
            'rating' => isset($record['Rating']) && $record['Rating'] !== 'N/A' ? (float) $record['Rating'] : null,
            'reviews_count' => isset($record['Reviews']) ? $this->extractReviewCount($record['Reviews']) : null,
            'is_sponsored' => false,
            'keyword' => $record['Keyword'] ?? 'concrete contractor',
            'source' => 'csv_import',
            'captured_at' => $this->parseTimestamp($record['Captured At'] ?? ''),
        ];
    }

    private function extractCity(string $address): ?string
    {
        if (empty($address) || $address === 'N/A') {
            return null;
        }

        // CSV address format: "Street, City, ST ZIP"
        $parts = array_map('trim', explode(',', $address));

        return count($parts) >= 2 ? $parts[count($parts) - 2] : null;
    }

    private function extractReviewCount(string $reviews): ?int
    {
        if (! $reviews || $reviews === 'N/A') {
            return null;
        }

        // Remove " reviews" or " review" suffix
        $cleaned = str_replace(['reviews', 'review'], '', strtolower($reviews));
        $count = (int) trim($cleaned);

        return $count > 0 ? $count : null;
    }

    private function normalizeHours(string $hours): ?string
    {
        if (! $hours || $hours === 'N/A') {
            return null;
        }

        // Remove noise and clean up
        $hours = str_replace(['Suggest new hours', 'Hours might differ'], '', $hours);
        $hours = str_replace('–', '-', $hours);
        $hours = preg_replace('/\s*\([^)]+\)\s*/', '', $hours);
        $hours = preg_replace('/\s+/', ' ', trim($hours));

        return empty($hours) ? null : $hours;
    }

    private function parseTimestamp(string $timestamp): string
    {
        if (! $timestamp || $timestamp === 'N/A') {
            return now()->toIso8601String();
        }

        try {
            return Carbon::parse($timestamp)->toIso8601String();
        } catch (\Exception) {
            return now()->toIso8601String();
        }
    }
}
