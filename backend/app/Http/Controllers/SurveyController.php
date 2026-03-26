<?php

namespace App\Http\Controllers;

use App\Models\SurveyResponse;
use Illuminate\Http\Request;

class SurveyController extends Controller
{
    public function show()
    {
        $user     = auth('api')->user();
        $response = SurveyResponse::where('user_id', $user->id)->first();

        if (! $response) {
            return response()->json(['data' => null, 'status' => null, 'submitted_at' => null]);
        }

        return response()->json([
            'data'         => $response->data,
            'status'       => $response->status,
            'submitted_at' => optional($response->submitted_at)?->toISOString(),
        ]);
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();

        $validated = $request->validate([
            'data'   => 'required|array',
            'submit' => 'boolean',
        ]);

        $shouldSubmit = $validated['submit'] ?? false;
        $status       = $shouldSubmit ? 'submitted' : 'draft';

        $response = SurveyResponse::updateOrCreate(
            ['user_id' => $user->id],
            [
                'data'         => $validated['data'],
                'status'       => $status,
                'submitted_at' => $shouldSubmit ? now() : null,
            ]
        );

        return response()->json([
            'message'      => $shouldSubmit
                ? 'Encuesta enviada correctamente.'
                : 'Progreso guardado correctamente.',
            'data'         => $response->data,
            'status'       => $response->status,
            'submitted_at' => optional($response->submitted_at)?->toISOString(),
        ]);
    }
}
