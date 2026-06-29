<?php

namespace Teksite\FileManager\Services;

use Illuminate\Support\Facades\DB;
use Teksite\FileManager\Contracts\FileUploaderInterface;
use Teksite\FileManager\DTO\UploadOptions;
use Teksite\FileManager\Events\FileUploaded;
use Teksite\FileManager\Events\FileUploading;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Support\FileNameResolver;

class UploaderService implements FileUploaderInterface
{
    public function __construct(FileStorageService $storage) {}

    public function upload(\Illuminate\Http\UploadedFile $file, UploadOptions|array $options): \Teksite\FileManager\Models\UploadFile
    {

        event(new FileUploading($file));

        return DB::transaction(function () use ($file, $options) {
            $optionsArray = $options instanceof UploadOptions ? $options->toArray() : $options;

            $disk = $optionsArray['disk'] ?? config('file-manager.disk', 'public');
            $strategy = FileNameResolver::resolve();
            $name = $strategy->generate($file);

            $extension = $file->extension();

            $fullName = "{$name}.{$extension}";

            $path = trim(config('file-manager.upload_path') . '/' . $optionsArray['path'], '/');

            $stored = $this->storage->save($file, $disk, $path, $fullName);

            $upload = UploadFile::query()->create([
                'original_name' => $file->getClientOriginalName(),
                'path'          => $stored,
                'disk'          => $disk,
                'mime_type'     => $file->getMimeType(),
                'extension'     => $extension,
                'size'          => $file->getSize(),
                'hash'          => hash_file('sha256', $file->getRealPath()),
            ]);

            event(new FileUploaded($upload));

            return $upload;
        }
        );
    }
}
