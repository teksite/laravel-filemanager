<?php

namespace Teksite\FileManager\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Gate;

/**
 * Virtual folder. Folders only exist in the database, so moving files between
 * them never touches the storage disk.
 *
 * @property string $id
 * @property string|null $parent_id
 * @property string|int|null $user_id
 * @property string $name
 */
class UploadFolder extends Model
{
    use HasUlids;

    public const MAX_DEPTH = 8;

    protected $table = 'uploaded_folders';

    protected $fillable = ['parent_id', 'user_id', 'name'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function files(): HasMany
    {
        return $this->hasMany(UploadFile::class, 'folder_id');
    }

    public function scopeVisibleTo(Builder $query, ?Authenticatable $user): Builder
    {
        if ($user === null) {
            return $query->whereRaw('1 = 0');
        }

        if (! config('filemanager.authorization.scope_to_owner', true)) {
            return $query;
        }

        $ability = config('filemanager.authorization.admin_ability');

        if ($ability && Gate::forUser($user)->allows($ability)) {
            return $query;
        }

        return $query->where('user_id', $user->getAuthIdentifier());
    }

    /**
     * Ids of this folder's ancestors, nearest first. Bounded by MAX_DEPTH so a
     * corrupted tree can never cause an infinite loop.
     *
     * @return list<string>
     */
    public function ancestorIds(): array
    {
        $ids = [];
        $cursor = $this->parent_id;

        while ($cursor !== null && count($ids) <= self::MAX_DEPTH) {
            $ids[] = $cursor;
            $cursor = self::query()->whereKey($cursor)->value('parent_id');
        }

        return $ids;
    }
}
