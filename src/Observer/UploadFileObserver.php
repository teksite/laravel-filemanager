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
        if (config('file-manager.delete_file_with_model', true)) {
            Storage::disk($file->disk)->delete($file->path);
        }
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
    public function forceDeleted(UploadFile $user): void
    {
        // ...
    }
}
