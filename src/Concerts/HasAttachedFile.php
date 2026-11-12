<?php

namespace Teksite\FileManager\Concerts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Models\UploadFileRelation;
use Throwable;

trait HasAttachedFile
{

    public function files(): MorphToMany
    {
        return $this->morphToMany(UploadFile::class, 'model', 'uploaded_files_models', 'model_id', 'file_id')
                    ->using(UploadFileRelation::class)
                    ->withPivot(['collection', 'order', 'name'])
                    ->withTimestamps()
                    ->orderByPivot('order');
    }

    public function filesOfCollection(string $collection): MorphToMany
    {
        return $this->files()->wherePivot('collection', $collection);

    }

    /**
     * @throws Throwable
     */
    public function attachFile(UploadFile $file, ?string $collection = null, ?int $order = null, ?string $name = null): void
    {
        DB::transaction(function () use ($file, $collection, $order, $name) {
            $order ??= $this->nextOrder($collection);

            $this->files()->newPivotStatement()
                 ->where('model_id', $this->getKey())
                 ->where('model_type', $this->getMorphClass())
                 ->where('file_id', $file->getKey())
                 ->when($collection === null, fn ($q) => $q->whereNull('collection'), fn ($q) => $q->where('collection', $collection))
                 ->delete();

            $this->files()->attach($file->getKey(), compact('collection', 'order', 'name'));
        });
    }


    public function detachFile(UploadFile $file, ?string $collection = null): void
    {
        $collection === null
            ? $this->files()->detach($file->getKey())
            : $this->filesOfCollection($collection)->detach($file->getKey());
    }

    /**
     * Replaces the content of a collection with the given ordered file ids.
     *
     * @param iterable<string> $fileIds
     * @throws Throwable
     */
    public function syncFilesOfCollection(iterable $fileIds, string $collection, ?string $name = null): void
    {
        DB::transaction(function () use ($fileIds, $collection, $name) {
            $this->files()->newPivotStatement()
                 ->where('model_id', $this->getKey())
                 ->where('model_type', $this->getMorphClass())
                 ->where('collection', $collection)
                 ->delete();

            $records = [];
            foreach (array_values(array_unique(is_array($fileIds) ? $fileIds : iterator_to_array($fileIds, false))) as $index => $fileId) {
                $records[$fileId] = ['collection' => $collection, 'order' => $index, 'name' => $name];
            }

            if ($records !== []) $this->files()->attach($records);
        });
    }

    public function firstAttachedFile(string $collection): Model|UploadFile|null
    {
        return $this->filesOfCollection($collection)->first();

    }


    /** @return Collection<int, UploadFile> */
    public function attachedFiles(?string $collection = null): Collection
    {
        return $collection === null
            ? $this->files()->get()
            : $this->filesOfCollection($collection)->get();
    }

    public function primaryMedia(): BelongsTo
    {
        return $this->belongsTo(UploadFile::class, 'primary_media_id');
    }


    /** Optional "primary media" shortcut; needs a nullable `primary_media_id` column. */

    private function nextOrder(?string $collection): int
    {
        $max = $this->files()->newPivotStatement()
                    ->where('model_id', $this->getKey())
                    ->where('model_type', $this->getMorphClass())
                    ->when($collection === null, fn ($q) => $q->whereNull('collection'), fn ($q) => $q->where('collection', $collection))
                    ->max('order');

        return $max === null ? 0 : ((int) $max) + 1;
    }


}
