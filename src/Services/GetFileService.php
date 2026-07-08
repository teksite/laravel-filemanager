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

        $allowed = ['id', 'created_at', 'updated_at', 'name', 'size',];

        $column = ltrim($sort, '-');

        if (! in_array($column, $allowed, true)) {
            $column = 'created_at';
        }

        return $this->filter
            ->apply(UploadFile::query(), $filters)
            ->orderBy($column, $direction)
            ->orderBy('id', $direction);

    }

    public function ByCursor(array $filters) :\Illuminate\Pagination\CursorPaginator
    {

        $perPage =$this->resolvePerPage($filters['per_page'] ?? null);
        return $this->filtering($filters)->cursorPaginate($perPage);
    }

    public function ByPagination(array $filters): \Illuminate\Pagination\LengthAwarePaginator
    {
        $perPage =$this->resolvePerPage($filters['per_page'] ?? null);
        return $this->filtering($filters)->paginate($perPage);
    }

    private function resolvePerPage(int|string|null $reqPerPage = null): int
    {
        $reqPerPage = is_null($reqPerPage)
            ? config('filemanager.per_page', 25)
            : (int) $reqPerPage;
        return max(1, min($reqPerPage, 100));
    }

}
