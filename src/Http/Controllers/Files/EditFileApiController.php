<?php

namespace Teksite\FileManager\Http\Controllers\Files;

use Illuminate\Support\Facades\Log;
use Teksite\FileManager\Http\Requests\Api\ApiUpdateFileRequest;
use Teksite\FileManager\Http\Resources\FileResource;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\UploaderService;

class EditFileApiController
{

    public function __construct(protected UploaderService $uploader) {}


    /**
     * @throws \Throwable
     */
    public function update(ApiUpdateFileRequest $request , UploadFile $file)
    {
        try {

            $file = $this->uploader->update($file, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'File Updated successfully',
                'file'    => new FileResource($file),
            ], 201);
        } catch (\Exception $e) {
            Log::error($e);

            return response()->json([
                'success' => false,
                'message' => 'File Updating failed',
                'errors'  => $e->getMessage(),
            ], 500);
        }
    }

}
