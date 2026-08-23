<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    /**
     * @var list<array{quote: string, author: string, city: string}>
     */
    private static array $testimonials = [
        [
            'quote' => 'The walnut frame transformed our living room. Every guest comments on it. Worth every rupee.',
            'author' => 'Priya Mehta',
            'city' => 'Mumbai',
        ],
        [
            'quote' => 'Finally a frame worthy of our wedding portrait. The craftsmanship is extraordinary — you can feel the quality.',
            'author' => 'Arun & Divya Sharma',
            'city' => 'Bangalore',
        ],
        [
            'quote' => 'I ordered three frames and each one exceeded my expectations. Museum-quality at a very fair price.',
            'author' => 'Vikram Nair',
            'city' => 'Pune',
        ],
        [
            'quote' => 'ODSArts understood exactly what I needed. My grandmother\'s photograph has never looked better.',
            'author' => 'Neha Joshi',
            'city' => 'Ahmedabad',
        ],
        [
            'quote' => 'Bought as a anniversary gift — my parents were moved to tears. The packaging alone is luxurious.',
            'author' => 'Rahul Gupta',
            'city' => 'Surat',
        ],
        [
            'quote' => 'The Heritage Oak frame is breathtaking. It truly feels like an heirloom — something to pass on.',
            'author' => 'Meera Krishnamurthy',
            'city' => 'Chennai',
        ],
    ];

    public function run(): void
    {
        // Testimonials carry no unique column, so a bare create() would silently
        // stack another six copies on every re-run rather than failing loudly.
        // Author plus city is the natural key here — one quote per person.
        foreach (self::$testimonials as $testimonialData) {
            Testimonial::updateOrCreate(
                [
                    'author' => $testimonialData['author'],
                    'city' => $testimonialData['city'],
                ],
                [
                    'product_id' => null,
                    'quote' => $testimonialData['quote'],
                    'is_active' => true,
                ],
            );
        }
    }
}
