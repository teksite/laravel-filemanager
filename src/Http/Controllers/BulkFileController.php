<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Teksite\FileManager\Http\Requests\Api\BulkFilesRequest;
use Teksite\FileManager\Http\Requests\ShouldAuthorize;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Models\UploadFolder;
use Teksite\FileManager\Services\UploaderService;

class BulkFileController
{
    use ShouldAuthorize;
    public function __construct(protected UploaderService $uploader) {}

    /** Moves many files to the trash (or removes them for good with `permanent`). */
    public function destroy(BulkFilesRequest $request): JsonResponse
    {
        $permanent = $request->boolean('permanent');

        // One query for every id; rows the user cannot see are simply not found.
        $files = UploadFile::query()
            ->when($permanent, fn ($q) => $q->withTrashed())
            ->visibleTo($request->user())
            ->whereKey($request->validated('ids'))
            ->get();

        $files->each(fn (UploadFile $file) => $this->userAuthorize($permanent ? 'forceDelete' : 'delete', $file));

        $count = $this->uploader->deleteMany($files, $permanent);

        return response()->json([
            'success' => true,
            'message' => __(':count file(s) deleted.', ['count' => $count]),
            'deleted' => $files->modelKeys(),
        ]);
    }

    public function move(BulkFilesRequest $request): JsonResponse
    {
        $folderId = $request->validated('folder_id');

        if ($folderId !== null) {
            $this->userAuthorize('update', UploadFolder::query()->findOrFail($folderId));
        }

        $files = UploadFile::query()
            ->visibleTo($request->user())
            ->whereKey($request->validated('ids'))
            ->get();

        $files->each(fn (UploadFile $file) =>$this->userAuthorize('update', $file));

        return response()->json([
            'success' => true,
            'message' => __(':count file(s) moved.', ['count' => $this->uploader->move($files, $folderId)]),
            'moved'   => $files->modelKeys(),
        ]);
    }
}
