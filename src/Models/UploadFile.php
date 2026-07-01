<?php

namespace Teksite\FileManager\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;
use Teksite\FileManager\Observer\UploadFileObserver;

#[ObservedBy([UploadFileObserver::class])]
#[Fillable(['original_name', 'title', 'path', 'size', 'mime_type', 'disk', 'other' ,'user_id'])]
class UploadFile extends Model
{
    use HasUlids;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'uploaded_files';

    protected $appends = [
        'url',
    ];

    protected function casts(): array
    {
        return [
            'other' => 'json',
        ];
    }

    public function models(): \Illuminate\Database\Eloquent\Relations\MorphToMany
    {
        return $this->morphedByMany(Model::class, 'model', 'uploaded_files_models', 'model_id')->withPivot(['name']);
    }


    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(config('auth.providers.users.model'), 'user_id', 'id');
    }
}
