<?php

namespace Teksite\FileManager\Contracts;

use Illuminate\Http\UploadedFile;

interface FileNameGeneratorInterface
{
    /**
     * Generate the base name (without extension) for a stored file.
     *
     * @param  array{slugify?: bool|null, length?: int|null}  $options
     */
    public function generate(UploadedFile $file, array $options = []): string;

    /**
     * Whether generated names are unique by construction. When false the
     * storage layer checks the disk for collisions before saving.
     */
    public function isUnique(): bool;
}
