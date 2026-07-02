<?php

namespace Teksite\FileManager\Http\Filters;

use Illuminate\Database\Eloquent\Builder;

class GetFileFilter
{
    public function apply(Builder $query, array $filters): Builder
    {
        $this->applyDiskFilter($query, $filters['disk'] ?? null);
        $this->applyMimeFilter($query, $filters['mime_type'] ?? null);
        $this->applySearchFilter($query, $filters['search'] ?? null);
        $this->applyUserFilter($query, $filters['user_id'] ?? null);

        return $query;
    }

    protected function applyDiskFilter(Builder $query, string|array|null $filterDisk): void {

        $allowedDisks = $this->normalizeAllowed(config('filemanager.disk_list', []));

        if (empty($allowedDisks)) return;

        $requested = $this->resolveRequested($filterDisk, $allowedDisks);

        if (empty($requested)) {
            $this->denyQuery($query);
            return;
        }

        $query->whereIn('disk', $requested);
    }

    protected function applyMimeFilter(Builder $query, string|array|null $filterMime): void {

        $allowedTypes = $this->normalizeAllowed(config('filemanager.type_list', []));

        if (empty($allowedTypes)) return;

        $requested = $this->resolveRequested($filterMime, $allowedTypes);

        if (empty($requested)) {
            $this->denyQuery($query);
            return;
        }

        $query->where(function ($q) use ($requested) {
            foreach ($requested as $type) {
                $q->orWhere(
                    'mime_type',
                    'like',
                    "%{$type}%"
                );
            }
        });
    }

    protected function applyUserFilter(Builder $query, int|string|null $userId): void {

        if (!filled($userId)) return;
        $query->where('user_id', $userId);
    }

    protected function applySearchFilter(Builder $query, ?string $search): void {

        if (!filled($search)) return;


        $query->where(function ($q) use ($search) {
            $q->where('id', $search)
              ->orWhere('title', 'like', "%{$search}%")
              ->orWhere('original_name', 'like', "%{$search}%");
        });
    }

    protected function normalizeAllowed(array $items): array
    {
        return array_values(array_filter($items, fn ($item) => !is_null($item)));
    }

    protected function resolveRequested(mixed $requested, array $allowed): array {

        if (is_null($requested)) {
            return $allowed;
        }

        return array_values(array_intersect((array)$requested, $allowed));
    }

    protected function denyQuery(Builder $query): void {
        $query->whereRaw('1 = 0');
    }
}
