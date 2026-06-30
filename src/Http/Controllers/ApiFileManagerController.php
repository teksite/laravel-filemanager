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

    public function __construct(protected UploaderService $uploader) {}

    public function index(Request $request) {}

    public function show(UploadFile $file)
    {
        $file = FileResource::make($file);
        return response()->json([
            'success' => true,
            'message' => 'done',
            'file'    => new FileResource($file),
        ])->setStatusCode(200);
    }


    /**
     * @throws \Throwable
     */
    public function store(ApiUploadFileRequest $request)
    {
        try {
            $options = UploadOptions::fromArray($request->validated());

            $file = $this->uploader->upload($request->file('file'), $options, $request->title);

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'file'    => new FileResource($file),
            ], 201);
        } catch (\Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => 'File uploaded failed',
                'errors'  => $exception->getMessage(),
            ], 500);
        }
    }

    public function uploadByModel(Request $request) {}

    public function delete(UploadFile $file)
    {
        $file->delete();
        try {
            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully',
                'file'    => null,
            ], 200);
        } catch (\Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => 'deleting File failed',
                'errors'  => $exception->getMessage(),
            ], 500);
        }
    }

    public function deleteByPath($file)
    {

        }
    }
}
