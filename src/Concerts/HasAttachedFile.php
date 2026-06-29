<?php

namespace Teksite\FileManager\Concerts;

use Teksite\FileManager\Models\UploadFile;

trait HasAttachedFile
{
    public function uploader()
    {
        return $this->morphToMany(UploadFile::class, 'model', 'uploaded_files_models', 'model_id', 'upload_id', '', '')->withPivot(['name']);
    }
}
