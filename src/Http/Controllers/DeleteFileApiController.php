<?php

namespace Teksite\FileManager\Http\Controllers;

use Teksite\FileManager\Http\Requests\ApiDeleteFilePathRequest;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\UploaderService;

class DeleteFileApiController
{

    public function __construct(protected UploaderService $uploader) {}

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
            $this->uploader->deleteByPath($request->path, $request->disk);
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
