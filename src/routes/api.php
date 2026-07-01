<?php

use Illuminate\Support\Facades\Route;
use Teksite\FileManager\Http\Controllers\ApiFileManagerController;

Route::middleware([])->group(function () {

    Route::delete("remove", [ApiFileManagerController::class, 'deleteByPath'])->name('destroy.path');
    Route::delete("{file}", [ApiFileManagerController::class, 'delete'])->name('destroy');
    Route::get("{file}", [ApiFileManagerController::class, 'show'])->name('show');
    Route::post("/", [ApiFileManagerController::class, 'store'])->name('store');
    Route::get("/", [ApiFileManagerController::class, 'index'])->name('index');

//    Route::post("/upload-chunk", [ChunkUploaderController::class , 'upload'])->name('upload-chunk');

});
