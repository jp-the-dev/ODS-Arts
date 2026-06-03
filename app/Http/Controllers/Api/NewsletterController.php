<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NewsletterController extends Controller
{
    /**
     * POST /api/v1/newsletter/subscribe — subscribe an email to the newsletter.
     *
     * Currently stores to a log; can be extended to connect to Mailchimp/Brevo etc.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        // Log the subscription — extend to integrate with a mailing service later
        Log::info('Newsletter subscription', [
            'email' => $validated['email'],
        ]);

        return response()->json([
            'message' => 'You have been subscribed to our newsletter.',
        ]);
    }
}
