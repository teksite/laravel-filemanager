<?php

use Illuminate\Support\Facades\Route;
use Teksite\FileManager\Http\Controllers\GetFilesController;
use Teksite\FileManager\Http\Controllers\DeleteFileApiController;
use Teksite\FileManager\Http\Controllers\MediaViewController;
use Teksite\FileManager\Http\Controllers\StoreFileApiController;

Route::middleware([])->group(function () {
    Route::get('selector', [MediaViewController::class, 'getView'])->name('view.get');

    Route::delete("remove", [DeleteFileApiController::class, 'deleteByPath'])->name('destroy.path');
    Route::delete("{file}", [DeleteFileApiController::class, 'delete'])->name('destroy');
    Route::get("{file}", [GetFilesController::class, 'show'])->name('show');
    Route::post("/", [StoreFileApiController::class, 'store'])->name('store');
    Route::get("/", [GetFilesController::class, 'index'])->name('index');


//    Route::post("/upload-chunk", [ChunkUploaderController::class , 'upload'])->name('upload-chunk');

});
