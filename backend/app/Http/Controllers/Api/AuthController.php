<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\UpdatePasswordRequest;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Storefront accounts, issued as Sanctum personal access tokens.
 *
 * Accounts are optional — checkout works for guests. Signing in adds order
 * history, saved addresses and a server-side cart/wishlist.
 */
class AuthController extends Controller
{
    /** POST /api/v1/auth/register */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
        ]);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $this->issueToken($user, $request),
            ],
            'message' => 'Welcome to ODSArts.',
        ], 201);
    }

    /** POST /api/v1/auth/login */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        // One generic failure for both unknown email and wrong password, so the
        // endpoint cannot be used to discover which addresses are registered.
        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        return response()->json([
            'data' => [
                'user' => new UserResource($user->load('addresses')),
                'token' => $this->issueToken($user, $request),
            ],
            'message' => 'Signed in.',
        ]);
    }

    /** POST /api/v1/auth/logout — revokes only the token that made this call. */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Signed out.']);
    }

    /** GET /api/v1/auth/user */
    public function user(Request $request): UserResource
    {
        return new UserResource(
            $request->user()->load(['addresses', 'oauthProviders'])
        );
    }

    /** PUT /api/v1/auth/user */
    public function updateProfile(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->update($request->validated());

        return new UserResource($user->fresh()->load('addresses'));
    }

    /**
     * PUT /api/v1/auth/user/password
     *
     * Every other session is signed out on success — a password change is how a
     * customer responds to a suspected compromise, so stale tokens must die.
     * The caller's own token is preserved so they are not logged out mid-flow.
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $currentTokenId = $user->currentAccessToken()->id;

        $user->update(['password' => $request->validated('new_password')]);
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json(['message' => 'Password updated.']);
    }

    /**
     * POST /api/v1/auth/forgot-password
     *
     * Always reports success. Revealing whether an address is registered would
     * turn this into an account-enumeration endpoint.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        Password::sendResetLink($validated);

        return response()->json([
            'message' => 'If that email is registered, a reset link is on its way.',
        ]);
    }

    /** POST /api/v1/auth/reset-password */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset($validated, function (User $user, string $password): void {
            $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();

            // A reset means the old credentials are untrusted — drop every token.
            $user->tokens()->delete();
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json(['message' => 'Password reset. You can sign in now.']);
    }

    /** Names the token after the device so customers can tell sessions apart. */
    private function issueToken(User $user, Request $request): string
    {
        $name = Str::limit((string) $request->userAgent(), 60, '') ?: 'storefront';

        return $user->createToken($name)->plainTextToken;
    }
}
