<?php

namespace Teksite\FileManager\concerts;

use Teksite\FileManager\Models\UploadFile;

trait HasAttachedFile
{
    public function uploader()
    {
        return $this->morphToMany(UploadFile::class, 'model', 'uploaded_files_models', 'model_id', 'upload_id', '', '')->withPivot(['name']);
    }
}
