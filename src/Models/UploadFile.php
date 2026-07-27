<?php

namespace Teksite\FileManager\Models;

use Illuminate\Contracts\Filesystem\Cloud;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Number;
use League\Flysystem\FilesystemException;
use LogicException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Teksite\FileManager\Observer\UploadFileObserver;

#[ObservedBy([UploadFileObserver::class])]
#[Fillable(['original_name', 'title', 'path', 'size', 'mime_type', 'disk', 'user_id'])]
class UploadFile extends Model
{
    use HasUlids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $table = 'uploaded_files';

    protected function casts(): array
    {
        return [
            'size'       => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    protected $appends = [
        'url',
    ];

    protected static function booted(): void
    {
        static::updating(function ($model) {
            if ($model->isDirty(['path', 'disk'])) throw new LogicException('Path cannot be changed.');
        });
    }

    public function getUrlAttribute(): ?string
    {
        try {
            return Storage::disk($this->disk)->url($this->path);
        } catch (FilesystemException $e) {
            report($e);
            return null;
        }
    }


    public function getHumanSizeAttribute(): string
    {
        return Number::fileSize($this->size);
    }

    public function relations()
    {
        return $this->hasMany(UploadFileRelation::class, 'file_id');
    }

    public function scopeImages($query)
    {
        return $query->where('mime_type', 'like', 'image/%');
    }

    public function scopeVideos($query)
    {
        return $query->where('mime_type', 'like', 'video/%');
    }

    public function scopeOfMimeType($query, string $mime)
    {
        return $query->where('mime_type', $mime);
    }

    public function scopeOrphan($query)
    {
        return $query->whereDoesntHave('relations');
    }


    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(config('auth.providers.users.model'), 'user_id', 'id');
    }


    public function readStream(): mixed
    {
        if (! Storage::disk($this->disk)->exists($this->path)) return null;

        return Storage::disk($this->disk)->readStream($this->path);
    }

    public function download(): StreamedResponse
    {
        abort_unless(Storage::disk($this->disk)->exists($this->path), 404);

        return Storage::disk($this->disk)->download($this->path, $this->original_name);
    }


    public function temporaryUrl($expiration = 60): string
    {
        $disk = Storage::disk($this->disk);

        return $disk instanceof Cloud
            ? $disk->temporaryUrl($this->path, now()->addMinutes($expiration))
            : $disk->url($this->path);
    }


}
