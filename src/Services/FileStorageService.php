<?php

namespace Teksite\FileManager\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FileStorageService
{
    public function save(UploadedFile $file, string $disk, string $path, string $name): string
    {
        return Storage::disk($disk)->putFileAs($path, $file, $name);
    }

    public function delete(string $disk, string $path): bool
    {
        return Storage::disk($disk)->delete($path);
    }


    public function exists(string $disk, string $path): bool
    {
        return Storage::disk($disk)->exists($path);
    }

}
