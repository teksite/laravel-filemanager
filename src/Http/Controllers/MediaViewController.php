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

class MediaViewController
{


    public function getView(FileIndexRequest $request)
    {
        return view('filemanager.modal', [
            'disks' => config('filemanager.disks'),
            'mimes' => config('filemanager.mimes'),
        ]);
    }
}
