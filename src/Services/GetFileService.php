<?php

namespace Teksite\FileManager\Services;

use Teksite\FileManager\Http\Filters\GetFileFilter;
use Teksite\FileManager\Models\UploadFile;

class GetFileService
{
    public function __construct(protected GetFileFilter $filter) {}

    public function execute(array $filters): \Illuminate\Pagination\CursorPaginator
    {
        $perPage = min($filters['per_page'] ?? config('filemanager.per_page', 50), 100);

        $sort = $filters['sort'] ?? '-created_at';

        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';

        $column = ltrim($sort, '-');

        return $this->filter
            ->apply(UploadFile::query(), $filters)
            ->orderBy($column, $direction)
            ->cursorPaginate($perPage);
    }
}
