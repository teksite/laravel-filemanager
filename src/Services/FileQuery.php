<?php

namespace Teksite\FileManager\Services;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Teksite\FileManager\Models\UploadFile;

/** Builds the (always permission scoped) file listing query. */
class FileQuery
{
    /** Sortable columns. Only indexed / low cardinality-safe columns are exposed. */
    public const array SORTABLE = ['created_at', 'updated_at', 'original_name', 'size'];

    /** Columns needed to render a listing; heavy ones (description, meta) are skipped. */
    private const array LIST_COLUMNS = [
        'id', 'user_id', 'folder_id', 'original_name', 'title', 'alt', 'path', 'disk',
        'mime_type', 'extension', 'size', 'width', 'height', 'variants', 'created_at', 'updated_at', 'deleted_at',
    ];

    public function __construct(protected StorageService $storage) {}

    /**
     * @param array<string, mixed> $filters
     */
    public function query(array $filters, ?Authenticatable $user): Builder
    {
        $query = UploadFile::query()->select(self::LIST_COLUMNS)->visibleTo($user);

        $this->applyDisk($query, $filters['disk'] ?? null);
        $this->applyTrash($query, $filters['trashed'] ?? null);

        $query->when(!empty($filters['type']), fn(Builder $q) => $q->ofType((array)$filters['type']))
              ->when(!empty($filters['search']), fn(Builder $q) => $q->search($filters['search']))
              ->when(array_key_exists('folder_id', $filters), function (Builder $q) use ($filters) {
                  $folder = $filters['folder_id'];
                  $folder === null || $folder === 'root'
                      ? $q->whereNull('folder_id')
                      : $q->where('folder_id', $folder);
              });

        [$column, $direction] = $this->resolveSort($filters['sort'] ?? null);

        return $query->orderBy($column, $direction)->orderBy('id', $direction);
    }

    /** @param array<string, mixed> $filters */
    public function cursor(array $filters, ?Authenticatable $user): CursorPaginator
    {
        return $this->query($filters, $user)->cursorPaginate($this->perPage($filters));
    }

    /** @param array<string, mixed> $filters */
    public function paginate(array $filters, ?Authenticatable $user): LengthAwarePaginator
    {
        return $this->query($filters, $user)->paginate($this->perPage($filters));
    }

    private function applyDisk(Builder $query, ?string $requested): void
    {
        $allowed = $this->storage->browseDisks();

        $disks = $requested !== null ? array_values(array_intersect([$requested], $allowed)) : $allowed;

        $disks === [] ? $query->whereRaw('1 = 0') : $query->whereIn('disk', $disks);
    }

    private function applyTrash(Builder $query, ?string $mode): void
    {
        match ($mode) {
            'only'  => $query->onlyTrashed(),
            'with'  => $query->withTrashed(),
            default => null,
        };
    }

    /** @return array{0: string, 1: string} */
    private function resolveSort(?string $sort): array
    {
        $sort ??= '-created_at';
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-+');

        return [in_array($column, self::SORTABLE, true) ? $column : 'created_at', $direction];
    }

    /** @param array<string, mixed> $filters */
    private function perPage(array $filters): int
    {
        $max = (int)config('filemanager.max_per_page', 100);
        $perPage = (int)($filters['per_page'] ?? config('filemanager.per_page', 25));

        return max(1, min($perPage, $max));
    }
}
