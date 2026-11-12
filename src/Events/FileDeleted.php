<?php

namespace Teksite\FileManager\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Teksite\FileManager\Models\UploadFile;

class FileDeleted
{
    use Dispatchable;

    /**
     * Create a new event instance.
     */
    public function __construct(public UploadFile $file) {}

}
