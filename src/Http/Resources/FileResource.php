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
            'original_name' => $this->original_name,
            'title'         => $this->title,
//            'path'          => $this->path,
            'url'           => $this->url,
            'size'          => $this->size,
            'mime_type'     => $this->mime_type,
            'other'         => $this->other,
            'disk'          => $this->disk,
            'created_at'    => $this->created_at,
        ];
    }
}
