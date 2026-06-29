<?php

namespace Teksite\FileManager\Contracts;

use Illuminate\Http\UploadedFile;
use Teksite\FileManager\Models\UploadFile;

interface FileNameGeneratorInterface
{
    public function generate(UploadedFile $file): string;
}
