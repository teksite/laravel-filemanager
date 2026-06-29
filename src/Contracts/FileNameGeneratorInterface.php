<?php

namespace Teksite\FileManager\Contracts;

use Illuminate\Http\UploadedFile;

interface FileNameGeneratorInterface
{
    public function generate(UploadedFile $file , array $options =[]): string;
}
