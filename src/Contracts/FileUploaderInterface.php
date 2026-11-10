<?php

namespace Teksite\FileManager\Contracts;

use Illuminate\Http\UploadedFile;
use Teksite\FileManager\DTO\InspectedFile;
use Teksite\FileManager\Models\UploadFile;

interface FileUploaderInterface
{
    public function upload(UploadedFile $file, InspectedFile|array $options): UploadFile;
}
