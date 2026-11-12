<?php

namespace Teksite\FileManager\Models;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Filesystem\Cloud;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Number;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Teksite\FileManager\Enums\MediaType;
use Teksite\FileManager\Observer\UploadFileObserver;
use Illuminate\Database\Eloquent\Builder;

use Throwable;

#[ObservedBy([UploadFileObserver::class])]
#[Fillable(['user_id', 'folder_id', 'original_name', 'title', 'alt', 'description', 'path', 'disk', 'mime_type', 'extension', 'size', 'hash', 'width', 'height', 'variants', 'meta',])]
class UploadFile extends Model
{
    use HasUlids, SoftDeletes;

    public    $incrementing = false;
    protected $keyType      = 'string';

    protected $table = 'uploaded_files';

    protected function casts(): array
    {
        return [
            'size'     => 'integer',
            'width'    => 'integer',
            'height'   => 'integer',
            'variants' => 'json',
            'meta'     => 'json',
        ];
    }

    protected static function booted(): void
    {
        static::updating(static function (self $file) {
            if ($file->isDirty(['path', 'disk', 'hash', 'mime_type', 'size'])) throw new \LogicException('The stored file cannot be changed, upload a new file instead.');
        });

        // Physical cleanup lives on the model so it also runs when application
        // code calls forceDelete() directly (not only through the service).
        static::forceDeleted(static function (self $file) {

            if (!config('filemanager.storage.delete_physical', true)) return;

            try {
                Storage::disk($file->disk)->delete($file->allPaths());
            } catch (Throwable $e) {
                report($e);
            }
        });
    }


    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */


    public function folder(): BelongsTo
    {
        return $this->belongsTo(UploadFolder::class, 'folder_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(config('filemanager.user_model') ?: config('auth.providers.users.model'), 'user_id');
    }

    public function models(): HasMany
    {
        return $this->hasMany(UploadFileRelation::class, 'file_id');
    }


    /*
   |--------------------------------------------------------------------------
   | Scopes
   |--------------------------------------------------------------------------
   */

    public function scopeOfType(Builder $query, string|array $types): Builder
    {
        $patterns = collect((array)$types)
            ->flatMap(fn(string $type) => MediaType::patternsFor($type))
            ->unique()
            ->values();

        if ($patterns->isEmpty()) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where(function (Builder $q) use ($patterns) {
            foreach ($patterns as $pattern) {
                str_contains($pattern, '%')
                    ? $q->orWhere('mime_type', 'like', $pattern)
                    : $q->orWhere('mime_type', $pattern);
            }
        });
    }

    public function scopeImages(Builder $query): Builder
    {
        return $query->ofType('image');
    }

    public function scopeVideos(Builder $query): Builder
    {
        return $query->ofType('video');
    }

    public function scopeOrphan(Builder $query): Builder
    {
        return $query->whereDoesntHave('models');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string)$term);

        if ($term === '') return $query;

        $like = '%'.addcslashes($term, '%_\\').'%';

        return $query->where(fn(Builder $q) => $q
            ->where('id', $term)
            ->orWhere('title', 'like', $like)
            ->orWhere('original_name', 'like', $like)
            ->orWhere('alt', 'like', $like));
    }

    /** Restricts the query to what the given user is allowed to see. */
    public function scopeVisibleTo(Builder $query, ?Authenticatable $user): Builder
    {
        if ($user === null) return $query->whereRaw('1 = 0');

        if (!config('filemanager.authorization.scope_to_owner', true)) return $query;

        $ability = config('filemanager.authorization.admin_ability');

        if ($ability && Gate::forUser($user)->allows($ability)) return $query;


        return $query->where('user_id', $user->getAuthIdentifier());
    }


    /*
    |--------------------------------------------------------------------------
    | Accessors & helpers
    |--------------------------------------------------------------------------
    */

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    public function isPrivate(): bool
    {
        return config('filemanager.storage.visibility') === 'private'
            || config("filesystems.disks.{$this->disk}.visibility") === 'private';
    }

    public function humanSize(): string
    {
        return Number::fileSize($this->size);
    }

    /**
     * Public URL of the file (or of one of its generated variants). Private
     * files get a temporary URL when the disk supports it, otherwise a
     * permission checked download route.
     */
    public function url(?string $variant = null): ?string
    {
        $path = $variant !== null ? ($this->variants[$variant]['path'] ?? $this->path) : $this->path;

        try {
            $disk = Storage::disk($this->disk);

            if (!$this->isPrivate()) return $disk->url($path);

            if (method_exists($disk, 'providesTemporaryUrls') && $disk->providesTemporaryUrls()) {
                return $disk->temporaryUrl($path, now()->addMinutes((int)config('filemanager.storage.temporary_url_ttl', 15)));
            }

            return route(config('filemanager.routes.api.name').'serve', array_filter(['file' => $this->getKey(), 'variant' => $variant]));
        } catch (Throwable $e) {
            report($e);

            return null;
        }
    }

    /** URL of a generated variant, falling back to the original. */
    public function thumbnailUrl(string $variant = 'thumb'): ?string
    {
        return $this->url(isset($this->variants[$variant]) ? $variant : null);
    }

    public function readStream(): mixed
    {
        return Storage::disk($this->disk)->readStream($this->path);
    }

    public function download(): StreamedResponse
    {
        return Storage::disk($this->disk)->download($this->path, $this->original_name);
    }

    /** Every physical path that belongs to this record (original + variants). */
    public function allPaths(): array
    {
        return array_values(array_filter([
            $this->path,
            ...collect($this->variants ?? [])->pluck('path')->all(),
        ]));
    }
}
