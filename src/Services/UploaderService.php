<?php

namespace Teksite\FileManager\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Teksite\FileManager\Contracts\FileUploaderInterface;
use Teksite\FileManager\DTO\UploadOptions;
use Teksite\FileManager\Events\FileDeleted;
use Teksite\FileManager\Events\FileDeleting;
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
    public function upload(UploadedFile $file, UploadOptions|array $options, ?string $title = null, ?int $userId = null): UploadFile
    {
        event(new FileUploading($file));

        return DB::transaction(function () use ($userId, $title, $file, $options) {

            $options = $options instanceof UploadOptions ? $options : UploadOptions::fromArray($options);

            $disk = $options->disk ?? config('filemanager.default_store_disk');

            if (!array_key_exists($disk, config('filesystems.disks', []))) throw new InvalidDiskException();


            $strategy = FileNameResolver::resolve($options->strategy);

            $name = $strategy->generate($file, ['slugify' => $options->slugify, 'length' => $options->length]);

            $extension = $file->extension();

            $path = $this->storage->normalizePath($options->path);

            $fullName = $this->storage->resolveName($name, $extension, $path, $disk, $options->overwrite);

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
                    'user_id'       => $userId,
                ]);
            } catch (\Throwable $e) {
                if (isset($stored)) $this->storage->delete($disk, $stored);
                Log::error($e);
                throw $e;
            }
            event(new FileUploaded($upload));
            return $upload;
        });
    }


    public function delete(UploadFile $file): ?bool
    {
        event(new FileDeleting($file));
        try {
            $result = $file->delete();
        } catch (\Throwable $e) {
            Log::error($e);
            return false;
        }
        event(new FileDeleted($file));
        return $result;
    }


    public function deleteByPath(string $path, string $disk): ?bool
    {
        try {
            $this->storage->delete($disk, $path);
            UploadFile::query()->where('path', $path)->where('disk', $disk)->delete();
            return true;
        } catch (\Throwable $e) {
            Log::error($e);
            return false;
        }
    }


}
