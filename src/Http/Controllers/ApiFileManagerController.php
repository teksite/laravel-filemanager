<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\Request;
use Teksite\FileManager\DTO\UploadOptions;
use Teksite\FileManager\Http\Requests\ApiUploadFileRequest;
use Teksite\FileManager\Http\Resources\FileCollection;
use Teksite\FileManager\Http\Resources\FileResource;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\UploaderService;

class ApiFileManagerController
{

    public function __construct(protected UploaderService $uploader) {
    }

    public function index(Request $request)
    {
    }

    public function show(UploadFile $file)
    {
        $file = FileResource::make($file);
        return response()->json($file)->setStatusCode(200);
    }


    /**
     * @throws \Throwable
     */
    public function store(ApiUploadFileRequest $request)
    {
        $options = UploadOptions::make()
                                ->disk($request->disk ?? config('filemanager.disk' ,'public'))
            ->strategy('original')
                                ->path($request->path ?? '');

        $file = $this->uploader->upload($request->file('file'), $options);

        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully',
            'file' => new FileResource($file),
        ], 201);
    }

    public function uploadByModel(Request $request)
    {


    }

    public function delete(UploadFile|string|array $file)
    {


    }
}
