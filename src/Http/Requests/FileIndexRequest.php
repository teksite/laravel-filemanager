<?php

namespace Teksite\FileManager\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Teksite\FileManager\Support\AuthorizeRequestResolver;

class FileIndexRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'disk'      => ['nullable', 'string', Rule::in(array_keys(config('filesystems.disks', [])))],
            'search'    => ['nullable', 'string'],
            'mime_type' => ['nullable', 'string', ],
            'per_page'  => ['nullable', 'integer', 'min:1', 'max:100'],

            'user_id' => 'nullable|exists:users,id',
        ];
    }


    protected function generalFailedValidationMessages(): string
    {
        return  trans('failed to get files');
    }

    protected function setAction(): string
    {
        return 'get_all';
    }
}
