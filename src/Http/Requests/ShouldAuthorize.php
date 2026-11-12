<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Support\Facades\Gate;
use Teksite\FileManager\Models\UploadFile;

trait ShouldAuthorize
{
    public function canUser(string $ability, null|UploadFile $file = null): bool
    {
        //TODO remove or change for dev
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

    public function userAuthorize(string $ability, null|UploadFile $file = null): void
    {
        return ;
         match ($ability) {
            'browse'      => Gate::authorize('browse', UploadFile::class),
            'upload'      => Gate::authorize('upload', UploadFile::class),
            'view'        => Gate::authorize('view', $file),
            'update'      => Gate::authorize('update', $file),
            'delete'      => Gate::authorize('delete', $file),
            'restore'     => Gate::authorize('restore', $file),
            'forceDelete' => Gate::authorize('forceDelete', $file),
        };
    }
}
