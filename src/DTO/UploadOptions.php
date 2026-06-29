<?php

namespace Teksite\FileManager\DTO;

class UploadOptions
{
    public function __construct(
        public ?string $disk = null,
        public ?string $path = null,
        public ?string $title = null,
        public ?string $strategy = null,
        public bool    $overwrite = false,
        public bool    $slugify = false,
        public ?int    $length = null,
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

    public function path(?string $path): static
    {
        $this->path = $path;
        return $this;
    }

    public function overwrite(bool $state = true): static
    {
        $this->overwrite = $state;
        return $this;
    }

    public function slugify(bool $state = true): static
    {
        $this->slugify = $state;
        return $this;
    }

    public function strategy(string $strategy = 'uuid'): static
    {
        $this->strategy = $strategy;
        return $this;
    }

    public function length(int $length = 32): static
    {
        $this->length = $length;
        return $this;
    }

    public function toArray(): array
    {
        return [
            'disk'      => $this->disk,
            'path'      => $this->path,
            'title'     => $this->title,
            'overwrite' => $this->overwrite,
            'slugify'   => $this->slugify,
            'length'    => $this->length,
            'strategy'  => $this->strategy,
        ];
    }

    public static function fromArray(array $options = []): static
    {
        return new static(
            disk: $options['disk'] ?? null,
            path: $options['path'] ?? null,
            title: $options['title'] ?? null,
            strategy: $options['strategy'] ?? null,
            overwrite: $options['overwrite'] ?? false,
            slugify: $options['slugify'] ?? false,
        );
    }
}
