<?php

use Illuminate\Support\Facades\Route;
use Teksite\FileManager\Http\Controllers\BrowserController;
use Teksite\FileManager\Http\Controllers\BulkFileController;
use Teksite\FileManager\Http\Controllers\FileController;
use Teksite\FileManager\Http\Controllers\FolderController;
use Teksite\FileManager\Http\Controllers\ServeFileController;

$read = 'throttle:filemanager-read';
$write = 'throttle:filemanager-write';
$upload = 'throttle:filemanager-upload';

Route::post('browser', [BrowserController::class, 'popup'])->middleware($read)->name('browser');

Route::get('folders', [FolderController::class, 'index'])->middleware($read)->name('folders.index');
Route::post('folders', [FolderController::class, 'store'])->middleware($write)->name('folders.store');
Route::patch('folders/{folder}', [FolderController::class, 'update'])->middleware($write)->whereUlid('folder')->name('folders.update');
Route::delete('folders/{folder}', [FolderController::class, 'destroy'])->middleware($write)->whereUlid('folder')->name('folders.destroy');

Route::post('bulk/delete', [BulkFileController::class, 'destroy'])->middleware($write)->name('bulk.destroy');
Route::post('bulk/move', [BulkFileController::class, 'move'])->middleware($write)->name('bulk.move');

Route::get('/', [FileController::class, 'index'])->middleware($read)->name('index');
Route::post('/', [FileController::class, 'store'])->middleware($upload)->name('store');

Route::middleware($read)->group(function () {
    Route::get('{file}', [FileController::class, 'show'])->whereUlid('file')->name('show');
    Route::get('{file}/serve', [ServeFileController::class, 'serve'])->whereUlid('file')->name('serve');
    Route::get('{file}/download', [ServeFileController::class, 'download'])->whereUlid('file')->name('download');
});

Route::middleware($write)->group(function () {
    Route::patch('{file}', [FileController::class, 'update'])->whereUlid('file')->name('update');
    Route::delete('{file}', [FileController::class, 'destroy'])->whereUlid('file')->name('destroy');
    Route::post('{file}/restore', [FileController::class, 'restore'])->whereUlid('file')->withTrashed()->name('restore');
    Route::delete('{file}/force', [FileController::class, 'forceDestroy'])->whereUlid('file')->withTrashed()->name('destroy.force');
});
