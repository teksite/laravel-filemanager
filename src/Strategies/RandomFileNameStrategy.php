<?php

namespace Teksite\FileManager\Strategies;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Teksite\FileManager\Contracts\FileNameGeneratorInterface;

class RandomFileNameStrategy implements FileNameGeneratorInterface
{


    public function generate(UploadedFile $file, array $options = []): string
    {
        $length = (int)($options['length'] ?? config('filemanager.storage.random_length', 32));

        return Str::lower(Str::random(max(8, min($length, 64))));
    }

    public function isUnique(): bool
    {
        return true;
    }
}

