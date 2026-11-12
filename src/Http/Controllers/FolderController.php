<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Teksite\FileManager\Http\Requests\Api\FolderRequest;
use Teksite\FileManager\Http\Requests\ShouldAuthorize;
use Teksite\FileManager\Http\Resources\FolderResource;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Models\UploadFolder;
use Teksite\FileManager\Services\FolderService;

class FolderController
{
    use ShouldAuthorize;

    public function __construct(protected FolderService $folders) {}

    public function index(Request $request): JsonResponse
    {
        $this->userAuthorize('browse', UploadFile::class);

        return response()->json([
            'success' => true,
            'folders' => FolderResource::collection($this->folders->tree($this->getUser($request))),
        ]);
    }

    public function store(FolderRequest $request): JsonResponse
    {
        $parentId = $request->validated('parent_id');

        if ($parentId !== null) $this->userAuthorize('update', UploadFolder::query()->findOrFail($parentId));

        $folder = $this->folders->create($request->validated('name'), $parentId, $this->getUser($request));

        return response()->json(['success' => true, 'folder' => new FolderResource($folder)], 201);
    }

    public function update(FolderRequest $request, UploadFolder $folder): JsonResponse
    {
        $this->userAuthorize('update', $folder);

        $data = $request->validated();

        if (array_key_exists('parent_id', $data)) {
            $data['parent_id'] !== null && $this->userAuthorize('update', UploadFolder::query()->findOrFail($data['parent_id']));
            $folder = $this->folders->move($folder, $data['parent_id']);
        }

        if (isset($data['name'])) {
            $folder = $this->folders->rename($folder, $data['name']);
        }

        return response()->json(['success' => true, 'folder' => new FolderResource($folder)]);
    }

    public function destroy(UploadFolder $folder): JsonResponse
    {
        $this->userAuthorize('delete', $folder);

        $this->folders->delete($folder);

        return response()->json(['success' => true]);
    }


    public function getUser(Request $request)
    {
        //Todo Change it
        return \App\Models\User::find(1);
        $request->user();
    }
}
