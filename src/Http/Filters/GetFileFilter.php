<?php

namespace Teksite\FileManager\Http\Filters;

use Illuminate\Database\Eloquent\Builder;

class GetFileFilter
{
    public function apply(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['disk'] ?? (count(config('filemanager.list_disk', []))),
                fn(Builder $q, $disk) => $q->whereIn('disk', (array)$disk)
            )->when($filters['search'] ?? null,
                fn(Builder $q, $search) => $q->where(function (Builder $query) use ($search) {
                    $query->where('id', "$search")
                          ->orWhere('title', 'like', "%{$search}%")
                          ->orWhere('original_name', 'like', "%{$search}%");
                })
            )->when($filters['mime_type'] ?? null,
                fn(Builder $q, $mime) => $q->where('mime_type', $mime)
            );
    }
}
