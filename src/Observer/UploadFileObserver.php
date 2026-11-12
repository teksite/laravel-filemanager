<?php

namespace Teksite\FileManager\Observer;

use Illuminate\Support\Facades\Storage;
use Teksite\FileManager\Models\UploadFile;

class UploadFileObserver
{


    /**
     * Handle the UploadFile "created" event.
     */
    public function created(UploadFile $user): void
    {
        // ...
    }

    /**
     * Handle the UploadFile "updated" event.
     */
    public function updated(UploadFile $user): void
    {
        // ...
    }

    /**
     * Handle the UploadFile "deleted" event.
     */
    public function deleted(UploadFile $file): void
    {
       // ...
    }


    /**
     * Handle the UploadFile "restored" event.
     */
    public function restored(UploadFile $user): void
    {
        // ...
    }

    /**
     * Handle the UploadFile "forceDeleted" event.
     */

    public function forceDeleted(UploadFile $file): void
    {
        if (!config('filemanager.storage.delete_physical', true)) return;

        try {
            Storage::disk($file->disk)->delete($file->allPaths());
        } catch (\Throwable $e) {
            report($e);
        }

    }
}
