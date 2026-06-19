<?php

namespace Database\Seeders;

use App\Models\GraphEdge;
use App\Models\GraphNode;
use App\Models\Project;
use Illuminate\Database\Seeder;

class GraphConnectionPatternsSeeder extends Seeder
{
    public function run(): void
    {
        $project = Project::first();
        if (! $project) {
            $this->command->error('No project found. Run DatabaseSeeder first.');

            return;
        }

        $this->command->info('Creating multi-level connection patterns...');

        // 1-LEVEL: Direct connection (Business → Contact)
        $b1 = $this->createBusiness($project, 'Direct Connect LLC', 'phone:555-0001');
        $p1 = $this->createPhone($project, '555-0001', '(555) 0001');
        $this->createEdge($project, $b1, $p1, 'HAS_PHONE');
        $this->command->info('✓ Level 1: Business → Phone');

        // 2-LEVEL: Business → Phone → Domain (phone connects to domain via another business)
        $b2 = $this->createBusiness($project, 'Two Level Inc', 'phone:555-0002');
        $p2 = $this->createPhone($project, '555-0002', '(555) 0002');
        $b2b = $this->createBusiness($project, 'Two Level Partner', 'phone:555-0002');
        $d2 = $this->createDomain($project, 'twolevel.com');
        $this->createEdge($project, $b2, $p2, 'HAS_PHONE');
        $this->createEdge($project, $b2b, $p2, 'HAS_PHONE');
        $this->createEdge($project, $b2b, $d2, 'USES_DOMAIN');
        $this->command->info('✓ Level 2: Business → Phone (shared) → Partner Business → Domain');

        // 3-LEVEL: Business → Address → City → Category (through shared location)
        $b3 = $this->createBusiness($project, 'Three Level Corp', 'address:three');
        $addr3 = $this->createAddress($project, '555 Tower Ln, Tech City, UT 84000');
        $city3 = $this->createCity($project, 'Tech City', 'UT');
        $cat3 = $this->createCategory($project, 'Software Development');
        $this->createEdge($project, $b3, $addr3, 'HAS_ADDRESS');
        $this->createEdge($project, $addr3, $city3, 'IN_CITY');
        $this->createEdge($project, $city3, $cat3, 'HAS_CATEGORY');
        $this->command->info('✓ Level 3: Business → Address → City → Category');

        // 4-LEVEL: Business → Domain → Website → Business → Phone
        $b4a = $this->createBusiness($project, 'Four Level Alpha', 'domain:fourlevel.io');
        $d4 = $this->createDomain($project, 'fourlevel.io');
        $w4 = $this->createWebsite($project, 'https://fourlevel.io');
        $b4b = $this->createBusiness($project, 'Four Level Beta', 'phone:555-0004');
        $p4 = $this->createPhone($project, '555-0004', '(555) 0004');
        $this->createEdge($project, $b4a, $d4, 'USES_DOMAIN');
        $this->createEdge($project, $d4, $w4, 'HAS_WEBSITE');
        $this->createEdge($project, $w4, $b4b, 'WEBSITE_OF');
        $this->createEdge($project, $b4b, $p4, 'HAS_PHONE');
        $this->command->info('✓ Level 4: Business → Domain → Website → Business → Phone');

        // 5-LEVEL: Business → Phone → Shared Business → Domain → Shared Domain → Website
        $b5a = $this->createBusiness($project, 'Five Level Start', 'phone:555-0005');
        $p5 = $this->createPhone($project, '555-0005', '(555) 0005');
        $b5b = $this->createBusiness($project, 'Five Level Middle', 'phone:555-0005');
        $d5 = $this->createDomain($project, 'fivelevel.com');
        $b5c = $this->createBusiness($project, 'Five Level End', 'domain:fivelevel.com');
        $w5 = $this->createWebsite($project, 'https://fivelevel.com');
        $this->createEdge($project, $b5a, $p5, 'HAS_PHONE');
        $this->createEdge($project, $b5b, $p5, 'HAS_PHONE');
        $this->createEdge($project, $b5b, $d5, 'USES_DOMAIN');
        $this->createEdge($project, $b5c, $d5, 'USES_DOMAIN');
        $this->createEdge($project, $d5, $w5, 'HAS_WEBSITE');
        $this->command->info('✓ Level 5: Business → Phone → Business → Domain → Business → Website');

        $this->command->info('✓ All multi-level connection patterns created!');
    }

    private function createBusiness($project, $name, $key): GraphNode
    {
        return GraphNode::updateOrCreate(
            ['project_id' => $project->id, 'type' => 'business', 'normalized_key' => 'business:'.$key],
            ['label' => $name, 'source' => 'test_pattern']
        );
    }

    private function createPhone($project, $key, $label): GraphNode
    {
        return GraphNode::updateOrCreate(
            ['project_id' => $project->id, 'type' => 'phone', 'normalized_key' => 'phone:'.$key],
            ['label' => $label, 'source' => 'test_pattern']
        );
    }

    private function createDomain($project, $domain): GraphNode
    {
        return GraphNode::updateOrCreate(
            ['project_id' => $project->id, 'type' => 'domain', 'normalized_key' => 'domain:'.$domain],
            ['label' => $domain, 'source' => 'test_pattern']
        );
    }

    private function createWebsite($project, $url): GraphNode
    {
        return GraphNode::updateOrCreate(
            ['project_id' => $project->id, 'type' => 'website', 'normalized_key' => 'website:'.$url],
            ['label' => $url, 'source' => 'test_pattern']
        );
    }

    private function createAddress($project, $address): GraphNode
    {
        $key = strtolower(trim($address));

        return GraphNode::updateOrCreate(
            ['project_id' => $project->id, 'type' => 'address', 'normalized_key' => $key],
            ['label' => $address, 'source' => 'test_pattern']
        );
    }

    private function createCity($project, $city, $state): GraphNode
    {
        $key = "city:{$city}:{$state}";

        return GraphNode::updateOrCreate(
            ['project_id' => $project->id, 'type' => 'city', 'normalized_key' => $key],
            ['label' => "{$city}, {$state}", 'source' => 'test_pattern']
        );
    }

    private function createCategory($project, $category): GraphNode
    {
        $key = 'category:'.strtolower(str_replace(' ', '-', $category));

        return GraphNode::updateOrCreate(
            ['project_id' => $project->id, 'type' => 'category', 'normalized_key' => $key],
            ['label' => $category, 'source' => 'test_pattern']
        );
    }

    private function createEdge($project, $fromNode, $toNode, $type): GraphEdge
    {
        return GraphEdge::updateOrCreate(
            [
                'project_id' => $project->id,
                'from_node_id' => $fromNode->id,
                'to_node_id' => $toNode->id,
                'type' => $type,
            ],
            ['confidence' => 1.0]
        );
    }
}
