<?php

namespace App\Services;

use App\Models\Place;
use App\Models\Project;
use Illuminate\Support\Facades\DB;

class PlaceGraphSyncService
{
    private const GRAPH_NAME = 'papertrail_graph';

    public function syncPlace(Place $place): void
    {
        DB::beginTransaction();

        try {
            // Create Place node
            $this->createPlaceNode($place);

            // Extract and create contact point nodes
            if ($place->phone) {
                $this->createPhoneNode($place);
            }

            if ($this->hasAddress($place)) {
                $this->createAddressNode($place);
            }

            if ($place->website) {
                $this->createWebsiteNode($place);
            }

            // Link place to project
            if ($place->project_id) {
                $this->linkPlaceToProject($place);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * @param  array<int, Place>  $places
     */
    public function syncPlaces(array $places): void
    {
        foreach ($places as $place) {
            $this->syncPlace($place);
        }
    }

    private function createPlaceNode(Place $place): void
    {
        DB::select('
            SELECT * FROM cypher(?, $$
                CREATE (p:Place {
                    id: $1,
                    placeId: $2,
                    name: $3,
                    category: $4,
                    rating: $5,
                    reviewsCount: $6,
                    keyword: $7,
                    source: $8,
                    capturedAt: $9
                })
                RETURN p
            $$) AS (p agtype)
        ', [
            self::GRAPH_NAME,
            $place->id,
            $place->place_id,
            $place->name,
            $place->category,
            $place->rating,
            $place->reviews_count,
            $place->keyword,
            $place->source,
            $place->captured_at?->toIso8601String(),
        ]);
    }

    private function createPhoneNode(Place $place): void
    {
        // Normalize phone for deduplication
        $normalizedPhone = $this->normalizePhone($place->phone);

        DB::select('
            SELECT * FROM cypher(?, $$
                MATCH (p:Place {id: $1})
                MERGE (phone:Phone {number: $2})
                CREATE (p)-[:HAS_PHONE]->(phone)
                RETURN phone
            $$) AS (phone agtype)
        ', [
            self::GRAPH_NAME,
            $place->id,
            $normalizedPhone,
        ]);
    }

    private function createAddressNode(Place $place): void
    {
        // Create a composite address key for deduplication
        $addressKey = $this->getAddressKey($place);

        DB::select('
            SELECT * FROM cypher(?, $$
                MATCH (p:Place {id: $1})
                MERGE (addr:Address {
                    key: $2,
                    street: $3,
                    city: $4,
                    state: $5,
                    zip: $6
                })
                CREATE (p)-[:HAS_ADDRESS]->(addr)
                RETURN addr
            $$) AS (addr agtype)
        ', [
            self::GRAPH_NAME,
            $place->id,
            $addressKey,
            $place->street_address,
            $place->city,
            $place->state,
            $place->zip,
        ]);
    }

    private function createWebsiteNode(Place $place): void
    {
        // Normalize URL for deduplication
        $normalizedUrl = $this->normalizeUrl($place->website);

        DB::select('
            SELECT * FROM cypher(?, $$
                MATCH (p:Place {id: $1})
                MERGE (web:Website {url: $2})
                CREATE (p)-[:HAS_WEBSITE]->(web)
                RETURN web
            $$) AS (web agtype)
        ', [
            self::GRAPH_NAME,
            $place->id,
            $normalizedUrl,
        ]);
    }

    private function linkPlaceToProject(Place $place): void
    {
        DB::select('
            SELECT * FROM cypher(?, $$
                MATCH (p:Place {id: $1})
                MERGE (proj:Project {projectId: $2})
                CREATE (proj)-[:CONTAINS]->(p)
                RETURN proj
            $$) AS (proj agtype)
        ', [
            self::GRAPH_NAME,
            $place->id,
            $place->project_id,
        ]);
    }

    private function hasAddress(Place $place): bool
    {
        return $place->street_address || $place->city || $place->state || $place->zip;
    }

    private function normalizePhone(string $phone): string
    {
        // Remove all non-digit characters
        return preg_replace('/\D/', '', $phone) ?? '';
    }

    private function normalizeUrl(string $url): string
    {
        // Remove protocol and www for consistent matching
        $url = preg_replace('~^https?://~', '', strtolower($url)) ?? '';
        $url = preg_replace('~^www\.~', '', $url) ?? '';

        return rtrim($url, '/');
    }

    private function getAddressKey(Place $place): string
    {
        // Create composite key: street|city|state|zip
        return implode('|', [
            strtolower(trim($place->street_address ?? '')),
            strtolower(trim($place->city ?? '')),
            strtoupper(trim($place->state ?? '')),
            trim($place->zip ?? ''),
        ]);
    }
}
