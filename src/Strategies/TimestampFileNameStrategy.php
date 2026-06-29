<?php

namespace Teksite\FileManager\Strategies;

use Illuminate\Http\UploadedFile;
use Teksite\FileManager\Contracts\FileNameGeneratorInterface;

class TimestampFileNameStrategy implements FileNameGeneratorInterface {
    public function generate(UploadedFile $file, ?array $options = null): string
    {
        return now()->timestamp;
    }
}
