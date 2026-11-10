<?php

namespace Teksite\FileManager\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\UploadedFile;

final class FileUploading
{
    use Dispatchable;

    public function __construct(public readonly UploadedFile $file) {}
}
