<?php

namespace Teksite\FileManager\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Teksite\FileManager\Models\UploadFile;

class FileUploaded
{
    use Dispatchable;

    /**
     * Create a new event instance.
     */
    public function __construct(public UploadFile $file)
    {
    }


}
