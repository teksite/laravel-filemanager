<?php

namespace Teksite\FileManager\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class FileCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {


        return [
            'files' =>  FileResource::collection( $this->collection ),
            'meta' => [
                'has_more'=> $this->hasMorePages(),
                'next_cursor'=> optional($this->nextCursor())->encode(),
            ],
        ];
    }
}
