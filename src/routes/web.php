<?php

use Teksite\FileManager\Http\Controllers\ApiFileManagerController;

\Illuminate\Support\Facades\Route::middleware([])->group(function (){

   Route::get("/", [ApiFileManagerController::class, 'index'])->name('index');
    Route::get("/{file}", [ApiFileManagerController::class, 'show'])->name('show');
    Route::post("/", [ApiFileManagerController::class, 'upload'])->name('upload');
    Route::post("/by-model", [ApiFileManagerController::class, 'uploadByModel'])->name('upload.by.model');
    Route::delete("/{file}", [ApiFileManagerController::class, 'delete'])->name('destroy');


//    Route::post("/upload-chunk", [ChunkUploaderController::class , 'upload'])->name('upload-chunk');

});
