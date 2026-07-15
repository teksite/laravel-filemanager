<?php

use Illuminate\Support\Facades\Route;
use Teksite\FileManager\Http\Controllers\DatabaseFileBrowser\DatabaseBrowserController;

Route::get('browser', [DatabaseBrowserController::class, 'browser'])->name('browser');
