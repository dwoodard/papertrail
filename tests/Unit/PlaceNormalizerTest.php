<?php

use App\Services\PlaceNormalizer;

test('normalizes hours by stripping noise tokens', function () {
    $input = [
        'hours' => 'Thursday11 AM–7 PMFriday(Juneteenth)11 AM–7 PM Hours might differSuggest new hours',
    ];

    $result = PlaceNormalizer::normalize($input);

    expect($result['hours'])
        ->toContain('Thursday')
        ->toContain('11 AM-7 PM')
        ->not->toContain('Suggest new hours')
        ->not->toContain('(Juneteenth)')
        ->not->toContain('Hours might differ');
});

test('normalizes hours with em-dash to hyphen', function () {
    $input = ['hours' => 'Monday 9 AM–5 PM'];
    $result = PlaceNormalizer::normalize($input);

    expect($result['hours'])->toBe('Monday 9 AM-5 PM');
});

test('parses address into street, city, state, zip', function () {
    $input = ['address' => '2277 N 3600 W, Clinton, UT 84015'];
    $result = PlaceNormalizer::normalize($input);

    expect($result['street_address'])->toBe('2277 N 3600 W');
    expect($result['city'])->toBe('Clinton');
    expect($result['state'])->toBe('UT');
    expect($result['zip'])->toBe('84015');
});

test('handles N/A address gracefully', function () {
    $input = ['address' => 'N/A'];
    $result = PlaceNormalizer::normalize($input);

    expect($result['street_address'])->toBeNull();
    expect($result['city'])->toBeNull();
    expect($result['state'])->toBeNull();
    expect($result['zip'])->toBeNull();
});

test('normalizes reviews count by stripping "reviews" suffix', function () {
    $input = ['reviews' => '31 reviews'];
    $result = PlaceNormalizer::normalize($input);

    expect($result['reviews_count'])->toBe(31);
});

test('casts rating to float', function () {
    $input = ['rating' => '4.2'];
    $result = PlaceNormalizer::normalize($input);

    expect($result['rating'])->toBe(4.2);
});

test('handles N/A values by converting to null', function () {
    $input = [
        'phone' => 'N/A',
        'website' => 'N/A',
        'hours' => 'N/A',
        'rating' => 'N/A',
        'reviews' => 'N/A',
    ];

    $result = PlaceNormalizer::normalize($input);

    expect($result['phone'])->toBeNull();
    expect($result['website'])->toBeNull();
    expect($result['hours'])->toBeNull();
    expect($result['rating'])->toBeNull();
    expect($result['reviews_count'])->toBeNull();
});

test('preserves boolean fields', function () {
    $input = ['isSponsored' => true];
    $result = PlaceNormalizer::normalize($input);

    expect($result['is_sponsored'])->toBeTrue();
});

test('handles complete real-world place data', function () {
    $input = [
        'placeId' => '0x87531a863646ad63',
        'name' => 'Ivory Homes - Cranefield Estates',
        'category' => 'Home builder',
        'address' => '2277 N 3600 W, Clinton, UT 84015',
        'phone' => '(801) 985-5555',
        'website' => 'https://ivoryhomes.com',
        'plusCode' => '4WW3+MR Clinton, Utah',
        'hours' => 'Thursday11 AM–7 PMFriday(Juneteenth)11 AM–7 PM Hours might differSaturday10 AM–7 PMSuggest new hours',
        'status' => 'Closed',
        'priceRange' => '$',
        'rating' => '4.2',
        'reviews' => '31 reviews',
        'isSponsored' => false,
        'keyword' => 'concrete contractor',
        'source' => 'bulk',
        'capturedAt' => '2026-06-18T17:27:58.797Z',
    ];

    $result = PlaceNormalizer::normalize($input);

    expect($result['place_id'])->toBe('0x87531a863646ad63');
    expect($result['name'])->toBe('Ivory Homes - Cranefield Estates');
    expect($result['street_address'])->toBe('2277 N 3600 W');
    expect($result['city'])->toBe('Clinton');
    expect($result['rating'])->toBe(4.2);
    expect($result['reviews_count'])->toBe(31);
    expect($result['is_sponsored'])->toBeFalse();
});
