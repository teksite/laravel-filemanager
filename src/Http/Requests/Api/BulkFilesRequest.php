<?php

namespace Teksite\FileManager\Http\Requests\Api;


use Teksite\FileManager\Http\Requests\BaseApiRequest;

class BulkFilesRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'ids'       => ['required', 'array', 'min:1', 'max:100'],
            'ids.*'     => ['required', 'string', 'size:26', 'distinct'],
            'folder_id' => ['sometimes', 'nullable', 'string', 'size:26', 'exists:uploaded_folders,id'],
            'permanent' => ['sometimes', 'boolean'],
        ];
    }

    protected function failureMessage(): string
    {
        return __('The bulk action failed.');
    }
}
