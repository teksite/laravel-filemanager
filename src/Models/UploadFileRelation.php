<?php

namespace Teksite\FileManager\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphPivot;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Fillable(['file_id', 'model_type', 'model_id', 'collection', 'order', 'name'])]
class UploadFileRelation extends MorphPivot
{
    protected $table = 'uploaded_files_models';

    public $incrementing = true;
    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(UploadFile::class, 'file_id');
    }

    public function model(): MorphTo
    {
        return $this->morphTo();
    }
}
