<?php

namespace Teksite\FileManager\Strategies;

use Illuminate\Http\UploadedFile;
use Teksite\FileManager\Contracts\FileNameGeneratorInterface;

class OriginalFileNameStrategy implements FileNameGeneratorInterface
{
    public function generate(UploadedFile $file, array $options = []): string
    {
        $name = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $shouldSlugify = (isset($options['slugify']) && is_bool($options['slugify'])) ? $options['slugify'] : config('filemanager.slugify_name', true);
        return $shouldSlugify ? \Str::slug($name) : $name;
    }
}
