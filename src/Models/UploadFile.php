<?php

namespace Teksite\FileManager\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Uploader\Enums\DiskType;
use Modules\Uploader\Service\UploaderService;

#[Fillable(['original_name', 'title', 'path', 'size', 'mime_type', 'disk', 'other'])]
class UploadFile extends Model
{
    use HasUlids;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'uploaded_files';


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

    protected static function boot(): void
    {
        parent::boot();

        //TODO remove files as deleted from DB
        /*
            static::deleting(function ($model) {
                $diskType= DiskType::tryFrom($model->disk);
                return (new UploaderService($diskType))->removeFromDisk($model->path);
            });*/
    }
}
