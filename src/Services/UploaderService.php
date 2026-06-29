<?php

namespace Teksite\FileManager\Services;

use Teksite\FileManager\Contracts\FileUploaderInterface;
use Teksite\FileManager\DTO\UploadOptions;

class UploaderService implements FileUploaderInterface
{
    public function __construct(FileStorageService $storage) {}

    public function upload(\Illuminate\Http\UploadedFile $file, UploadOptions|array $options): \Teksite\FileManager\Models\UploadFile
    {

        event( new FileUploading($file) );

        return DB::transaction(
            function () use (
                $file,
                $options
            ) {

                $disk =
                    $options->disk
                    ??
                    config(
                        'file-manager.disk'
                    );

                $strategy =
                    FileNameResolver::resolve();

                $name =
                    $strategy->generate(
                        $file
                    );

                $extension =
                    $file->extension();

                $fullName =
                    "{$name}.{$extension}";

                $path =
                    trim(
                        config(
                            'file-manager.upload_path'
                        )
                        . '/'
                        . $options->path,
                        '/'
                    );

                $stored =
                    $this->storage
                        ->save(
                            $file,
                            $disk,
                            $path,
                            $fullName
                        );

                $upload =
                    UploadFile::create([

                        'original_name' =>
                            $file->getClientOriginalName(),

                        'path' => $stored,

                        'disk' => $disk,

                        'mime_type' =>
                            $file->getMimeType(),

                        'extension' =>
                            $extension,

                        'size' =>
                            $file->getSize(),

                        'hash' =>
                            hash_file(
                                'sha256',
                                $file
                                    ->getRealPath()
                            ),
                    ]);

                event(
                    new FileUploaded(
                        $upload
                    )
                );

                return $upload;
            }
        );
    }
}
