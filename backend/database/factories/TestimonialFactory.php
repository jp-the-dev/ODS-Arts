<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Testimonial>
 */
class TestimonialFactory extends Factory
{
    protected $model = Testimonial::class;

    private static array $quotes = [
        'The walnut frame transformed our living room. Every guest comments on it.',
        'Finally a frame worthy of our wedding portrait. The quality is extraordinary.',
        'I ordered three frames and each one exceeded my expectations. Museum-quality at a fair price.',
        'The craftsmanship is evident the moment you open the packaging. Absolutely stunning.',
        'ODSArts understood exactly what I needed. My grandmother\'s photo has never looked better.',
        'Bought as a gift — my parents were moved to tears. Worth every rupee.',
    ];

    private static array $authors = [
        ['name' => 'Priya Mehta', 'city' => 'Mumbai'],
        ['name' => 'Arun Sharma', 'city' => 'Bangalore'],
        ['name' => 'Divya Patel', 'city' => 'Ahmedabad'],
        ['name' => 'Vikram Nair', 'city' => 'Pune'],
        ['name' => 'Neha Joshi', 'city' => 'Surat'],
        ['name' => 'Rahul Gupta', 'city' => 'Delhi'],
    ];

    public function definition(): array
    {
        static $index = 0;

        $quote = self::$quotes[$index % count(self::$quotes)];
        $author = self::$authors[$index % count(self::$authors)];
        $index++;

        return [
            'product_id' => null,
            'quote' => $quote,
            'author' => $author['name'],
            'city' => $author['city'],
            'is_active' => true,
        ];
    }
}
