<?php

namespace Teksite\FileManager\Services;

use Teksite\FileManager\Http\Filters\GetFileFilter;
use Teksite\FileManager\Models\UploadFile;

class GetFileService
{
    public function __construct(protected GetFileFilter $filter) {}

    private function filtering(array $filters): \Illuminate\Database\Eloquent\Builder
    {
        $sort = $filters['sort'] ?? '-created_at';

        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';

        $column = ltrim($sort, '-');

        return $this->filter
            ->apply(UploadFile::query(), $filters)
            ->orderBy($column, $direction);

    }

    public function ByCursor(array $filters) :\Illuminate\Pagination\CursorPaginator
    {

        $perPage = min($filters['per_page'] ?? config('filemanager.per_page', 50), 100);
        return $this->filtering($filters)->cursorPaginate($perPage);
    }

    public function ByPagination(array $filters): \Illuminate\Pagination\LengthAwarePaginator
    {
        $perPage = min($filters['per_page'] ?? config('filemanager.per_page', 50), 100);
        return $this->filtering($filters)->paginate($perPage);
    }

}
