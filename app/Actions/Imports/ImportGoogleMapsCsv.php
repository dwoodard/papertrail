<?php

namespace App\Actions\Imports;

use App\Models\EvidenceRecord;
use App\Models\GraphEdge;
use App\Models\GraphNode;
use App\Models\Project;
use App\Support\Normalizers\BusinessNameNormalizer;
use App\Support\Normalizers\CategoryNormalizer;
use App\Support\Normalizers\DomainNormalizer;
use App\Support\Normalizers\GoogleMapsCoordinateExtractor;
use App\Support\Normalizers\PhoneNormalizer;
use Illuminate\Support\Facades\DB;

class ImportGoogleMapsCsv
{
    public function __construct(
        private Project $project,
        private string $keyword,
    ) {}

    public function execute(array $rows): array
    {
        $stats = [
            'total' => 0,
            'created' => 0,
            'errors' => [],
        ];

        DB::beginTransaction();

        try {
            foreach ($rows as $index => $row) {
                try {
                    $this->importRow($row);
                    $stats['created']++;
                } catch (\Exception $e) {
                    $stats['errors'][] = "Row $index: {$e->getMessage()}";
                }

                $stats['total']++;
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            throw $e;
        }

        return $stats;
    }

    private function importRow(array $row): void
    {
        // 1. Save raw data as evidence
        $checksum = hash('sha256', json_encode($row));
        $evidence = EvidenceRecord::updateOrCreate(
            [
                'project_id' => $this->project->id,
                'checksum' => $checksum,
            ],
            [
                'source' => 'google_maps',
                'source_module' => 'maps_search',
                'source_url' => $row['maps_url'] ?? null,
                'captured_at' => $row['captured_at'] ?? now(),
                'raw_data' => $row,
            ]
        );

        // 2. Create search query node
        $searchQueryNode = $this->upsertNode(
            type: 'search_query',
            label: $this->keyword,
            key: $this->searchQueryKey(),
            source: 'google_maps',
            properties: []
        );

        // 3. Create business node
        $businessNode = $this->upsertNode(
            type: 'business',
            label: $row['name'] ?? 'Unknown',
            key: BusinessNameNormalizer::key(
                $row['name'] ?? null,
                $row['phone'] ?? null,
                $row['place_id'] ?? null
            ),
            source: 'google_maps',
            externalId: $row['place_id'] ?? null,
            properties: [
                'rating' => isset($row['rating']) ? (float) $row['rating'] : null,
                'review_count' => isset($row['reviews']) ? (int) $row['reviews'] : null,
                'status' => $row['status'] ?? null,
                'price_range' => $row['price_range'] ?? null,
                'hours' => $row['hours'] ?? null,
            ]
        );

        // 4. Create RETURNED_RESULT edge
        $this->upsertEdge(
            fromNodeId: $searchQueryNode->id,
            toNodeId: $businessNode->id,
            type: 'RETURNED_RESULT',
            evidenceId: $evidence->id
        );

        // 5. Create category node and edge
        if (! empty($row['category'])) {
            $categoryNode = $this->upsertNode(
                type: 'category',
                label: $row['category'],
                key: CategoryNormalizer::key($row['category']),
                source: 'google_maps',
                properties: []
            );

            $this->upsertEdge(
                fromNodeId: $businessNode->id,
                toNodeId: $categoryNode->id,
                type: 'CATEGORIZED_AS',
                evidenceId: $evidence->id
            );
        }

        // 6. Create phone node and edge
        if (! empty($row['phone'])) {
            $normalized = PhoneNormalizer::normalize($row['phone']);
            if ($normalized) {
                $phoneNode = $this->upsertNode(
                    type: 'phone',
                    label: PhoneNormalizer::format($normalized),
                    key: PhoneNormalizer::key($row['phone']),
                    source: 'google_maps',
                    externalId: $normalized,
                    properties: []
                );

                $this->upsertEdge(
                    fromNodeId: $businessNode->id,
                    toNodeId: $phoneNode->id,
                    type: 'HAS_PHONE',
                    evidenceId: $evidence->id
                );
            }
        }

        // 7. Create website and domain nodes
        if (! empty($row['website'])) {
            $websiteNode = $this->upsertNode(
                type: 'website',
                label: $row['website'],
                key: "website:{$row['website']}",
                source: 'google_maps',
                properties: []
            );

            $this->upsertEdge(
                fromNodeId: $businessNode->id,
                toNodeId: $websiteNode->id,
                type: 'HAS_WEBSITE',
                evidenceId: $evidence->id
            );

            // Extract and link domain
            $domain = DomainNormalizer::normalize($row['website']);
            if ($domain) {
                $domainNode = $this->upsertNode(
                    type: 'domain',
                    label: $domain,
                    key: DomainNormalizer::key($row['website']),
                    source: 'google_maps',
                    externalId: $domain,
                    properties: []
                );

                $this->upsertEdge(
                    fromNodeId: $businessNode->id,
                    toNodeId: $domainNode->id,
                    type: 'USES_DOMAIN',
                    evidenceId: $evidence->id
                );
            }
        }

        // 8. Create location nodes if we have address data
        if (! empty($row['street_address'])) {
            // Extract correct coordinates from Maps URL
            $coords = GoogleMapsCoordinateExtractor::validate(
                $row['maps_url'] ?? null,
                isset($row['latitude']) ? (float) $row['latitude'] : null,
                isset($row['longitude']) ? (float) $row['longitude'] : null
            );

            $addressKey = $this->addressKey($row);
            $addressNode = $this->upsertNode(
                type: 'address',
                label: $row['street_address'],
                key: $addressKey,
                source: 'google_maps',
                properties: [
                    'city' => $row['city'] ?? null,
                    'state' => $row['state'] ?? null,
                    'zip' => $row['zip'] ?? null,
                    'latitude' => $coords['latitude'] ?? null,
                    'longitude' => $coords['longitude'] ?? null,
                ]
            );

            $this->upsertEdge(
                fromNodeId: $businessNode->id,
                toNodeId: $addressNode->id,
                type: 'HAS_ADDRESS',
                evidenceId: $evidence->id
            );

            // Create city node
            if (! empty($row['city'])) {
                $cityNode = $this->upsertNode(
                    type: 'city',
                    label: $row['city'] . ($row['state'] ? ", {$row['state']}" : ''),
                    key: "city:{$row['city']}:{$row['state'] ?? ''}",
                    source: 'google_maps',
                    properties: []
                );

                $this->upsertEdge(
                    fromNodeId: $businessNode->id,
                    toNodeId: $cityNode->id,
                    type: 'LOCATED_IN',
                    evidenceId: $evidence->id
                );
            }
        }
    }

    private function upsertNode(
        string $type,
        string $label,
        ?string $key,
        string $source,
        ?string $externalId = null,
        array $properties = []
    ): GraphNode {
        return GraphNode::updateOrCreate(
            [
                'project_id' => $this->project->id,
                'type' => $type,
                'normalized_key' => $key,
            ],
            [
                'label' => $label,
                'source' => $source,
                'external_id' => $externalId,
                'properties' => $properties,
            ]
        );
    }

    private function upsertEdge(
        int $fromNodeId,
        int $toNodeId,
        string $type,
        int $evidenceId
    ): GraphEdge {
        return GraphEdge::updateOrCreate(
            [
                'project_id' => $this->project->id,
                'from_node_id' => $fromNodeId,
                'to_node_id' => $toNodeId,
                'type' => $type,
            ],
            [
                'evidence_id' => $evidenceId,
                'confidence' => 1.0,
            ]
        );
    }

    private function searchQueryKey(): string
    {
        $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $this->keyword));
        $slug = trim($slug, '-');

        return "search-query:$slug";
    }

    private function addressKey(array $row): string
    {
        return implode('|', [
            strtolower(trim($row['street_address'] ?? '')),
            strtolower(trim($row['city'] ?? '')),
            strtoupper(trim($row['state'] ?? '')),
            trim($row['zip'] ?? ''),
        ]);
    }
}
