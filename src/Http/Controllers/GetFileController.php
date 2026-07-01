<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\Request;
use Teksite\FileManager\Http\Filters\GetFileFilter;
use Teksite\FileManager\Http\Requests\FileIndexRequest;
use Teksite\FileManager\Http\Resources\FileCollection;
use Teksite\FileManager\Http\Resources\FileResource;
use Teksite\FileManager\Models\UploadFile;

class GetFileController
{

    public function __construct(protected GetFileFilter $uploader) {}

    public function index(FileIndexRequest $request)
    {
        return new FileCollection($this->getFiles->execute($request->validated()));
    }

    public function show(UploadFile $file)
    {
        $file = FileResource::make($file);
        return response()->json([
            'success' => true,
            'message' => 'done',
            'file'    => new FileResource($file),
        ])->setStatusCode(200);
    }

}
