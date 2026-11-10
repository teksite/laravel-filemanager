<?php

namespace Teksite\FileManager\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'folder_id'     => $this->folder_id,
            'original_name' => $this->original_name,
            'title'         => $this->title,
            'alt'           => $this->alt,
            'description'   => $this->when(array_key_exists('description', $this->resource->getAttributes()), fn() => $this->description),
            'url'           => $this->url(),
            'thumbnail_url' => $this->isImage() ? $this->thumbnailUrl() : null,
            'size'          => $this->size,
            'human_size'    => $this->humanSize(),
            'mime_type'     => $this->mime_type,
            'extension'     => $this->extension,
            'disk'          => $this->disk,
            'width'         => $this->width,
            'height'        => $this->height,
            'variants'      => collect($this->variants ?? [])->map(fn($v, $name) => [
                'url'    => $this->url($name),
                'width'  => $v['width'] ?? null,
                'height' => $v['height'] ?? null,
                'type'   => $v['type'] ?? null,
            ])->all() ?: (object)[],
            'created_at'    => $this->created_at?->toIso8601String(),
            'updated_at'    => $this->updated_at?->toIso8601String(),
            'deleted_at'    => $this->deleted_at?->toIso8601String(),
        ];
    }
}
