<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'password' => bcrypt('password'),
            ]
        );

        // Create sample projects
        $projects = [
            [
                // salt rock company
                'name' => 'Salt Rock Company',
                'goal' => 'Find leads that relate to Salt Rock Company for partnerships',
            ],
            [
                'name' => 'Tech Startup Network',
                'goal' => 'Map relationships between tech startups and founders',
            ],
            [
                'name' => 'Real Estate Holdings',
                'goal' => 'Track commercial property ownership and control',
            ],
            [
                'name' => 'Supply Chain Investigation',
                'goal' => 'Analyze connections in manufacturing supply chains',
            ],
            [
                'name' => 'Financial Networks',
                'goal' => 'Map relationships between financial institutions and key stakeholders',
            ],
            // something for a social network
            [
                'name' => 'Social Network Analysis',
                'goal' => 'Map relationships and interactions within social networks',
            ],
            // find youtube channels with content creators and interested users
            [
                'name' => 'YouTube Channel Analysis',
                'goal' => 'Map relationships and interactions between YouTube channels and content creators and interested users',
            ],
        ];

        foreach ($projects as $projectData) {
            Project::firstOrCreate(
                ['name' => $projectData['name']],
                [
                    'user_id' => $user->id,
                    'slug' => Str::slug($projectData['name']),
                    'goal' => $projectData['goal'],
                    'status' => 'active',
                ]
            );
        }

        $this->command->info('Projects seeded successfully!');
    }
}
