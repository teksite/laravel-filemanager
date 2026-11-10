<?php

namespace Teksite\FileManager\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Random\RandomException;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Services\StorageService;

class BrowserController
{
    public function __construct(protected StorageService $storage) {}

    /** Full page browser (embed it in an iframe or open it directly).
     *
     * @throws RandomException
     */
    public function index(): View
    {
        Gate::authorize('browse', UploadFile::class);

        return view('filemanager::page', $this->viewData('fm-'.bin2hex(random_bytes(4))));
    }

    /** HTML fragment used by the modal picker. Only the DOM id is taken from the client. */
    public function popup(Request $request): View
    {
        Gate::authorize('browse', UploadFile::class);

        $id = (string) $request->validate(['id' => ['required', 'string', 'max:64', 'regex:/^[A-Za-z0-9_-]+$/']])['id'];

        return view('filemanager::browser', $this->viewData($id));
    }

    /** @return array<string, mixed> */
    private function viewData(string $id): array
    {
        return [
            'id'           => $id,
            'disks'        => array_merge([null], $this->storage->browseDisks()),
            'mimes'        => array_merge([null], (array) config('filemanager.browse_types', [])),
            'allowedDisks' => $this->storage->uploadDisks(),
            'allowedTypes' => (array) config('filemanager.upload.allowed_types', []),
            'maxSizeKb'    => config('filemanager.upload.max_size_kb'),
            'perPage'      => (int) config('filemanager.per_page', 25),
        ];
    }
}
