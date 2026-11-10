<?php

namespace Teksite\FileManager\DTO;

class InspectedFile
{
    public function __construct(
        public string $mime,
        public string $extension,
        public int $size,
        public string $hash,
        public ?int $width = null,
        public ?int $height = null,
    ) {}

    public function isImage(): bool
    {
        return str_starts_with($this->mime, 'image/');
    }


}
