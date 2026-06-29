<?php

namespace Teksite\FileManager\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Teksite\FileManager\Contracts\FileUploaderInterface;
use Teksite\FileManager\DTO\UploadOptions;
use Teksite\FileManager\Events\FileUploaded;
use Teksite\FileManager\Events\FileUploading;
use Teksite\FileManager\Http\Exceptions\InvalidDiskException;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Support\FileNameResolver;

class UploaderService implements FileUploaderInterface
{
    public function __construct(protected FileStorageService $storage) {}

    /**
     * @throws \Throwable
     */
    public function upload(UploadedFile $file, UploadOptions|array $options): UploadFile
    {

        event(new FileUploading($file));
        return DB::transaction(function () use ($file, $options) {
            $optionsArray = $options instanceof UploadOptions ? $options->toArray() : $options;
            $disk = $optionsArray['disk'] ?? config('filemanager.disk', 'public');

            if (!in_array($disk, array_keys(config('filesystems.disks', [])))) throw  new InvalidDiskException();
            $strategy = FileNameResolver::resolve();
            $name = $strategy->generate($file);

            $extension = $file->extension();

            $fullName = "{$name}.{$extension}";

            $path = trim(config('filemanager.upload_path') . '/' . $optionsArray['path'], '/');

            $stored = $this->storage->save($file, $disk, $path, $fullName);

            $upload = UploadFile::query()->create([
                'original_name' => $file->getClientOriginalName(),
                'path'          => $stored,
                'disk'          => $disk,
                'mime_type'     => $file->getMimeType(),
                'size'          => $file->getSize(),
            ]);

            event(new FileUploaded($upload));

            return $upload;
        }
        );
    }
}
