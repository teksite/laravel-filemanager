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



    public function normalizePath(?string $path = null, array $variables = []): string
    {
        if ($path) {
            $path = trim($path);
            $path = str_replace('\\', '/', $path);
            $path = preg_replace('#(\.\.[/\\\\]?)#', '', $path);
            $path = preg_replace('/[^a-zA-Z0-9_\-\/{}]/', '', $path);
            return $path;
        }
        $now = now();
        $replacements = array_merge([
            '{Y}' => $now->format('Y'),
            '{y}' => $now->format('y'),
            '{m}' => $now->format('m'),
            '{d}' => $now->format('d'),
            '{H}' => $now->format('H'),
            '{i}' => $now->format('i'),
        ], $variables);

        $basePath = config('filemanager.upload_path', 'uploads');

        return str_replace(array_keys($replacements), array_values($replacements), $basePath);
    }


    public function resolveName(string $name, string $extension, string $path, $disk, ?bool $overwrite = null): string
    {
        $shouldOverWrite = is_null($overwrite) ? config('filemanager.overwrite', false) : $overwrite;

        if ($shouldOverWrite) return "$name.$extension";

        $counter = 1;
        $filename = "{$name}.{$extension}";
        while ($this->storage->exists($disk , "{$path}/{$filename}")) {
            $filename = "{$name}-{$counter}.{$extension}";
            $counter++;
        }
        return $filename;
    }


}
