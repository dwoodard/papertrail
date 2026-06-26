<?php

use App\Http\Controllers\Api\CsvImportController;
use App\Http\Controllers\Api\GraphController;
use App\Http\Controllers\Api\PlaceGraphController;
use App\Http\Controllers\Api\PlaceSyncController;
use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

// Handle CORS preflight requests
Route::options('/{path?}', function () {
    return response('', 200);
})->where('path', '.*');

Route::get('/projects', [ProjectController::class, 'index']);
Route::post('/projects', [ProjectController::class, 'store']);
Route::post('/places/sync', [PlaceSyncController::class, 'sync']);
Route::post('/import/csv', [CsvImportController::class, 'store']);

// Graph endpoints (replacing graphs.json)
Route::get('/graph/projects', [GraphController::class, 'projects']);
Route::get('/graph/project/{id}', [GraphController::class, 'projectGraph']);
Route::get('/graph/node/{id}/relations', [GraphController::class, 'nodeRelations']);
Route::get('/graph/shared-nodes', [GraphController::class, 'sharedNodes']);

// Legacy graph analysis endpoints
Route::get('/graph/shared-phones', [PlaceGraphController::class, 'sharedPhones']);
Route::get('/graph/shared-addresses', [PlaceGraphController::class, 'sharedAddresses']);
Route::get('/graph/shared-websites', [PlaceGraphController::class, 'sharedWebsites']);
Route::get('/graph/cross-project-connections', [PlaceGraphController::class, 'crossProjectConnections']);
Route::get('/graph/place-network', [PlaceGraphController::class, 'placeNetwork']);
Route::get('/graph/clusters', [PlaceGraphController::class, 'clusters']);
Route::get('/graph/stats', [PlaceGraphController::class, 'stats']);
