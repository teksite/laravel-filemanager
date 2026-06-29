<?php

namespace Teksite\FileManager\Strategies;

use Illuminate\Http\UploadedFile;
use Teksite\FileManager\Contracts\FileNameGeneratorInterface;

class OriginalFileNameStrategy implements FileNameGeneratorInterface {
    public function generate(UploadedFile $file, array $options = []): string
    {
        $name=pathinfo( $file->getClientOriginalName(), PATHINFO_FILENAME );
        $enableSlugify = isset($options['enable'] ) ? (bool)$options['enable'] : config( 'filemanager.slugify_names' , true);
        return $enableSlugify ? \Str::slug($name) : $name;
    }
}
