<?php

namespace Teksite\FileManager\Services;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Teksite\FileManager\Http\Exceptions\FolderException;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Models\UploadFolder;
use Teksite\FileManager\Support\FilenameSanitizer;
use Throwable;

class FolderService
{
    /**
     * Flat list of the user's folders with file counts (one query for the whole tree).
     *
     * @return Collection<int, UploadFolder>
     */
    public function tree(?Authenticatable $user): Collection
    {
        return UploadFolder::query()
            ->visibleTo($user)
            ->withCount('files')
            ->orderBy('name')
            ->get(['id', 'parent_id', 'user_id', 'name', 'created_at']);
    }

    public function create(string $name, ?string $parentId, Authenticatable $user): UploadFolder
    {
        $name = FilenameSanitizer::display($name, 100);

        $this->assertNameIsFree($name, $parentId, $user->getAuthIdentifier());
        $this->assertDepth($parentId);

        return UploadFolder::query()->create([
            'name'      => $name,
            'parent_id' => $parentId,
            'user_id'   => $user->getAuthIdentifier(),
        ]);
    }

    public function rename(UploadFolder $folder, string $name): UploadFolder
    {
        $name = FilenameSanitizer::display($name, 100);

        $this->assertNameIsFree($name, $folder->parent_id, $folder->user_id, $folder->getKey());

        $folder->update(['name' => $name]);

        return $folder;
    }

    public function move(UploadFolder $folder, ?string $parentId): UploadFolder
    {
        if ($parentId !== null) {
            $target = UploadFolder::query()->findOrFail($parentId);

            if ($target->getKey() === $folder->getKey() || in_array($folder->getKey(), $target->ancestorIds(), true)) {
                throw FolderException::cycle();
            }
        }

        $this->assertNameIsFree($folder->name, $parentId, $folder->user_id, $folder->getKey());
        $this->assertDepth($parentId);

        $folder->update(['parent_id' => $parentId]);

        return $folder;
    }

    /**
     * Deleting a folder is non-destructive: files and sub folders move up to
     * the parent so a click can never wipe a whole branch of media.
     *
     * @throws Throwable
     */
    public function delete(UploadFolder $folder): void
    {
        DB::transaction(function () use ($folder) {
            UploadFile::query()->where('folder_id', $folder->getKey())->update(['folder_id' => $folder->parent_id]);
            UploadFolder::query()->where('parent_id', $folder->getKey())->update(['parent_id' => $folder->parent_id]);
            $folder->delete();
        });
    }

    private function assertNameIsFree(string $name, ?string $parentId, string|int|null $userId, ?string $ignoreId = null): void
    {
        $exists = UploadFolder::query()
            ->where('name', $name)
            ->where('user_id', $userId)
            ->when($parentId === null, fn ($q) => $q->whereNull('parent_id'), fn ($q) => $q->where('parent_id', $parentId))
            ->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))
            ->exists();

        if ($exists) throw FolderException::duplicate($name);

    }

    private function assertDepth(?string $parentId): void
    {
        if ($parentId === null) return;

        $depth = count(UploadFolder::query()->findOrFail($parentId)->ancestorIds()) + 1;

        if ($depth >= UploadFolder::MAX_DEPTH)throw FolderException::tooDeep(UploadFolder::MAX_DEPTH);

    }
}
