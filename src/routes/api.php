<?php

use Illuminate\Support\Facades\Route;
use Teksite\FileManager\Http\Controllers\EditFileApiController;
use Teksite\FileManager\Http\Controllers\GetFilesController;
use Teksite\FileManager\Http\Controllers\DeleteFileApiController;
use Teksite\FileManager\Http\Controllers\DatabaseBrowserController;
use Teksite\FileManager\Http\Controllers\StoreFileApiController;

Route::middleware([])->group(function () {

    // Static routes first
    Route::get('browser', [DatabaseBrowserController::class, 'browser'])->name('browser');
    Route::delete('remove', [DeleteFileApiController::class, 'deleteByPath'])->name('destroy.path');

    // Collection routes
    Route::get('/', [GetFilesController::class, 'index'])->name('index');
    Route::post('/', [StoreFileApiController::class, 'store'])->name('store');

    // Single resource routes
    Route::get('{file}', [GetFilesController::class, 'show'])->name('show');
    Route::patch('{file}', [EditFileApiController::class, 'update'])->name('update');
    Route::delete('{file}', [DeleteFileApiController::class, 'delete'])->name('destroy');

    // Route::post('upload-chunk', [ChunkUploaderController::class, 'upload'])->name('upload-chunk');
});
