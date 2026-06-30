<?php

namespace Teksite\FileManager\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Teksite\FileManager\Contracts\FileUploaderInterface;
use Teksite\FileManager\DTO\UploadOptions;
use Teksite\FileManager\Events\FileUploaded;
use Teksite\FileManager\Events\FileUploading;
use Teksite\FileManager\Http\Exceptions\FileUploadException;
use Teksite\FileManager\Http\Exceptions\InvalidDiskException;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Support\FileNameResolver;

class UploaderService implements FileUploaderInterface
{
    public function __construct(protected FileStorageService $storage) {}

    /**
     * @throws \Throwable
     */
    public function upload(UploadedFile $file, UploadOptions|array $options, ?string $title = null): UploadFile
    {
        event(new FileUploading($file));

        return DB::transaction(function () use ($title, $file, $options) {

            $options = $options instanceof UploadOptions ? $options : UploadOptions::fromArray($options);

            $disk = $options->disk ?? config('filemanager.default_store_disk');

            if (!array_key_exists($disk, config('filesystems.disks', []))) throw new InvalidDiskException();


            $strategy = FileNameResolver::resolve($options->strategy);

            $name = $strategy->generate($file ,['slugify' => $options->slugify, 'length' => $options->length] );

            $extension = $file->extension();

            $path = $this->normalizePath($options->path);

            $fullName = $this->resolveName($name, $extension, $path, $disk, $options->overwrite);
            try {
                $stored = $this->storage->save($file, $disk, $path, $fullName);
                if (!$stored) throw new FileUploadException();

                $upload = UploadFile::query()->create([
                    'original_name' => $file->getClientOriginalName(),
                    'path'          => $stored,
                    'disk'          => $disk,
                    'mime_type'     => $file->getMimeType(),
                    'size'          => $file->getSize(),
                    'title'         => $title,
                ]);
            } catch (\Throwable $e) {
                if (isset($stored)) $this->storage->delete($disk, $stored);
                throw $e;
            }
            event(new FileUploaded($upload));
            return $upload;
        });
    }

    private function resolveName(string $name, string $extension, string $path, $disk, ?bool $overwrite = null): string
    {
        $shouldOverWrite = is_null($overwrite) ? config('filemanager.overwrite', false) : $overwrite;

        if ($shouldOverWrite) return "$name.$extension";

        $counter = 1;

        $filename = "{$name}.{$extension}";
        while (Storage::disk($disk)->exists("{$path}/{$filename}")) {
            $filename = "{$name}-{$counter}.{$extension}";
            $counter++;
        }
        return $filename;
    }

    private function normalizePath(?string $path = null, array $variables = []): string
    {
        if ($path) {
            $path= trim($path);
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
}
