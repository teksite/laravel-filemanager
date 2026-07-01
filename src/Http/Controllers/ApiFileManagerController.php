<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\Request;
use Teksite\FileManager\DTO\UploadOptions;
use Teksite\FileManager\Http\Requests\ApiDeleteFilePathRequest;
use Teksite\FileManager\Http\Requests\ApiUploadFileRequest;
use Teksite\FileManager\Http\Resources\FileCollection;
use Teksite\FileManager\Http\Resources\FileResource;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\UploaderService;

class ApiFileManagerController
{

    public function __construct(protected UploaderService $uploader) {}

    public function index(Request $request)
    {

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


    /**
     * @throws \Throwable
     */
    public function store(ApiUploadFileRequest $request)
    {
        try {
            $options = UploadOptions::fromArray($request->validated());

            $userId = $request->user_id
                ?? auth('sanctum')->id()
                ?? auth()->id();

            $file = $this->uploader->upload($request->file('file'), $options, $request->title , $userId);

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

    public function delete(UploadFile $file)
    {
        try {
            $this->uploader->delete($file);
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

    public function deleteByPath(ApiDeleteFilePathRequest $request)
    {
        try {
            $this->uploader->deleteByPath($request->path , $request->disk);
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
}
