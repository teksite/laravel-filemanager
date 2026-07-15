<?php

namespace Teksite\FileManager\Http\Controllers\DatabaseFileBrowser;

use Teksite\FileManager\Http\Requests\Api\ApiGetFilesRequest;

class DatabaseBrowserController
{
    public function browser(ApiGetFilesRequest $request)
    {
        $disks = $this->resolveListDisks();
        $mimes = $this->resolveListTypes();

        $allowedDisks = $this->allowedDisks();
        $allowedTypes = $this->allowedTypes();

        $perPage= config('filemanager.per_page' , 25);

        return view('filemanager::db-browser', compact('disks', 'mimes' ,'allowedDisks' ,'allowedTypes' ,'perPage'));
    }

    private function resolveListDisks(): array
    {
        return config('filemanager.disk_list', []);

    }

    private function resolveListTypes(): array
    {
        return config('filemanager.type_list', []);
    }

    private function allowedDisks(): array
    {
        return config('filemanager.allow_upload_disks', []);

    }
    private function allowedTypes(): array
    {
        return config('filemanager.allow_upload_types', []);

    }
}
