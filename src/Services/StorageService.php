<?php

namespace Teksite\FileManager\Services;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Teksite\FileManager\Http\Exceptions\FileUploadException;
use Teksite\FileManager\Http\Exceptions\InvalidDiskException;

/** Thin, validated wrapper around Laravel's filesystem. */
class StorageService
{
    public function disk(string $name): Filesystem
    {
        if (!array_key_exists($name, (array)config('filesystems.disks', []))) throw InvalidDiskException::notConfigured($name);

        return Storage::disk($name);
    }

    /** Disks a user may upload to (configured AND defined). */
    public function uploadDisks(): array
    {
        return $this->existing((array)config('filemanager.upload_disks', []));
    }

    /** Disks that can be browsed (configured AND defined). */
    public function browseDisks(): array
    {
        return $this->existing((array)config('filemanager.browse_disks', []));
    }

    public function assertUploadDisk(string $disk): void
    {
        if (!in_array($disk, $this->uploadDisks(), true)) throw InvalidDiskException::notAllowed($disk);
    }

    /**
     * Streams the upload to the disk and returns the stored relative path.
     *
     * @throws FileUploadException
     */
    public function store(UploadedFile $file, string $disk, string $directory, string $filename, bool $private = false): string
    {
        $options = $private || config('filemanager.storage.visibility') === 'private'
            ? ['visibility' => 'private']
            : ['visibility' => 'public'];

        $stored = $this->disk($disk)->putFileAs($directory, $file, $filename, $options);

        if (!is_string($stored) || $stored === '') throw new FileUploadException();

        return $stored;
    }

    public function delete(string $disk, string|array $paths): bool
    {
        return $this->disk($disk)->delete($paths);
    }

    public function exists(string $disk, string $path): bool
    {
        return $this->disk($disk)->exists($path);
    }

    /**
     * Picks a file name that does not exist yet. Names from unique strategies
     * skip the disk lookup entirely, which saves a (remote) round trip per upload.
     */
    public function uniqueName(string $disk, string $directory, string $base, string $extension, bool $isUnique, bool $overwrite): string
    {
        $name = "{$base}.{$extension}";

        if ($isUnique || $overwrite)return $name;

        for ($i = 1; $i <= 20; $i++) {
            if (!$this->exists($disk, "{$directory}/{$name}")) return $name;

            $name = "{$base}-{$i}.{$extension}";
        }

        // Packed directory: stop probing and use a random suffix.
        return $base.'-'.Str::lower(Str::random(8)).".{$extension}";
    }

    /** @return list<string> */
    private function existing(array $names): array
    {
        $defined = array_keys((array)config('filesystems.disks', []));

        return array_values(array_intersect(array_filter($names, 'is_string'), $defined));
    }
}
