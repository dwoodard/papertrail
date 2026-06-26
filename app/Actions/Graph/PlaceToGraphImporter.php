<?php

namespace App\Actions\Graph;

use App\Models\EvidenceRecord;
use App\Models\GraphEdge;
use App\Models\GraphNode;
use App\Models\Place;
use App\Support\Normalizers\BusinessNameNormalizer;
use App\Support\Normalizers\CategoryNormalizer;
use App\Support\Normalizers\DomainNormalizer;
use App\Support\Normalizers\GoogleMapsCoordinateExtractor;
use App\Support\Normalizers\PhoneNormalizer;
use Illuminate\Support\Facades\DB;

class PlaceToGraphImporter
{
    private ?string $currentProjectId = null;

    /**
     * @return array{success: bool, nodes?: int, edges?: int, error?: string}
     */
    public function execute(Place $place): array
    {
        $this->currentProjectId = $place->project_id;
        $nodes = [];
        $edges = [];

        DB::beginTransaction();

        try {
            // 1. Create or update evidence record
            $evidence = $this->createEvidenceRecord($place);

            // 2. Create business node
            $businessNode = $this->upsertNode(
                type: 'business',
                label: $place->name,
                key: BusinessNameNormalizer::key($place->name, $place->phone, $place->place_id),
                source: 'google_maps',
                externalId: $place->place_id,
                properties: [
                    'rating' => $place->rating,
                    'review_count' => $place->reviews_count,
                    'status' => $place->status,
                    'price_range' => $place->price_range,
                    'hours' => $place->hours,
                    'keyword' => $place->keyword,
                ]
            );
            $nodes['business'] = $businessNode;

            // 3. Create category node and edge
            if ($place->category) {
                $categoryNode = $this->upsertNode(
                    type: 'category',
                    label: $place->category,
                    key: CategoryNormalizer::key($place->category),
                    source: 'google_maps'
                );
                $nodes['category'] = $categoryNode;

                $edges['categorized_as'] = $this->upsertEdge(
                    fromNodeId: $businessNode->id,
                    toNodeId: $categoryNode->id,
                    type: 'CATEGORIZED_AS',
                    evidenceId: $evidence->id
                );
            }

            // 4. Create phone node and edge
            if ($place->phone) {
                $normalized = PhoneNormalizer::normalize($place->phone);
                if ($normalized) {
                    $phoneNode = $this->upsertNode(
                        type: 'phone',
                        label: PhoneNormalizer::format($normalized),
                        key: PhoneNormalizer::key($place->phone),
                        source: 'google_maps',
                        externalId: $normalized
                    );
                    $nodes['phone'] = $phoneNode;

                    $edges['has_phone'] = $this->upsertEdge(
                        fromNodeId: $businessNode->id,
                        toNodeId: $phoneNode->id,
                        type: 'HAS_PHONE',
                        evidenceId: $evidence->id
                    );
                }
            }

            // 5. Create website and domain nodes
            if ($place->website) {
                $websiteNode = $this->upsertNode(
                    type: 'website',
                    label: $place->website,
                    key: "website:{$place->website}",
                    source: 'google_maps'
                );
                $nodes['website'] = $websiteNode;

                $edges['has_website'] = $this->upsertEdge(
                    fromNodeId: $businessNode->id,
                    toNodeId: $websiteNode->id,
                    type: 'HAS_WEBSITE',
                    evidenceId: $evidence->id
                );

                // Extract domain
                $domain = DomainNormalizer::normalize($place->website);
                if ($domain) {
                    $domainNode = $this->upsertNode(
                        type: 'domain',
                        label: $domain,
                        key: DomainNormalizer::key($place->website),
                        source: 'google_maps',
                        externalId: $domain
                    );
                    $nodes['domain'] = $domainNode;

                    $edges['uses_domain'] = $this->upsertEdge(
                        fromNodeId: $businessNode->id,
                        toNodeId: $domainNode->id,
                        type: 'USES_DOMAIN',
                        evidenceId: $evidence->id
                    );
                }
            }

            // 6. Create address and city nodes
            if ($place->street_address) {
                $coords = GoogleMapsCoordinateExtractor::fromUrl($place->maps_url);

                $addressKey = implode('|', [
                    strtolower(trim($place->street_address ?? '')),
                    strtolower(trim($place->city ?? '')),
                    strtoupper(trim($place->state ?? '')),
                    trim($place->zip ?? ''),
                ]);

                $addressNode = $this->upsertNode(
                    type: 'address',
                    label: $place->street_address,
                    key: $addressKey,
                    source: 'google_maps',
                    properties: [
                        'city' => $place->city,
                        'state' => $place->state,
                        'zip' => $place->zip,
                        'latitude' => $coords['latitude'] ?? null,
                        'longitude' => $coords['longitude'] ?? null,
                    ]
                );
                $nodes['address'] = $addressNode;

                $edges['has_address'] = $this->upsertEdge(
                    fromNodeId: $businessNode->id,
                    toNodeId: $addressNode->id,
                    type: 'HAS_ADDRESS',
                    evidenceId: $evidence->id
                );

                // City node
                if ($place->city) {
                    $cityState = $place->state ? ":{$place->state}" : '';
                    $cityNode = $this->upsertNode(
                        type: 'city',
                        label: $place->city.($place->state ? ", {$place->state}" : ''),
                        key: "city:{$place->city}".$cityState,
                        source: 'google_maps'
                    );
                    $nodes['city'] = $cityNode;

                    $edges['located_in'] = $this->upsertEdge(
                        fromNodeId: $businessNode->id,
                        toNodeId: $cityNode->id,
                        type: 'LOCATED_IN',
                        evidenceId: $evidence->id
                    );
                }
            }

            DB::commit();

            return [
                'success' => true,
                'nodes' => count($nodes),
                'edges' => count($edges),
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    private function createEvidenceRecord(Place $place): EvidenceRecord
    {
        $rawData = [
            'place_id' => $place->place_id,
            'name' => $place->name,
            'category' => $place->category,
            'phone' => $place->phone,
            'website' => $place->website,
            'street_address' => $place->street_address,
            'city' => $place->city,
            'state' => $place->state,
            'zip' => $place->zip,
            'rating' => $place->rating,
            'reviews_count' => $place->reviews_count,
            'status' => $place->status,
            'price_range' => $place->price_range,
            'hours' => $place->hours,
            'keyword' => $place->keyword,
            'source' => $place->source,
            'maps_url' => $place->maps_url,
        ];

        $encodedRawData = json_encode($rawData, JSON_THROW_ON_ERROR);
        $checksum = hash('sha256', $encodedRawData);

        return EvidenceRecord::updateOrCreate(
            [
                'project_id' => $place->project_id,
                'checksum' => $checksum,
            ],
            [
                'source' => 'google_maps',
                'source_module' => 'place_sync',
                'source_url' => $place->maps_url,
                'captured_at' => $place->captured_at,
                'raw_data' => $rawData,
            ]
        );
    }

    /**
     * @param  array<string, mixed>  $properties
     */
    private function upsertNode(
        string $type,
        string $label,
        ?string $key,
        string $source,
        ?string $externalId = null,
        array $properties = []
    ): GraphNode {
        // This will be called from execute() which has access to $place->project_id
        $projectId = $this->currentProjectId;

        return GraphNode::updateOrCreate(
            [
                'project_id' => $projectId,
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
                'project_id' => $this->currentProjectId,
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
}
