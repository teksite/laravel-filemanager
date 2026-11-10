<?php

namespace Teksite\FileManager\Http\Requests\Api;

namespace Teksite\FileManager\Http\Requests\Api;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Teksite\FileManager\DTO\UploadOptions;
use Teksite\FileManager\Http\Requests\BaseApiRequest;
use Teksite\FileManager\Models\UploadFile;
use Teksite\FileManager\Models\UploadFolder;
use Teksite\FileManager\Services\StorageService;

/**
 * The client can choose only the disk, folder and descriptive text. The owner,
 * storage path, name strategy and overwrite behavior are decided by the server.
 */
class StoreFileRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return Gate::allows('upload', UploadFile::class);
    }

    public function rules(): array
    {
        $max = config('filemanager.upload.max_size_kb');
        $fileRules = array_filter(['file', $max ? 'max:'.(int)$max : null]);

        return [
            'file'      => ['required_without:files', ...$fileRules],
            'files'     => ['required_without:file', 'array', 'max:'.(int)config('filemanager.upload.max_files_per_request', 20)],
            'files.*'   => $fileRules,
            'disk'      => ['nullable', 'string', Rule::in(app(StorageService::class)->uploadDisks())],
            'folder_id' => ['nullable', 'string', 'size:26', Rule::exists('uploaded_folders', 'id')],
            'title'     => ['nullable', 'string', 'max:255'],
            'alt'       => ['nullable', 'string', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [function ($validator) {
            if ($validator->errors()->isNotEmpty() || !$this->filled('folder_id'))  return;

            $folder = UploadFolder::query()->find($this->input('folder_id'));

            if ($folder === null || Gate::denies('update', $folder)) {
                $validator->errors()->add('folder_id', __('The selected folder is invalid.'));
            }
        }];
    }

    /** @return list<UploadedFile> */
    public function uploadedFiles(): array
    {
        return array_values(array_filter(
            $this->hasFile('files') ? (array)$this->file('files') : [$this->file('file')],
            fn($file) => $file instanceof UploadedFile
        ));
    }

    public function options(): UploadOptions
    {
        return new UploadOptions(
            disk    : $this->validated('disk'),
            folderId: $this->validated('folder_id'),
            title   : $this->validated('title'),
            alt     : $this->validated('alt'),
            userId  : $this->user()?->getAuthIdentifier(),
        );
    }

    protected function failureMessage(): string
    {
        return __('Failed to upload the file.');
    }
}
