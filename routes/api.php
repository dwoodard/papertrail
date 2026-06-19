<?php

use App\Http\Controllers\Api\PlaceGraphController;
use App\Http\Controllers\Api\PlaceSyncController;
use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

Route::get('/projects', [ProjectController::class, 'index']);
Route::post('/places/sync', [PlaceSyncController::class, 'sync']);

// Graph analysis endpoints
Route::get('/graph/shared-phones', [PlaceGraphController::class, 'sharedPhones']);
Route::get('/graph/shared-addresses', [PlaceGraphController::class, 'sharedAddresses']);
Route::get('/graph/shared-websites', [PlaceGraphController::class, 'sharedWebsites']);
Route::get('/graph/cross-project-connections', [PlaceGraphController::class, 'crossProjectConnections']);
Route::get('/graph/place-network', [PlaceGraphController::class, 'placeNetwork']);
Route::get('/graph/clusters', [PlaceGraphController::class, 'clusters']);
Route::get('/graph/stats', [PlaceGraphController::class, 'stats']);
