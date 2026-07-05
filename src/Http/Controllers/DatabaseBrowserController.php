<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\Request;
use Teksite\FileManager\Http\Requests\FileIndexRequest;
use Teksite\FileManager\Http\Requests\ShowRequest;
use Teksite\FileManager\Http\Resources\FileCollection;
use Teksite\FileManager\Http\Resources\FileResource;
use Teksite\FileManager\Http\Resources\PaginateFileCollection;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\GetFileService;

class DatabaseBrowserController
{
    public function browser(FileIndexRequest $request)
    {
        $disks = $this->chosenDisks();
        $mimes = $this->chosenMimes();

        $allowedDisks = $this->allowedDisks();
        $allowedTypes = $this->allowedTypes();

        return view('filemanager::browser', compact('disks', 'mimes' ,'allowedDisks' ,'allowedTypes'));
    }

    private function chosenDisks(): array
    {
        return config('filemanager.disk_list', []);

    }

    private function chosenMimes(): array
    {
        return config('filemanager.type_list', []);
    }

    private function allowedDisks(): array
    {
        return config('filemanager.allow_upload_disks', []);

    }
    private function allowedTypes(): array
    {
        return config('filemanager.allow_file_types', []);

    }
}
