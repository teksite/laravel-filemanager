<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Validation\Rule;

class ApiDeleteFilePathRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'path' => ['required', 'string', 'max:255'],
            'disk' => ['nullable', 'string', Rule::in(array_keys(config('filesystems.disks', [])))],
        ];
    }

    protected function generalFailedValidationMessages(): string
    {
        return trans('failed to delete the file');
    }

    protected function setAction(): string
    {
        return 'update';
    }
}
