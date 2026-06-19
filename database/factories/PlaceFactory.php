<?php

namespace Database\Factories;

use App\Models\Place;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Place>
 */
class PlaceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'place_id' => '0x'.fake()->sha256(),
            'name' => fake()->company(),
            'category' => fake()->randomElement(['Contractor', 'Builder', 'Home Services', 'Construction']),
            'street_address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->stateAbbr(),
            'zip' => fake()->postcode(),
            'phone' => fake()->phoneNumber(),
            'website' => fake()->url(),
            'plus_code' => fake()->bothify('????+??'),
            'hours' => 'Monday-Friday: 9AM-5PM, Saturday-Sunday: Closed',
            'status' => fake()->randomElement(['Open', 'Closed', 'Open 24h']),
            'price_range' => fake()->randomElement(['$', '$$', '$$$', '$$$$']),
            'maps_url' => 'https://maps.google.com/maps/place/'.fake()->slug(),
            'rating' => fake()->randomFloat(1, 1, 5),
            'reviews_count' => fake()->numberBetween(1, 500),
            'is_sponsored' => fake()->boolean(20),
            'keyword' => fake()->word(),
            'source' => fake()->randomElement(['passive', 'bulk', 'partial']),
            'captured_at' => fake()->dateTimeThisMonth(),
        ];
    }
}
