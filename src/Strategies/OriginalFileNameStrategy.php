<?php

namespace Teksite\FileManager\Strategies;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Teksite\FileManager\Contracts\FileNameGeneratorInterface;
use Teksite\FileManager\Support\FilenameSanitizer;

class OriginalFileNameStrategy implements FileNameGeneratorInterface
{
    public function generate(UploadedFile $file, array $options = []): string
    {

        $name = pathinfo(FilenameSanitizer::display($file->getClientOriginalName()), PATHINFO_FILENAME);

        $slugify = $options['slugify'] ?? config('filemanager.storage.slugify', true);

        $name = $slugify ? Str::slug($name) : FilenameSanitizer::safe($name);

        // An empty result (e.g. a name made only of symbols) must never become ".ext".
        return $name !== '' ? Str::limit($name, 100, '') : (string)Str::uuid();
    }


    public function isUnique(): bool
    {
        return false;
    }
}
