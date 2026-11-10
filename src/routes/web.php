<?php

use Illuminate\Support\Facades\Route;
use Teksite\FileManager\Http\Controllers\BrowserController;

Route::get('browser', [BrowserController::class, 'index'])->name('browser');
