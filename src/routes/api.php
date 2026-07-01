<?php

use Illuminate\Support\Facades\Route;
use Teksite\FileManager\Http\Controllers\GetFileController;
use Teksite\FileManager\Http\Controllers\DeleteFileApiController;
use Teksite\FileManager\Http\Controllers\StoreFileApiController;

Route::middleware([])->group(function () {

    Route::delete("remove", [DeleteFileApiController::class, 'deleteByPath'])->name('destroy.path');
    Route::delete("{file}", [DeleteFileApiController::class, 'delete'])->name('destroy');
    Route::get("{file}", [GetFileController::class, 'show'])->name('show');
    Route::post("/", [StoreFileApiController::class, 'store'])->name('store');
    Route::get("/", [GetFileController::class, 'index'])->name('index');

//    Route::post("/upload-chunk", [ChunkUploaderController::class , 'upload'])->name('upload-chunk');

});
