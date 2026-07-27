<?php

namespace Teksite\FileManager\Concerts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Facades\DB;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Models\UploadFileRelation;

trait HasAttachedFile
{

    public function files(): MorphToMany
    {
        return $this->morphToMany(UploadFile::class, 'model', 'uploaded_files_models', null, 'file_id')
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
     * @throws \Throwable
     */
    public function attachFile(UploadFile $file, ?string $collection = null, ?int $order = null, ?string $name = null): void
    {
        DB::transaction(function () use ($file, $collection, $order, $name) {
            $order ??= $this->filesOfCollection($collection)->lockForUpdate()->max('order') + 1;
            $this->files()->attach($file->id, compact('collection', 'order', 'name'));
        });

    }

    public function detachFile(UploadFile $file): void
    {
        $this->files()->detach($file->id);
    }

    /**
     * @throws \Throwable
     */
    public function syncFilesOfCollection(iterable $fileIds, string $collection, ?string $name = null): void
    {
        DB::transaction(function () use ($fileIds, $collection, $name) {
            $this->files()
                 ->newPivotStatement()
                 ->where('model_id', $this->getKey())
                 ->where('model_type', $this->getMorphClass())
                 ->where('collection', $collection)
                 ->delete();

            $records = [];
            foreach (array_values((array)$fileIds) as $index => $fileId) {
                $records[$fileId] = ['collection' => $collection, 'order' => $index, 'name' => $name];
            }

            if ($records) $this->files()->attach($records);
        });
    }

    public function firstAttachedFile(string $collection): Model|UploadFile|null
    {
        return $this->files()
                    ->wherePivot('collection', $collection)
                    ->first();
    }

    public function attachedFiles(?string $collection = null): \Illuminate\Support\Collection
    {
        return $collection === null
            ? $this->files()->get()
            : $this->files()->wherePivot('collection', $collection)->get();
    }


    public function primaryMedia()
    {
        return $this->belongsTo(UploadFile::class , 'primary_media_id');
    }

}
