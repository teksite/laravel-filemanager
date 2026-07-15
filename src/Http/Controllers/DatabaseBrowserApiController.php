<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\Request;
use Teksite\FileManager\Http\Requests\FileIndexRequest;
use Teksite\FileManager\Http\Requests\PopupFileIndexRequest;
use Teksite\FileManager\Http\Requests\ShowRequest;
use Teksite\FileManager\Http\Resources\FileCollection;
use Teksite\FileManager\Http\Resources\FileResource;
use Teksite\FileManager\Http\Resources\PaginateFileCollection;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\GetFileService;

class DatabaseBrowserApiController
{
    public function browser(PopupFileIndexRequest $request)
    {
        dd($request->array());
        $disks = $this->resolveListDisks();
        $mimes = $this->resolveListTypes();

        $allowedDisks = $this->allowedDisks();
        $allowedTypes = $this->allowedTypes();

        $perPage= config('filemanager.per_page' , 25);

        return view('filemanager::browser', compact('disks', 'mimes' ,'allowedDisks' ,'allowedTypes' ,'perPage'));
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
