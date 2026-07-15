<?php

use Illuminate\Support\Facades\Route;
use Teksite\FileManager\Http\Controllers\DatabaseBrowserApiController;
use Teksite\FileManager\Http\Controllers\Files\DeleteFileApiController;
use Teksite\FileManager\Http\Controllers\Files\EditFileApiController;
use Teksite\FileManager\Http\Controllers\Files\StoreFileApiController;
use Teksite\FileManager\Http\Controllers\GetFilesController;


Route::Post('browser', [DatabaseBrowserApiController::class, 'browser'])->name('browser');


Route::delete('remove', [DeleteFileApiController::class, 'deleteByPath'])->name('destroy.path');
Route::get('/', [GetFilesController::class, 'index'])->name('index');
Route::post('/', [StoreFileApiController::class, 'store'])->name('store');
Route::get('{file}', [GetFilesController::class, 'show'])->name('show');
Route::patch('{file}', [EditFileApiController::class, 'update'])->name('update');
Route::delete('{file}', [DeleteFileApiController::class, 'delete'])->name('destroy');

// Route::post('upload-chunk', [ChunkUploaderController::class, 'upload'])->name('upload-chunk');
