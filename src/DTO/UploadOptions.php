<?php

namespace Teksite\FileManager\DTO;

class UploadOptions
{
    public function __construct(
        public ?string $disk = null,
        public ?string $path = null,
        public ?string $title = null,
        public bool    $overwrite = false,
        public bool    $keepName = false,
        public bool    $slugify = false
    ) {}

    public static function make(): static
    {
        return new static();
    }

    public function disk(string $disk): static
    {
        $this->disk = $disk;
        return $this;
    }

    public function path(string $path): static
    {
        $this->path = $path;
        return $this;
    }

    public function overwrite(bool $state = true): static
    {
        $this->overwrite = $state;
        return $this;
    }

    public function keepName(bool $state = true): static
    {
        $this->keepName = $state;
        return $this;
    }

    public function slugify(bool $state = true): static
    {
        $this->slugify = $state;
        return $this;
    }

    public function toArray(): array
    {
        return [
            'disk' => $this->disk,
            'path' => $this->path,
            'title' => $this->title,
            'overwrite' => $this->overwrite,
            'keepName' => $this->keepName,
            'slugify' => $this->slugify,
        ];
    }
}
