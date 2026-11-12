<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Models\UploadFolder;

trait ShouldAuthorize
{
    //TODO remove or change for dev

    public function canUser(string $ability, string|UploadFolder|UploadFile $subject): bool
    {
        return true;
        return Gate::allows($ability, $subject);
    }

    public function userAuthorize(string $ability, string|UploadFolder|UploadFile $subject): void
    {
        return;
        Gate::authorize($ability, $subject);
    }

}
