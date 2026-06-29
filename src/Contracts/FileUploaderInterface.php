<?php

namespace Teksite\FileManager\Contracts;

use Illuminate\Http\UploadedFile;
use Teksite\FileManager\DTO\UploadOptions;
use Teksite\FileManager\Models\UploadFile;

interface FileUploaderInterface
{
    public function upload(UploadedFile $file, UploadOptions|array $options): UploadFile;
}
