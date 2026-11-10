<?php

namespace Teksite\FileManager\Strategies;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Teksite\FileManager\Contracts\FileNameGeneratorInterface;

class TimestampFileNameStrategy implements FileNameGeneratorInterface {
    public function generate(UploadedFile $file, array $options = []): string
    {
        return (string)Str::uuid();
    }

    public function isUnique(): bool
    {
        return true;
    }
}
