<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    /**
     * POST /api/v1/newsletter/subscribe — subscribe an email to the newsletter.
     *
     * Idempotent: re-submitting a known address re-activates it rather than
     * failing on the unique constraint, so the form never errors for a repeat
     * visitor. Extend here to push to Mailchimp/Brevo.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        Subscriber::updateOrCreate(
            ['email' => $validated['email']],
            [
                'status' => 'subscribed',
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
            ],
        );

        return response()->json([
            'message' => 'You have been subscribed to our newsletter.',
        ]);
    }
}
