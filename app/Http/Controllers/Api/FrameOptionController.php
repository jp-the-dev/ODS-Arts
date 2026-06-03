<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FrameOptionResource;
use App\Models\FrameOption;
use Illuminate\Http\JsonResponse;

class FrameOptionController extends Controller
{
    /**
     * GET /api/v1/frame-options — list all active frame options, grouped by type.
     *
     * Response shape: { wood: [...], mat: [...], glass: [...] }
     */
    public function index(): JsonResponse
    {
        $options = FrameOption::active()
            ->orderBy('sort_order')
            ->get()
            ->groupBy('type');

        return response()->json([
            'data' => [
                'wood' => FrameOptionResource::collection($options->get('wood', collect())),
                'mat' => FrameOptionResource::collection($options->get('mat', collect())),
                'glass' => FrameOptionResource::collection($options->get('glass', collect())),
            ],
        ]);
    }
}
