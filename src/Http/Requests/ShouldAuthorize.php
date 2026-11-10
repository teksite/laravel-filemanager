<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Support\Facades\Gate;
use Teksite\FileManager\Models\UploadFile;

trait ShouldAuthorize
{
    public function canUser(string $ability, null|UploadFile $file = null): bool
    {
return true;
        return match ($ability) {
            'browse'      => Gate::allows('browse', UploadFile::class),
            'upload'      => Gate::allows('upload', UploadFile::class),
            'view'        => Gate::allows('view', $file),
            'update'      => Gate::allows('update', $file),
            'delete'      => Gate::allows('delete', $file),
            'restore'     => Gate::allows('restore', $file),
            'forceDelete' => Gate::allows('forceDelete', $file),
        };
    }
}
