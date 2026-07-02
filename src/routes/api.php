<?php

use Illuminate\Support\Facades\Route;
use Teksite\FileManager\Http\Controllers\EditFileApiController;
use Teksite\FileManager\Http\Controllers\GetFilesController;
use Teksite\FileManager\Http\Controllers\DeleteFileApiController;
use Teksite\FileManager\Http\Controllers\DatabaseBrowserController;
use Teksite\FileManager\Http\Controllers\StoreFileApiController;

Route::middleware([])->group(function () {
    Route::get('browser', [DatabaseBrowserController::class, 'browser'])->name('browser');

    Route::delete("remove", [DeleteFileApiController::class, 'deleteByPath'])->name('destroy.path');
    Route::delete("{file}", [DeleteFileApiController::class, 'delete'])->name('destroy');
    Route::get("{file}", [GetFilesController::class, 'show'])->name('show');
    Route::patch("{file}", [EditFileApiController::class, 'update'])->name('update');
    Route::post("/", [StoreFileApiController::class, 'store'])->name('store');
    Route::get("/", [GetFilesController::class, 'index'])->name('index');


//    Route::post("/upload-chunk", [ChunkUploaderController::class , 'upload'])->name('upload-chunk');

});
