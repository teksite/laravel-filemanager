<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

use Teksite\FileManager\Http\Requests\Api\IndexFilesRequest;
use Teksite\FileManager\Http\Requests\Api\ShowFileRequest;
use Teksite\FileManager\Http\Requests\Api\StoreFileRequest;
use Teksite\FileManager\Http\Requests\Api\UpdateFileRequest;
use Teksite\FileManager\Http\Requests\ShouldAuthorize;
use Teksite\FileManager\Http\Resources\FileCollection;
use Teksite\FileManager\Http\Resources\FileResource;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Models\UploadFolder;
use Teksite\FileManager\Services\FileQuery;
use Teksite\FileManager\Services\UploaderService;

class FileController
{
    use ShouldAuthorize;

    public function __construct(protected UploaderService $uploader, protected FileQuery $files) {}

    public function index(IndexFilesRequest $request): JsonResponse
    {
        $filters = $request->filters();
        $user = $request->user();

        $result = ($filters['mode'] ?? 'cursor') === 'pagination'
            ? $this->files->paginate($filters, $user)
            : $this->files->cursor($filters, $user);

        return (new FileCollection($result))->response();
    }

    public function show(ShowFileRequest $request, UploadFile $file): JsonResponse
    {
        $this->userAuthorize('view', $file);

        return response()->json(['success' => true, 'file' => new FileResource($file)]);
    }

    public function store(StoreFileRequest $request): JsonResponse
    {
        ['uploaded' => $uploaded, 'failed' => $failed] = $this->uploader->uploadMany(
            $request->uploadedFiles(),
            $request->options(),
        );

        if ($uploaded->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => __('Failed to upload the file.'),
                'errors'  => ['file' => array_values($failed)],
            ], 422);
        }
        //TODO remove file or files based on existence of file or files

        return response()->json([
            'success' => true,
            'message' => __('File uploaded successfully.'),
            'file'    => new FileResource($uploaded->first()),
            'files'   => FileResource::collection($uploaded),
            'failed'  => (object)$failed,
        ], 201);
    }

    public function update(UpdateFileRequest $request, UploadFile $file): JsonResponse
    {
        $this->userAuthorize('update', $file);

        $data = $request->validated();

        if (!empty($data['folder_id'])) $this->userAuthorize('update', UploadFolder::query()->findOrFail($data['folder_id']));

        return response()->json([
            'success' => true,
            'message' => __('File updated successfully.'),
            'file'    => new FileResource($this->uploader->update($file, $data)),
        ]);
    }

    public function destroy(UploadFile $file): JsonResponse
    {
        $result = $this->uploader->delete($file);
        return $result
            ? response()->json(['success' => true, 'message' => __('File deleted successfully.')])
            : response()->json(['success' => false, 'message' => __('deleting the file is failed.')]);
    }

    public function restore(UploadFile $file): JsonResponse
    {
        $this->userAuthorize('restore', $file);

        $this->uploader->restore($file);

        return response()->json(['success' => true, 'message' => __('File restored successfully.'), 'file' => new FileResource($file->refresh())]);
    }

    public function forceDestroy(UploadFile $file): JsonResponse
    {
        $this->userAuthorize('forceDelete', $file);

        $this->uploader->forceDelete($file);

        return response()->json(['success' => true, 'message' => __('File permanently deleted.')]);
    }
}
