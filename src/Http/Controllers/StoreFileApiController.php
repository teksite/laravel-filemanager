<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Teksite\FileManager\DTO\UploadOptions;
use Teksite\FileManager\Http\Requests\ApiUploadFileRequest;
use Teksite\FileManager\Http\Resources\FileResource;
use Teksite\FileManager\Services\UploaderService;

class StoreFileApiController
{

    public function __construct(protected UploaderService $uploader) {}


    /**
     * @throws \Throwable
     */
    public function store(ApiUploadFileRequest $request)
    {
        try {
            $options = UploadOptions::fromArray($request->validated());

            $userId = $request->user_id  ?? auth()->id();

            $file = $this->uploader->upload($request->file('file'), $options, $request->title, $userId);

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'file'    => new FileResource($file),
            ], 201);
        } catch (\Exception $e) {
            Log::error($e);

            return response()->json([
                'success' => false,
                'message' => 'File uploaded failed',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

}
