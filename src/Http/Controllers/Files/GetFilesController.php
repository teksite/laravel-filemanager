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

class GetFilesController
{

    public function __construct(protected GetFileService $getFiles) {}

    public function index(FileIndexRequest $request)
    {

        $type = strtolower(trim($request->input('type', 'cursor')));

        if ($type === 'pagination') {
            $files = new PaginateFileCollection($this->getFiles->ByPagination($request->validated()));
            return response()->json($files)->setStatusCode(200);
        }

        $files = new FileCollection($this->getFiles->ByCursor($request->validated()));
        return response()->json($files)->setStatusCode(200);
    }


    public function show(ShowRequest $request, UploadFile $file)
    {
        $file = FileResource::make($file);

        return response()->json([
            'success' => true,
            'message' => 'done',
            'file'    => new FileResource($file),
        ])->setStatusCode(200);
    }

}
