<?php

namespace Teksite\FileManager\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\AbstractCursorPaginator;
use Illuminate\Pagination\AbstractPaginator;

class FileCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {

        $paginator = $this->resource;

        if ($paginator instanceof AbstractCursorPaginator) {
            return [
                'files' => $this->collection,
                'meta'  => [
                    'has_more'    => $paginator->hasMorePages(),
                    'next_cursor' => $paginator->nextCursor()?->encode(),
                ],
            ];
        }

        /** @var AbstractPaginator $paginator */
        return [
            'files' => $this->collection,
            'meta'  => [
                'has_more'     => $paginator->hasMorePages(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ];
    }


    /** Prevent Laravel from appending its own "links"/"meta" keys. */
    public function paginationInformation($request, $paginated, $default): array
    {
        return [];
    }
}
