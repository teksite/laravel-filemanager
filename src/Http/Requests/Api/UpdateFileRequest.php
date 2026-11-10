<?php

namespace Teksite\FileManager\Http\Requests\Api;


use Teksite\FileManager\Http\Requests\BaseApiRequest;

class UpdateFileRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'alt'         => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'meta'        => ['sometimes', 'nullable', 'array', 'max:20'],
            'meta.*'      => ['nullable', 'string', 'max:500'],
            'folder_id'   => ['sometimes', 'nullable', 'string', 'size:26', 'exists:uploaded_folders,id'],
        ];
    }

    protected function failureMessage(): string
    {
        return __('Failed to update the file.');
    }
}
