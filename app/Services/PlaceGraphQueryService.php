<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use stdClass;

class PlaceGraphQueryService
{
    private const GRAPH_NAME = 'papertrail_graph';

    /**
     * Find all places in a project that share the same phone number.
     * Useful for identifying multiple businesses under same decision-maker.
     *
     * @return array<int, array<string, mixed>>
     */
    public function findSharedPhoneConnections(string $projectId): array
    {
        $results = DB::select("
            SELECT
                p1_data->>'name' as business_1,
                phone_data->>'number' as shared_phone,
                p2_data->>'name' as business_2,
                p1_data->>'rating' as business_1_rating,
                p2_data->>'rating' as business_2_rating
            FROM cypher(?, $$
                MATCH (proj:Project {projectId: $1})
                MATCH (proj)-[:CONTAINS]->(p1:Place)
                MATCH (p1)-[:HAS_PHONE]->(phone:Phone)<-[:HAS_PHONE]-(p2:Place)
                WHERE p1.id < p2.id
                RETURN p1, phone, p2
            $$) AS (p1 agtype, phone agtype, p2 agtype)
            CROSS JOIN LATERAL (
                SELECT p1 as p1_data, phone as phone_data, p2 as p2_data
            ) parsed
        ", [self::GRAPH_NAME, $projectId]);

        return $this->parseResults($results);
    }

    /**
     * Find addresses with multiple places (business complex or shared suite).
     * Indicates coordinated operations or legitimate business sharing.
     *
     * @return array<int, array<string, mixed>>
     */
    public function findSharedAddresses(string $projectId): array
    {
        $results = DB::select("
            SELECT
                addr_data->>'street' as street,
                addr_data->>'city' as city,
                addr_data->>'state' as state,
                addr_data->>'zip' as zip,
                count(places_array) as business_count,
                places_array
            FROM cypher(?, $$
                MATCH (proj:Project {projectId: $1})
                MATCH (proj)-[:CONTAINS]->(places:Place)
                MATCH (places)-[:HAS_ADDRESS]->(addr:Address)
                WITH addr, collect(places.name) as names, count(places) as count
                WHERE count > 1
                RETURN addr, names
            $$) AS (addr agtype, names_array agtype)
            CROSS JOIN LATERAL (
                SELECT addr as addr_data, names_array as places_array
            ) parsed
            GROUP BY street, city, state, zip, places_array
        ", [self::GRAPH_NAME, $projectId]);

        return $this->parseResults($results);
    }

    /**
     * Find phone numbers that appear across multiple projects.
     * Critical for cross-project intelligence: same decision-maker in different projects.
     *
     * @return array<int, array<string, mixed>>
     */
    public function findCrossProjectPhoneConnections(): array
    {
        $results = DB::select('
            SELECT
                phone_number,
                count(DISTINCT project_id) as project_count,
                array_agg(DISTINCT project_id) as projects,
                array_agg(DISTINCT business_name) as businesses
            FROM cypher(?, $$
                MATCH (proj:Project)-[:CONTAINS]->(p:Place)
                MATCH (p)-[:HAS_PHONE]->(phone:Phone)
                RETURN phone.number as phone_number, proj.projectId as project_id, p.name as business_name
            $$) AS (phone_number agtype, project_id agtype, business_name agtype)
            GROUP BY phone_number
            HAVING count(DISTINCT project_id) > 1
            ORDER BY count(DISTINCT project_id) DESC
        ', [self::GRAPH_NAME]);

        return $this->parseResults($results);
    }

    /**
     * Find websites that appear across multiple places in the same project.
     * Suggests franchises, parent company, or coordinated network.
     *
     * @return array<int, array<string, mixed>>
     */
    public function findSharedWebsites(string $projectId): array
    {
        $results = DB::select('
            SELECT
                website_url,
                count(places_array) as business_count,
                places_array
            FROM cypher(?, $$
                MATCH (proj:Project {projectId: $1})
                MATCH (proj)-[:CONTAINS]->(p:Place)
                MATCH (p)-[:HAS_WEBSITE]->(web:Website)
                WITH web.url as url, collect(p.name) as names, count(p) as count
                WHERE count > 1
                RETURN url, names
            $$) AS (url agtype, names_array agtype)
            CROSS JOIN LATERAL (
                SELECT url as website_url, names_array as places_array
            ) parsed
        ', [self::GRAPH_NAME]);

        return $this->parseResults($results);
    }

    /**
     * Get the full network around a place (1-2 hops).
     * Shows all directly connected and second-degree connections.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getPlaceNetwork(string $placeId, int $maxHops = 2): array
    {
        $results = DB::select("
            SELECT
                root_data->>'name' as root_name,
                root_data->>'category' as root_category,
                connected_type,
                connected_data
            FROM cypher(?, $$
                MATCH (root:Place {id: $1})
                MATCH (root)-[*1..\$2]-(connected)
                RETURN root, labels(connected)[0] as node_type, connected
            $$) AS (root agtype, connected_type agtype, connected agtype)
            CROSS JOIN LATERAL (
                SELECT root as root_data, connected_type, connected as connected_data
            ) parsed
        ", [self::GRAPH_NAME, $placeId, $maxHops]);

        return $this->parseResults($results);
    }

    /**
     * Find tightly connected clusters of places.
     * Identifies business networks that share multiple contact points.
     *
     * @return array<int, array<string, mixed>>
     */
    public function findConnectedClusters(string $projectId, int $minConnections = 2): array
    {
        $results = DB::select('
            SELECT
                cluster_places,
                connection_strength,
                shared_contacts
            FROM cypher(?, $$
                MATCH (proj:Project {projectId: $1})
                MATCH (proj)-[:CONTAINS]->(p:Place)
                MATCH (p)-[rel:HAS_PHONE|HAS_ADDRESS|HAS_WEBSITE]-(contact)
                WITH p, contact, type(rel) as rel_type,
                     collect(distinct rel_type) as contact_types,
                     count(distinct contact) as connection_count
                WHERE connection_count >= $2
                RETURN p, contact_types, collect(p.name) as cluster
            $$) AS (place agtype, contact_types agtype, cluster agtype)
            CROSS JOIN LATERAL (
                SELECT cluster as cluster_places, contact_types as shared_contacts, 1 as connection_strength
            ) parsed
        ', [self::GRAPH_NAME, $projectId, $minConnections]);

        return $this->parseResults($results);
    }

    /**
     * Get summary statistics for a project's graph.
     *
     * @return array{total_places?: mixed, places_with_phone?: mixed, places_with_address?: mixed, places_with_website?: mixed}
     */
    public function getProjectGraphStats(string $projectId): array
    {
        $results = DB::select('
            SELECT * FROM cypher(?, $$
                MATCH (proj:Project {projectId: $1})
                MATCH (proj)-[:CONTAINS]->(places:Place)

                // Count places
                WITH count(distinct places) as place_count,
                     collect(distinct places.id) as place_ids

                // Count contact points
                MATCH (p:Place) WHERE p.id IN place_ids
                WITH place_count,
                     count(distinct case when (p)-[:HAS_PHONE]->() then 1 end) as phones,
                     count(distinct case when (p)-[:HAS_ADDRESS]->() then 1 end) as addresses,
                     count(distinct case when (p)-[:HAS_WEBSITE]->() then 1 end) as websites

                RETURN place_count, phones, addresses, websites
            $$) AS (place_count agtype, phones agtype, addresses agtype, websites agtype)
        ', [self::GRAPH_NAME, $projectId]);

        if (! empty($results)) {
            return [
                'total_places' => $results[0]->place_count,
                'places_with_phone' => $results[0]->phones,
                'places_with_address' => $results[0]->addresses,
                'places_with_website' => $results[0]->websites,
            ];
        }

        return [];
    }

    /**
     * @param  array<int, stdClass>  $results
     * @return array<int, array<string, mixed>>
     */
    private function parseResults(array $results): array
    {
        return array_map(fn ($row) => (array) $row, $results);
    }
}
