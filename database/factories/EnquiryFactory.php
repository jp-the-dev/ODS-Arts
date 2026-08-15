<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Enquiry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Enquiry>
 */
class EnquiryFactory extends Factory
{
    protected $model = Enquiry::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->safeEmail(),
            'phone' => $this->faker->numerify('+91 9#########'),
            'message' => $this->faker->paragraph(),
            'type' => 'contact',
            'status' => 'new',
        ];
    }

    /** A custom framing enquiry rather than a general contact message. */
    public function customFraming(): static
    {
        return $this->state(fn (): array => ['type' => 'custom_framing']);
    }

    /** A gifting enquiry. */
    public function gifting(): static
    {
        return $this->state(fn (): array => ['type' => 'gifting']);
    }

    /** An enquiry the team has already read. */
    public function read(): static
    {
        return $this->state(fn (): array => ['status' => 'read']);
    }
}
