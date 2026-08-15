<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Collection;
use App\Models\FinishOption;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<FinishOption>
 */
class FinishOptionFactory extends Factory
{
    protected $model = FinishOption::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);

        return [
            'collection_id' => Collection::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'swatch_hex' => $this->faker->hexColor(),
            'price_delta_paise' => 0,
            'sort_order' => 10,
        ];
    }

    public function withDelta(int $paise): static
    {
        return $this->state(fn (): array => ['price_delta_paise' => $paise]);
    }
}
