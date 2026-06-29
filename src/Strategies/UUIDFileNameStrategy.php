<?php

namespace Teksite\FileManager\Strategies;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Teksite\FileManager\Contracts\FileNameGeneratorInterface;

class UUIDFileNameStrategy implements FileNameGeneratorInterface {
    public function generate(UploadedFile $file,?array $options = null): string
    {
        return Str::uuid();
    }
}
