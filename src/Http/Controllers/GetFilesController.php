<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\Request;
use Teksite\FileManager\Http\Requests\FileIndexRequest;
use Teksite\FileManager\Http\Resources\FileCollection;
use Teksite\FileManager\Http\Resources\FileResource;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\GetFileService;

class GetFilesController
{

    public function __construct(protected GetFileService $getFiles) {}

    public function index(FileIndexRequest $request)
    {
        $files = new FileCollection($this->getFiles->execute($request->validated()));

        return response()->json(
            $files,
       )->setStatusCode(200);

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
