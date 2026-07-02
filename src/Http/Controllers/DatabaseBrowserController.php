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

        $diskForUploads = $this->chosenMimes();

        return view('filemanager::browser', compact('disks', 'mimes'));
    }

    private function chosenDisks(): array
    {
        return config('filemanager.disk_list', []);

    }

    private function chosenMimes(): array
    {
        return config('filemanager.type_list', []);
    }

    private function allowedDisk(): array
    {
        return config('filemanager.disk_list', []);

    }
}
