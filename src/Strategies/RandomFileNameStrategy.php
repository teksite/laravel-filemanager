<?php

namespace Teksite\FileManager\Strategies;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Teksite\FileManager\Contracts\FileNameGeneratorInterface;

class RandomFileNameStrategy implements FileNameGeneratorInterface
{
    public function generate(UploadedFile $file , ?array $options = null): string
    {
        $length = $options['length'] ??  config('filemanager.random_length', 32);
        return Str::random($length);
    }
}

