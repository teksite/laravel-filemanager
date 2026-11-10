<?php

namespace Teksite\FileManager\DTO;

class UploadOptions
{
    public function __construct(
        public ?string $disk = null,
        public ?string $folderId = null,
        public ?string $strategy = null,
        public ?bool $overwrite = null,
        public ?bool $slugify = null,
        public ?int $length = null,
        public ?string $title = null,
        public ?string $alt = null,
        public string|int|null $userId = null,
        public ?string $path = null,
        public bool $visibilityPrivate = false,
    ) {}

    public static function make(): self
    {
        return new self();
    }

    public static function fromArray(array $data): self
    {
        return new self(
            disk     : $data['disk'] ?? null,
            folderId : $data['folder_id'] ?? null,
            strategy : $data['strategy'] ?? null,
            overwrite: isset($data['overwrite']) ? (bool)$data['overwrite'] : null,
            slugify  : isset($data['slugify']) ? (bool)$data['slugify'] : null,
            length   : isset($data['length']) ? (int)$data['length'] : null,
            title    : $data['title'] ?? null,
            alt      : $data['alt'] ?? null,
            userId   : $data['user_id'] ?? null,
            path     : $data['path'] ?? null,
        );
    }

    public function with(mixed ...$changes): self
    {
        return new self(...array_merge(get_object_vars($this), $changes));
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
            'overwrite' => $this->overwrite,
            'slugify'   => $this->slugify,
            'strategy'  => $this->strategy,
            'length'    => $this->length,
        ];
    }


}
