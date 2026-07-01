<?php

namespace Teksite\FileManager\Http\Filters;

use Illuminate\Database\Eloquent\Builder;

class GetFileFilter
{
    public function apply(Builder $query, array $filters): Builder
    {
        $disks = (array)($filters['disk'] ?? config('filemanager.disk_list', []));
        $search = $filters['search'] ?? null;
        $mimeType = $filters['mime_type'] ?? null;
        $userId = $filters['user_id'] ?? null;
        return $query
            ->when(
                !!count($disks),
                fn(Builder $q) => $q->whereIn('disk', $disks)
            )->when(
                !!$search,
                fn(Builder $q) => $q->where(function (Builder $query) use ($search) {
                    $query->where('id', "$search")
                          ->orWhere('title', 'like', "%{$search}%")
                          ->orWhere('original_name', 'like', "%{$search}%");
                })
            )->when(
                !!$mimeType,
                fn(Builder $q, $mime) => $q->where('mime_type', 'like',"%{$mimeType}%")
            )->when(
                !!$userId,
                fn(Builder $q) => $q->where('user_id', $userId)
            );

    }
}
